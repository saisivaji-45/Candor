// AWS Lambda handler (Node 18+). Turns a nudge TEMPLATE into ElevenLabs speech.
// Privacy by design: it accepts only a template id and a language, never free text,
// so health data cannot be sent through it. The API key stays in environment variables.
const API = 'https://api.elevenlabs.io/v1/text-to-speech';
const TEMPLATES = {
  habit_start: {
    en: "Reminder: tonight's experiment habit starts now.",
    hi: 'याद दिलाना: आज रात के प्रयोग की आदत अभी शुरू करें।',
    kn: 'ನೆನಪಿಸುವಿಕೆ: ಇಂದು ರಾತ್ರಿಯ ಪ್ರಯೋಗದ ಅಭ್ಯಾಸವನ್ನು ಈಗ ಪ್ರಾರಂಭಿಸಿ.',
  },
  check_in: {
    en: "Did you follow tonight's plan? Tap yes or no in the app.",
    hi: 'क्या आपने आज रात की योजना का पालन किया? ऐप में हाँ या ना दबाएँ।',
    kn: 'ನೀವು ಇಂದು ರಾತ್ರಿಯ ಯೋಜನೆಯನ್ನು ಪಾಲಿಸಿದಿರಾ? ಆ್ಯಪ್‌ನಲ್ಲಿ ಹೌದು ಅಥವಾ ಇಲ್ಲ ಒತ್ತಿ.',
  },
};
const cors = { 'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*', 'Access-Control-Allow-Headers': 'content-type' };
const json = (statusCode, obj) => ({ statusCode, headers: { ...cors, 'content-type': 'application/json' }, body: JSON.stringify(obj) });

exports.handler = async (event, deps = {}) => {
  const doFetch = deps.fetch || fetch, env = deps.env || process.env;
  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return json(400, { error: 'invalid JSON' }); }
  const { template, lang } = body;
  if (!Object.hasOwn(TEMPLATES, template) || !Object.hasOwn(TEMPLATES[template], lang)) return json(400, { error: 'unknown template or language' });
  if (!env.ELEVENLABS_API_KEY || !env.ELEVENLABS_VOICE_ID) return json(500, { error: 'server not configured' });
  const r = await doFetch(`${API}/${env.ELEVENLABS_VOICE_ID}`, {
    method: 'POST',
    headers: { 'xi-api-key': env.ELEVENLABS_API_KEY, 'content-type': 'application/json', accept: 'audio/mpeg' },
    body: JSON.stringify({ text: TEMPLATES[template][lang], model_id: env.ELEVENLABS_MODEL_ID || 'eleven_v3' }),
  });
  if (!r.ok) return json(502, { error: 'voice provider error' });
  return { statusCode: 200, isBase64Encoded: true, headers: { ...cors, 'content-type': 'audio/mpeg' }, body: Buffer.from(await r.arrayBuffer()).toString('base64') };
};
exports.TEMPLATES = TEMPLATES;
