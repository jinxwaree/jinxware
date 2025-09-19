import { put, get } from '@vercel/blob';

function unauthorized(res) {
  res.setHeader('WWW-Authenticate', 'Basic realm="Jinxware Admin"');
  return res.status(401).json({ error: 'Unauthorized' });
}

function verifyAuth(req) {
  const hdr = req.headers.authorization || '';
  if (!hdr.startsWith('Basic ')) return null;
  const decoded = Buffer.from(hdr.slice(6), 'base64').toString('utf8');
  const [user, pass] = decoded.split(':');
  if (!user || !pass) return null;
  const U = process.env.ADMIN_USER;
  const P = process.env.ADMIN_PASS;
  if (!U || !P) return null;
  return user === U && pass === P;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (!verifyAuth(req)) return unauthorized(res);

  try {
    const data = req.body || (await new Promise((resolve, reject) => {
      let raw = '';
      req.on('data', chunk => (raw += chunk));
      req.on('end', () => {
        try { resolve(JSON.parse(raw || '[]')); } catch (e) { reject(e); }
      });
    }));
    if (!Array.isArray(data)) return res.status(400).json({ error: 'Expected an array of products' });

    const { url } = await put('products.json', JSON.stringify(data, null, 2), {
      access: 'public',
      contentType: 'application/json'
    });
    return res.status(200).json({ ok: true, url });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to save' });
  }
}
