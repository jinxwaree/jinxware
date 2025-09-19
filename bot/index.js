import 'dotenv/config';
import { Client, GatewayIntentBits, Events } from 'discord.js';
import fetch from 'node-fetch';

const TOKEN = process.env.DISCORD_TOKEN;
const API_URL = process.env.API_URL || 'http://localhost:3001';
const API_KEY = process.env.API_KEY || '';

if (!TOKEN) {
  console.error('Set DISCORD_TOKEN in bot/.env');
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, c => {
  console.log(`[bot] Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (!interaction.isChatInputCommand()) return;

if (interaction.commandName === 'addproduct') {
      const name = interaction.options.getString('name', true);
      const image = interaction.options.getString('imageurl', true);
      const description = interaction.options.getString('description') || null;
      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const res = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${API_KEY}` },
        body: JSON.stringify({ id, name, image, description, variants: [] })
      });
      await interaction.reply(res.ok ? `Product ${name} added (id: ${id}).` : `Failed: ${res.status}`);
    }

    if (interaction.commandName === 'addvariant') {
      const product = interaction.options.getString('product', true);
      const name = interaction.options.getString('name', true);
      const price = interaction.options.getNumber('price', true);
      const sku = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const res = await fetch(`${API_URL}/api/products/${product}/variants`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${API_KEY}` },
        body: JSON.stringify({ sku, name, price })
      });
      await interaction.reply(res.ok ? `Variant ${name} (sku: ${sku}) saved for ${product}.` : `Failed: ${res.status}`);
    }

    if (interaction.commandName === 'stock') {
      const product = interaction.options.getString('product', true);
      const variantInput = interaction.options.getString('variant', true);
      const keysStr = interaction.options.getString('keys', true);
      const keys = keysStr.split(',').map(s => s.trim()).filter(Boolean);
      const sku = variantInput.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const res = await fetch(`${API_URL}/api/products/${product}/stock`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${API_KEY}` },
        body: JSON.stringify({ sku, keys })
      });
      await interaction.reply(res.ok ? `Added ${keys.length} keys to ${sku}.` : `Failed: ${res.status}`);
    }

    if (interaction.commandName === 'productremove') {
      const name = interaction.options.getString('name', true);
      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: { authorization: `Bearer ${API_KEY}` }
      });
      await interaction.reply(res.ok ? `Product ${id} removed.` : `Failed: ${res.status}`);
    }

    if (interaction.commandName === 'help') {
      const msg = [
        '**Commands**',
        '/addproduct name imageurl [description] — add a product (id is slug of name)',
        '/addvariant product name price — add a variant to a product',
        '/stock product variant keys — add comma-separated keys to a variant',
        '/productremove name — remove a product by name',
        '/edit product product:<id> [imageurl] [description] — edit product\n/edit variant product:<id> variant:<name or sku> price:<new price> — edit variant price',
        '/checkstock product variant — check stock count',
        '/removestock product variant key — remove a specific key'
      ].join('\n');
      await interaction.reply({ content: msg, ephemeral: true });
    }

    if (interaction.commandName === 'edit') {
      const sub = interaction.options.getSubcommand();
      if (sub === 'product') {
        const product = interaction.options.getString('product', true);
        const imageurl = interaction.options.getString('imageurl');
        const description = interaction.options.getString('description');
        const body = {};
        if (imageurl != null) body.image = imageurl;
        if (description != null) body.description = description;
        const res = await fetch(`${API_URL}/api/products/${product}`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json', authorization: `Bearer ${API_KEY}` },
          body: JSON.stringify(body)
        });
        await interaction.reply(res.ok ? `Product ${product} updated.` : `Failed: ${res.status}`);
      } else if (sub === 'variant') {
        const product = interaction.options.getString('product', true);
        const vinput = interaction.options.getString('variant', true);
        const price = interaction.options.getNumber('price', true);
        const sku = vinput.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        const res = await fetch(`${API_URL}/api/products/${product}/variant/${sku}`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json', authorization: `Bearer ${API_KEY}` },
          body: JSON.stringify({ price })
        });
        await interaction.reply(res.ok ? `Variant ${sku} updated to $${price}.` : `Failed: ${res.status}`);
      }
    }

    if (interaction.commandName === 'checkstock') {
      const product = interaction.options.getString('product', true);
      const vinput = interaction.options.getString('variant', true);
      const sku = vinput.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const res = await fetch(`${API_URL}/api/products/${product}/variant/${sku}/stock`);
      if (!res.ok) return await interaction.reply(`Failed: ${res.status}`);
      const data = await res.json();
      await interaction.reply({ content: `Stock for ${product}/${sku}: ${data.stock ?? 0}`, ephemeral: true });
    }

    if (interaction.commandName === 'removestock') {
      const product = interaction.options.getString('product', true);
      const vinput = interaction.options.getString('variant', true);
      const key = interaction.options.getString('key', true);
      const sku = vinput.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const res = await fetch(`${API_URL}/api/products/${product}/stock/remove`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${API_KEY}` },
        body: JSON.stringify({ sku, removeKeys: [key] })
      });
      await interaction.reply(res.ok ? `Removed key from ${sku}.` : `Failed: ${res.status}`);
    }
  } catch (err) {
    console.error(err);
    if (interaction.isRepliable()) {
      await interaction.reply({ content: 'Error executing command.', ephemeral: true }).catch(() => {});
    }
  }
});

client.login(TOKEN);
