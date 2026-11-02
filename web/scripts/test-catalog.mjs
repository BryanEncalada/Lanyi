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
