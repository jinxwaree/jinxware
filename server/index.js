import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;
const API_KEY = process.env.API_KEY || '';
const ORIGIN = process.env.ALLOWED_ORIGIN || '*';

const app = express();
app.use(express.json());
app.use(cors({ origin: ORIGIN === '*' ? true : ORIGIN }));

const DATA_PATH = path.join(__dirname, 'data', 'products.json');

function readData() {
  if (!fs.existsSync(DATA_PATH)) {
    fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
    fs.writeFileSync(DATA_PATH, JSON.stringify({ products: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
}
function writeData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

function auth(req, res, next) {
  const hdr = req.get('authorization') || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : '';
  if (!API_KEY || token !== API_KEY) return res.sendStatus(401);
  next();
}

// GET all products
app.get('/api/products', (req, res) => {
  const data = readData();
  res.json(data.products || []);
});

// Upsert a product
app.post('/api/products', auth, (req, res) => {
  const { id, name, image, description = null, variants = [] } = req.body || {};
  if (!id || !name) return res.status(400).json({ error: 'id and name are required' });
  const data = readData();
  const idx = (data.products || []).findIndex(p => p.id === id);
  const product = { id, name, image, description, variants };
  if (idx >= 0) data.products[idx] = product; else data.products.push(product);
  writeData(data);
  res.sendStatus(204);
});

// Patch product
app.patch('/api/products/:id', auth, (req, res) => {
  const { id } = req.params;
  const patch = req.body || {};
  const data = readData();
  const p = (data.products || []).find(p => p.id === id);
  if (!p) return res.sendStatus(404);
  if (patch.name != null) p.name = patch.name;
  if (patch.image != null) p.image = patch.image;
  if (patch.description != null) p.description = patch.description;
  if (Array.isArray(patch.variants)) p.variants = patch.variants;
  writeData(data);
  res.sendStatus(204);
});

// Add or upsert a variant
app.post('/api/products/:id/variants', auth, (req, res) => {
  const { id } = req.params;
  const { sku, name, price, stock } = req.body || {};
  if (!sku || !name) return res.status(400).json({ error: 'sku and name are required' });
  const data = readData();
  const p = (data.products || []).find(p => p.id === id);
  if (!p) return res.sendStatus(404);
  if (!Array.isArray(p.variants)) p.variants = [];
  const vIdx = p.variants.findIndex(v => v.sku === sku);
  const v = { sku, name, price: price != null ? Number(price) : null, stock: stock ?? null };
  if (vIdx >= 0) p.variants[vIdx] = { ...p.variants[vIdx], ...v };
  else p.variants.push(v);
  writeData(data);
  res.sendStatus(204);
});

// Update stock or append keys for a variant
app.patch('/api/products/:id/stock', auth, (req, res) => {
  const { id } = req.params;
  const { sku, stock, keys } = req.body || {};
  if (!sku) return res.status(400).json({ error: 'sku is required' });
  const data = readData();
  const p = (data.products || []).find(p => p.id === id);
  if (!p) return res.sendStatus(404);
  const v = (p.variants || []).find(v => v.sku === sku);
  if (!v) return res.status(404).json({ error: 'variant not found' });

  if (Array.isArray(keys)) {
    if (!Array.isArray(v.keys)) v.keys = [];
    for (const k of keys) {
      const key = String(k).trim();
      if (key) v.keys.push(key);
    }
    v.stock = v.keys.length;
  } else if (stock != null) {
    v.stock = stock;
  }

  writeData(data);
  res.sendStatus(204);
});

// Delete a product
app.delete('/api/products/:id', auth, (req, res) => {
  const { id } = req.params;
  const data = readData();
  const before = data.products?.length || 0;
  data.products = (data.products || []).filter(p => p.id !== id);
  if ((data.products?.length || 0) === before) return res.sendStatus(404);
  writeData(data);
  res.sendStatus(204);
});

// Get a single variant stock info
app.get('/api/products/:id/variant/:sku/stock', (req, res) => {
  const { id, sku } = req.params;
  const data = readData();
  const p = (data.products || []).find(p => p.id === id);
  if (!p) return res.sendStatus(404);
  const v = (p.variants || []).find(v => v.sku === sku);
  if (!v) return res.sendStatus(404);
  res.json({ sku: v.sku, name: v.name, stock: v.stock ?? (Array.isArray(v.keys) ? v.keys.length : null) });
});

// Edit a variant (price, name)
app.patch('/api/products/:id/variant/:sku', auth, (req, res) => {
  const { id, sku } = req.params;
  const { price, name, newSku } = req.body || {};
  const data = readData();
  const p = (data.products || []).find(p => p.id === id);
  if (!p) return res.sendStatus(404);
  const v = (p.variants || []).find(v => v.sku === sku);
  if (!v) return res.sendStatus(404);
  if (price != null) v.price = Number(price);
  if (name != null) v.name = name;
  if (newSku) v.sku = newSku;
  writeData(data);
  res.sendStatus(204);
});

// Remove specific keys from stock
app.patch('/api/products/:id/stock/remove', auth, (req, res) => {
  const { id } = req.params;
  const { sku, removeKeys } = req.body || {};
  if (!sku || !Array.isArray(removeKeys)) return res.status(400).json({ error: 'sku and removeKeys[] required' });
  const data = readData();
  const p = (data.products || []).find(p => p.id === id);
  if (!p) return res.sendStatus(404);
  const v = (p.variants || []).find(v => v.sku === sku);
  if (!v) return res.status(404).json({ error: 'variant not found' });
  if (!Array.isArray(v.keys)) v.keys = [];
  const set = new Set(removeKeys.map(k => String(k).trim()));
  v.keys = v.keys.filter(k => !set.has(String(k).trim()));
  v.stock = v.keys.length;
  writeData(data);
  res.sendStatus(204);
});

app.listen(PORT, () => {
  console.log(`[api] listening on http://localhost:${PORT}`);
});
