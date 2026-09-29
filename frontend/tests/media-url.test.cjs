const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function loadModule(file, env = {}) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2020 },
  });
  const exports = {};
  vm.runInNewContext(outputText, { exports, require, URL, process: { env } });
  return exports;
}

const { getMediaUrl } = loadModule('src/lib/api.ts');
test('backend media uses the frontend origin, including old HTTP URLs', () => {
  assert.equal(getMediaUrl('/media/publications/foto.jpg'), '/media/publications/foto.jpg');
  assert.equal(getMediaUrl('http://backend.example/media/foto.png'), '/media/foto.png');
  assert.equal(getMediaUrl('https://backend.example/media/foto.png?v=2'), '/media/foto.png?v=2');
});
test('external images require HTTPS and missing images return null', () => {
  assert.equal(getMediaUrl(null), null);
  assert.equal(getMediaUrl(''), null);
  assert.equal(getMediaUrl('javascript:alert(1)'), null);
  assert.equal(getMediaUrl('http://other.example/foto.jpg'), null);
  assert.equal(getMediaUrl('https://other.example/foto.jpg'), 'https://other.example/foto.jpg');
});
test('backend config normalizes slashes and fails clearly without production configuration', () => {
  assert.equal(loadModule('src/lib/backend.ts', { BACKEND_API_URL: 'https://backend.example/api' }).backendUrl().href, 'https://backend.example/api/');
  assert.equal(loadModule('src/lib/backend.ts', {}).backendUrl().href, 'http://127.0.0.1:8000/api/');
  assert.throws(() => loadModule('src/lib/backend.ts', { NODE_ENV: 'production' }).backendUrl(), /BACKEND_API_URL/);
});
