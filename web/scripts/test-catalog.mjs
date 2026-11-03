import '@angular/compiler';
import { createEnvironmentInjector, runInInjectionContext } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const modules = new Map();
function load(file) {
  if (modules.has(file)) return modules.get(file);
  const exports = {};
  modules.set(file, exports);
  vm.runInNewContext(
    ts.transpileModule(readFileSync(file, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        experimentalDecorators: true,
      },
    }).outputText,
    {
      exports,
      require: (id) =>
        id.startsWith('.') ? load(resolve(dirname(file), id + '.ts')) : require(id),
      window: { location: { origin: 'http://localhost' } },
      URL,
    },
  );
  return exports;
}
const { CatalogService } = load(resolve('src/app/shared/services/catalog.service.ts'));
test('Analytics y SEO solo se habilitan en los dominios públicos autorizados', () => {
  const helpers = load(resolve('src/app/shared/data/site-config.ts'));
  const config = JSON.parse(readFileSync(resolve('public/site-config.json'), 'utf8'));
  for (const host of ['test.lanyipisos.com', 'localhost', 'lanyipisos.com.evil.example']) {
    assert.equal(helpers.canTrack(config, host), false);
    assert.equal(helpers.canIndex(config, host), false);
  }
  assert.equal(helpers.canTrack(config, 'lanyipisos.com'), true);
  assert.equal(
    helpers.publicPageUrl('https://lanyipisos.com', '/pisos?email=privado#x'),
    'https://lanyipisos.com/pisos',
  );
});
function service(config, responses = {}) {
  const client = {
    get(url) {
      if (url === '/catalog-config.json') return of(config);
      if (url.endsWith('/categorias')) return of({ data: [] });
      return responses[url] instanceof Error
        ? throwError(() => responses[url])
        : of(responses[url] ?? { data: [] });
    },
  };
  const injector = createEnvironmentInjector([{ provide: HttpClient, useValue: client }]);
  return runInInjectionContext(injector, () => new CatalogService());
}
test('Sin API conserva 4 pisos y 9 accesorios', () => {
  const c = service({ apiBaseUrl: '' });
  assert.equal(c.floors().length, 4);
  assert.equal(c.accessories().length, 9);
  assert.equal(c.loading(), false);
});
test('Error de API conserva catálogo de respaldo', () => {
  const c = service(
    { apiBaseUrl: '/api', fallbackOnError: true },
    { '/api/pisos': new Error('offline'), '/api/accesorios': new Error('offline') },
  );
  assert.equal(c.floors().length, 4);
  assert.equal(c.accessories().length, 9);
  assert.equal(c.source().pisos, 'fallback');
});
test('Respuesta vacía exitosa no resucita productos', () => {
  const c = service({ apiBaseUrl: '/api' });
  assert.equal(c.floors().length, 0);
  assert.equal(c.accessories().length, 0);
  assert.equal(c.source().pisos, 'api');
});
test('API reemplaza catálogo y rechaza mezcla de tipos', () => {
  const floor = {
    id: 'nuevo',
    name: 'Nuevo piso',
    category: 'pisos',
    imageUrl: 'https://example.test/uploads/piso.jpg',
  };
  const c = service(
    { apiBaseUrl: '/api' },
    { '/api/pisos': { data: [floor] }, '/api/accesorios': { data: [floor] } },
  );
  assert.equal(c.floors().length, 1);
  assert.equal(c.floors()[0].id, 'nuevo');
  assert.equal(c.accessories().length, 9);
});
test('Permite desactivar respaldo para publicación definitiva', () => {
  const c = service(
    { apiBaseUrl: '/api', fallbackOnError: false },
    { '/api/pisos': new Error('offline') },
  );
  assert.equal(c.floors().length, 0);
});

const { matchesProductSearch, colorOptions, categoryQuery } = load(
  resolve('src/app/shared/data/catalog-utils.ts'),
);
test('Búsqueda ignora tildes y mayúsculas y encuentra SKU', () => {
  const p = { name: 'Piso Bambú', sku: 'PIS-987' };
  assert.equal(matchesProductSearch(p, 'bambu'), true);
  assert.equal(matchesProductSearch(p, 'pis-987'), true);
  assert.equal(matchesProductSearch(p, 'cedro'), false);
});
test('Los filtros de color incluyen familias configuradas y unifican variantes', () => {
  const p = {
    colorFamilies: ['Beige', 'Natural', 'Marrón', 'marron', 'Azul'],
    colors: ['#dcc5a6', '#c6a579', '#80512f', '#80512f', '#0000ff'],
  };
  const options = colorOptions([p]);
  assert.equal(options.length, 4);
  assert.equal(options.find((p) => p.name === 'Azul').value, '#0000ff');
});
test('Home aplica filtros de madera, bambú y zócalos', () => {
  assert.equal(categoryQuery('madera').tipo, 'Madera');
  assert.equal(categoryQuery('bambu').tipo, 'Bambú');
  assert.equal(categoryQuery('zocalos').buscar, 'zócalo');
  assert.equal(Object.keys(categoryQuery('accesorios')).length, 0);
});

const { editorialBlocks } = load(resolve('src/app/shared/data/editorial-utils.ts'));
test('Los artículos separan subtítulos y párrafos sin interpretar HTML', () => {
  const blocks = editorialBlocks('## Título\nTexto completo\n\n<script>texto</script>');
  assert.equal(blocks.length, 3);
  assert.equal(blocks[0].heading, true);
  assert.equal(blocks[1].text, 'Texto completo');
  assert.equal(blocks[2].text, '<script>texto</script>');
});

const { menuCategories, categoryDescendants } = load(
  resolve('src/app/shared/data/catalog-utils.ts'),
);
test('Submenús separan pisos y accesorios y enlazan por slug', () => {
  const categories = [
    { id: 1, name: 'Madera', slug: 'madera', kind: 'pisos', parentId: null },
    { id: 2, name: 'Zócalos', slug: 'zocalos', kind: 'accesorios', parentId: null },
  ];
  assert.equal(menuCategories('pisos', categories, []).length, 1);
  assert.equal(menuCategories('pisos', categories, [])[0].query.categoria, 'madera');
  assert.equal(menuCategories('accesorios', categories, [])[0].query.categoria, 'zocalos');
  assert.equal(menuCategories('pisos', [], [{ material: 'Bambú' }])[0].query.tipo, 'Bambú');
  assert.equal(menuCategories('pisos', [], [{ material: 'Bambú' }], true).length, 0);
});
test('La categoría padre incluye descendientes sin mezclar tipos ni aceptar slugs inexistentes', () => {
  const categories = [
    { id: 1, name: 'Madera', slug: 'madera', kind: 'pisos', parentId: null },
    { id: 2, name: 'Nogal', slug: 'nogal', kind: 'pisos', parentId: 1 },
    { id: 3, name: 'Accesorio', slug: 'accesorio', kind: 'accesorios', parentId: null },
  ];
  const ids = categoryDescendants('madera', 'pisos', categories);
  assert.equal(ids.size, 2);
  assert.equal(ids.has(2), true);
  assert.equal(ids.has(3), false);
  assert.equal(categoryDescendants('inexistente', 'pisos', categories).size, 0);
});

const { estimateMaterial, roomPerimeter } = load(
  resolve('src/app/shared/data/material-estimate.ts'),
);
test('El piso calcula material con 10% y precio redondeado a céntimos', () => {
  const estimate = estimateMaterial(3, '69.90');
  assert.equal(estimate.quantity, 3.3);
  assert.equal(estimate.total, 230.67);
  assert.equal(estimate.valid, true);
  assert.equal(estimateMaterial(25, '69.90').total, 1922.25);
});
test('Los accesorios usan perímetro y precio por metro lineal', () => {
  assert.equal(roomPerimeter(5, 4), 18);
  const estimate = estimateMaterial(roomPerimeter(5, 4), '12.50');
  assert.equal(estimate.quantity, 19.8);
  assert.equal(estimate.total, 247.5);
  assert.equal(estimateMaterial(7.35, '5.00').quantity, 8.09);
});
test('Sin precio registrado no se inventa importe y precio cero se respeta', () => {
  assert.equal(estimateMaterial(20).total, null);
  assert.equal(estimateMaterial(20, '').total, null);
  assert.equal(estimateMaterial(20, '12foo').total, null);
  assert.equal(estimateMaterial(20, '-1.00').total, null);
  assert.equal(estimateMaterial(20, '0.00').total, 0);
});
test('Se rechazan medidas inválidas y resultados monetarios fuera del rango seguro', () => {
  for (const value of [0, -5, NaN, Infinity, 0.001, 1000001])
    assert.equal(estimateMaterial(value, '10.00').valid, false);
  assert.equal(roomPerimeter(-1, 4), 0);
  assert.equal(roomPerimeter(0, 4), 0);
  assert.equal(roomPerimeter(Infinity, 4), 0);
  assert.equal(estimateMaterial(1000000, '9999999999.99').total, null);
});
