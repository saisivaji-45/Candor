const assert = require('assert');
const { handler } = require('../cloud/nudge-proxy.js');
const env = { ELEVENLABS_API_KEY: 'test-key', ELEVENLABS_VOICE_ID: 'voice123' };
const post = (obj, fetch) => handler({ body: JSON.stringify(obj) }, { fetch, env });

(async () => {
  let calls = [];
  const ok = async (url, init) => { calls.push({ url, init }); return { ok: true, arrayBuffer: async () => Uint8Array.from([1, 2, 3]).buffer }; };

  let res = await post({ template: 'habit_start', lang: 'hi' }, ok);
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.isBase64Encoded, true);
  assert.strictEqual(res.body, 'AQID');
  assert(calls[0].url.endsWith('/voice123'));
  assert.strictEqual(calls[0].init.headers['xi-api-key'], 'test-key');
  assert(JSON.parse(calls[0].init.body).text.startsWith('याद'));

  // Free text, unknown templates and prototype tricks are rejected and never reach ElevenLabs.
  calls = [];
  for (const bad of [{ text: 'my resting heart rate is 72' }, { template: 'habit_start', lang: 'fr' }, { template: '__proto__', lang: 'en' }, { template: 'check_in', lang: 'constructor' }])
    assert.strictEqual((await post(bad, ok)).statusCode, 400);
  assert.strictEqual(calls.length, 0);

  assert.strictEqual((await post({ template: 'check_in', lang: 'en' }, async () => ({ ok: false }))).statusCode, 502);
  assert.strictEqual((await handler({ body: '{oops' }, { fetch: ok, env })).statusCode, 400);
  assert.strictEqual((await handler({ body: '{"template":"check_in","lang":"en"}' }, { fetch: ok, env: {} })).statusCode, 500);
  console.log('nudge-proxy tests passed');
})();
