import { get } from '@vercel/blob';

export default async function handler(req, res) {
  try {
    // Try fetching from Vercel Blob at key 'products.json'
    const blob = await get('products.json').catch(() => null);
    if (blob?.downloadUrl) {
      const r = await fetch(blob.downloadUrl, { cache: 'no-store' });
      const data = await r.json();
      return res.status(200).json(sanitize(data));
    }
  } catch (e) {
    // fall through
  }
  // Fallback: read the bundled static products.json (served as a static file)
  try {
    const r = await fetch(new URL('../../products.json', import.meta.url));
    const data = await r.json();
    return res.status(200).json(sanitize(data));
  } catch (e) {
    return res.status(200).json([]);
  }
}

function sanitize(arr) {
  // Strip any sensitive 'keys' arrays from variants before returning to clients
  if (!Array.isArray(arr)) return [];
  return arr.map(p => ({
    id: p.id,
    name: p.name,
    image: p.image,
    variants: Array.isArray(p.variants) ? p.variants.map(v => ({ sku: v.sku, name: v.name, price: v.price, stock: v.stock ?? (Array.isArray(v.keys) ? v.keys.length : null) })) : []
  }));
}
