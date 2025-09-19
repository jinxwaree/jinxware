import fs from 'fs/promises';

function unauthorized(res) {
  res.setHeader('WWW-Authenticate', 'Basic realm="Jinxware Admin"');
  return res.status(401).send('Unauthorized');
}

function verifyAuth(req) {
  const hdr = req.headers.authorization || '';
  if (!hdr.startsWith('Basic ')) return false;
  const decoded = Buffer.from(hdr.slice(6), 'base64').toString('utf8');
  const [user, pass] = decoded.split(':');
  const U = process.env.ADMIN_USER;
  const P = process.env.ADMIN_PASS;
  return !!U && !!P && user === U && pass === P;
}

export default async function handler(req, res) {
  if (!verifyAuth(req)) return unauthorized(res);
  try {
    // Use import.meta.url so Vercel includes the HTML file in the function bundle
    const fileUrl = new URL('../dash.html', import.meta.url);
    const html = await fs.readFile(fileUrl, 'utf8');
    res.setHeader('content-type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch (e) {
    return res.status(500).send('Failed to load admin UI');
  }
}
