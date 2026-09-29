const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const axios = require('axios');

function setup(initial) {
  const cookies = { ...initial };
  const events = [];
  const exports = {};
  const source = fs.readFileSync(path.join(__dirname, '../src/lib/api.ts'), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2020,
  } });
  vm.runInNewContext(outputText, { exports, URL, Event,
    window: { location: { protocol: 'https:' }, dispatchEvent: event => events.push(event.type) },
    require: name => name === 'js-cookie' ? {
      get: key => cookies[key], set: (key, value) => { cookies[key] = value; }, remove: key => { delete cookies[key]; },
    } : require(name),
  });
  const api = exports.default;
  const response = config => ({ data: { ok: true }, status: 200, statusText: 'OK', headers: {}, config });
  api.defaults.adapter = async config => {
    if (config.headers.Authorization === 'Bearer fresh') return response(config);
    throw new axios.AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, null, { status: 401, data: {}, config });
  };
  return { api, cookies, events, response };
}

test('parallel expired requests share one refresh and retry with the new access token', async () => {
  const { api, cookies } = setup({ access_token: 'expired', refresh_token: 'refresh' });
  const original = axios.post;
  let refreshes = 0;
  axios.post = async () => { refreshes++; await new Promise(resolve => setTimeout(resolve, 5)); return { data: { access: 'fresh' } }; };
  try {
    const results = await Promise.all([api.get('/auth/users/'), api.get('/publications/manage/')]);
    assert.equal(refreshes, 1);
    assert.equal(cookies.access_token, 'fresh');
    assert.equal(results[0].status, 200);
    assert.equal(results[1].status, 200);
  } finally { axios.post = original; }
});

test('network failure during refresh preserves the session', async () => {
  const { api, cookies } = setup({ access_token: 'expired', refresh_token: 'refresh' });
  const original = axios.post;
  axios.post = async () => { throw new axios.AxiosError('Offline', 'ERR_NETWORK'); };
  try {
    await assert.rejects(api.get('/auth/me/'));
    assert.equal(cookies.refresh_token, 'refresh');
  } finally { axios.post = original; }
});

test('a revoked session is cleared when the refreshed access token is still rejected', async () => {
  const { api, cookies, events } = setup({ access_token: 'expired', refresh_token: 'revoked', user_role: 'monitor' });
  const original = axios.post;
  axios.post = async () => ({ data: { access: 'still-invalid' } });
  try {
    await assert.rejects(api.get('/auth/me/'));
    assert.equal(cookies.access_token, undefined);
    assert.equal(cookies.refresh_token, undefined);
    assert.equal(cookies.user_role, undefined);
    assert.ok(events.includes('auth-change'));
  } finally { axios.post = original; }
});

test('a failed login does not attempt token refresh', async () => {
  const { api } = setup({ refresh_token: 'refresh' });
  const original = axios.post;
  let refreshed = false;
  axios.post = async () => { refreshed = true; return { data: { access: 'fresh' } }; };
  try {
    await assert.rejects(api.post('/auth/login/', { username: 'test', password: 'invalid' }));
    assert.equal(refreshed, false);
  } finally { axios.post = original; }
});

test('a refresh finishing after a different login must not replace or erase the new session', async () => {
  const { api, cookies } = setup({ access_token: 'expired', refresh_token: 'old-session' });
  const original = axios.post;
  axios.post = async () => { cookies.refresh_token = 'new-session'; cookies.access_token = 'new-access'; return { data: { access: 'fresh' } }; };
  try {
    await assert.rejects(api.get('/auth/me/'));
    assert.equal(cookies.refresh_token, 'new-session');
    assert.equal(cookies.access_token, 'new-access');
  } finally { axios.post = original; }
});
