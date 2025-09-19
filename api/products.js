import { get } from '@vercel/blob';

export default async function handler(req, res) {
  try {
    // Try fetching from Vercel Blob at key 'products.json'
    const url = process.env.BLOB_URL || 'products.json';
    const blob = await get('products.json').catch(() => null);
    if (blob?.downloadUrl) {
      const r = await fetch(blob.downloadUrl, { cache: 'no-store' });
      const data = await r.json();
      return res.status(200).json(data);
    }
  } catch (e) {
    // fall through
  }
  // Fallback: read the bundled static products.json (served as a static file)
  try {
    const r = await fetch(new URL('../../products.json', import.meta.url));
    const data = await r.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(200).json([]);
  }
}
