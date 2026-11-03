import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtemp, copyFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep, basename } from 'node:path';
import { setTimeout } from 'node:timers/promises';
let temp,
  api,
  php,
  origin,
  exitMessage = '';
before(async () => {
  temp = await mkdtemp(join(tmpdir(), 'lanyi-seo-test-'));
  api = createServer((req, res) => {
    if (req.url === '/api/sitemap.xml') {
      res.setHeader('Content-Type', 'application/xml');
      res.end(
        '<?xml version="1.0"?><urlset><url><loc>https://test.example/blog/articulo</loc></url></urlset>',
      );
      return;
    }
    res.setHeader('Content-Type', 'application/json');
    if (req.url.endsWith('/no-existe')) {
      res.statusCode = 404;
      res.end('{}');
      return;
    }
    res.end(
      JSON.stringify({
        data: {
          id: 'articulo',
          title: 'Título <script>alert(1)</script>',
          name: 'Piso Roble',
          description: 'Descripción & detalle',
          body: '## Contenido\n\nTexto completo.',
          imageUrl: 'https://images.example/portada.jpg',
          seoTitle: '',
          seoDescription: '',
        },
      }),
    );
  });
  await new Promise((r) => api.listen(0, '127.0.0.1', r));
  await copyFile(resolve('public/seo.php'), join(temp, 'seo.php'));
  await copyFile(resolve('public/site-config.json'), join(temp, 'site-config.json'));
  await writeFile(
    join(temp, 'index.html'),
    '<html><head><title>Lanyi</title><meta name="description" content="Inicial"><meta property="og:image" content="vieja.jpg"></head><body><app-root></app-root></body></html>',
  );
  await writeFile(
    join(temp, 'catalog-config.json'),
    JSON.stringify({ apiBaseUrl: 'http://127.0.0.1:' + api.address().port + '/api' }),
  );
  const reservation = createServer();
  await new Promise((r) => reservation.listen(0, '127.0.0.1', r));
  const port = reservation.address().port;
  await new Promise((r) => reservation.close(r));
  origin = 'http://127.0.0.1:' + port;
  php = spawn(process.env.PHP_BINARY || 'php', ['-S', '127.0.0.1:' + port, '-t', temp], {
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  php.on('error', (e) => {
    exitMessage = e.message;
  });
  php.stderr.on('data', (d) => {
    exitMessage += d.toString();
  });
  let ready = false;
  for (let i = 0; i < 60; i++) {
    try {
      await fetch(origin + '/index.html');
      ready = true;
      break;
    } catch {
      await setTimeout(50);
    }
  }
  assert.ok(
    ready,
    'No se pudo iniciar PHP. Define PHP_BINARY con la ruta de php.exe. ' + exitMessage,
  );
});
after(async () => {
  if (php?.pid) {
    php.kill();
    await new Promise((r) => {
      if (php.exitCode !== null) r();
      else php.once('exit', r);
    });
  }
  if (api) await new Promise((r) => api.close(r));
  if (temp) {
    assert.ok(
      resolve(temp).startsWith(resolve(tmpdir()) + sep) &&
        basename(temp).startsWith('lanyi-seo-test-'),
    );
    await rm(temp, { recursive: true, force: true });
  }
});
test('Entrega metadatos iniciales, imagen y contenido escapado sin JavaScript', async () => {
  const r = await fetch(origin + '/seo.php?kind=blog&slug=articulo');
  const html = await r.text();
  assert.equal(r.status, 200);
  assert.match(html, /<title>Título &lt;script&gt;/);
  assert.equal(html.includes('<script>alert(1)</script>'), false);
  assert.match(html, /https:\/\/images.example\/portada.jpg/);
  assert.equal((html.match(/property="og:image"/g) || []).length, 1);
  assert.match(html, /<link rel="canonical"/);
  assert.match(html, /Texto completo/);
});
test('Contenido inexistente devuelve HTTP 404 y noindex', async () => {
  const r = await fetch(origin + '/seo.php?kind=blog&slug=no-existe');
  assert.equal(r.status, 404);
  assert.match(await r.text(), /noindex,follow/);
});
test('Sitemap se obtiene desde el backend público', async () => {
  const r = await fetch(origin + '/seo.php?mode=sitemap');
  assert.equal(r.status, 200);
  assert.match(r.headers.get('content-type'), /application\/xml/);
  assert.match(await r.text(), /https:\/\/test.example\/blog\/articulo/);
});
test('Conserva la landing original y excluye pruebas de indexación', async () => {
  const r = await fetch(origin + '/seo.php?page=piso-laminado');
  const html = await r.text();
  assert.equal(r.status, 200);
  assert.match(html, /<title>Pisos Laminados - Lanyi Pisos<\/title>/);
  assert.match(html, /noindex,follow/);
  assert.match(html, /piso-laminado\//);
  const schema = JSON.parse(html.match(/type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert.ok(schema['@graph'].some((x) => x['@type'] === 'Organization'));
  assert.ok(schema['@graph'].some((x) => x['@type'] === 'BreadcrumbList'));
  assert.equal(html.includes('gtm.js'), false);
});
