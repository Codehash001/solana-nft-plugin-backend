// CORS helper replicating Express config from server.js
const allowedOriginsFromEnv = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const defaultPatterns = [
  /^https?:\/\/localhost(:\d+)?$/,
  /^https:\/\/[a-z0-9-]+\.ngrok(-free)?\.app$/,
  /^https:\/\/[a-z0-9-]+\.ngrok\.io$/,
  /^https?:\/\/solana-plugin\.local(:\d+)?$/,
  /^https?:\/\/(?:[a-z0-9-]+\.)?nfthallyu\.com$/,
  // Expand ALLOWED_ORIGINS entries (supports * wildcards)
  ...allowedOriginsFromEnv.map((o) => {
    const rx = '^' + o
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*') + '$';
    return new RegExp(rx);
  })
];

export function isOriginAllowed(origin) {
  if (!origin) return true; // allow non-browser or same-origin
  return defaultPatterns.some((re) => re.test(origin));
}

export function applyCors(req, res) {
  const origin = req.headers.origin || '';
  if (isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export function handlePreflight(req, res) {
  if (req.method === 'OPTIONS') {
    applyCors(req, res);
    res.status(204).end();
    return true;
  }
  return false;
}
