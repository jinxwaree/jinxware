import 'dotenv/config';
import { REST, Routes, SlashCommandBuilder } from 'discord.js';

const token = process.env.DISCORD_TOKEN;
const guildId = process.env.GUILD_ID;
const clientId = 'placeholder'; // resolved at runtime by Discord

// Define commands
const commands = [
  new SlashCommandBuilder()
    .setName('addproduct')
    .setDescription('Add or replace a product')
    .addStringOption(o => o.setName('name').setDescription('display name').setRequired(true))
    .addStringOption(o => o.setName('imageurl').setDescription('image url or path').setRequired(true))
    .addStringOption(o => o.setName('description').setDescription('product description').setRequired(false)),
  new SlashCommandBuilder()
    .setName('addvariant')
    .setDescription('Add or upsert a variant to a product')
    .addStringOption(o => o.setName('product').setDescription('product id (e.g., cod, fortnite)').setRequired(true))
    .addStringOption(o => o.setName('name').setDescription('variant name').setRequired(true))
    .addNumberOption(o => o.setName('price').setDescription('price').setRequired(true)),
  new SlashCommandBuilder()
    .setName('stock')
    .setDescription('Append keys to a variant (comma-separated)')
    .addStringOption(o => o.setName('product').setDescription('product id').setRequired(true))
    .addStringOption(o => o.setName('variant').setDescription('variant sku or name').setRequired(true))
    .addStringOption(o => o.setName('keys').setDescription('comma-separated keys').setRequired(true)),

  // Edit command with subcommands
  new SlashCommandBuilder()
    .setName('edit')
    .setDescription('Edit a product or variant')
    .addSubcommand(sc => sc
      .setName('product')
      .setDescription('Edit a product')
      .addStringOption(o => o.setName('product').setDescription('product id').setRequired(true))
      .addStringOption(o => o.setName('imageurl').setDescription('new image url').setRequired(false))
      .addStringOption(o => o.setName('description').setDescription('new description').setRequired(false))
    )
    .addSubcommand(sc => sc
      .setName('variant')
      .setDescription('Edit a variant')
      .addStringOption(o => o.setName('product').setDescription('product id').setRequired(true))
      .addStringOption(o => o.setName('variant').setDescription('variant sku or name').setRequired(true))
      .addNumberOption(o => o.setName('price').setDescription('new price').setRequired(true))
    ),

  new SlashCommandBuilder()
    .setName('productremove')
    .setDescription('Remove a product by name (slugged to id)')
    .addStringOption(o => o.setName('name').setDescription('product name').setRequired(true)),

  new SlashCommandBuilder()
    .setName('checkstock')
    .setDescription('Check stock for a variant')
    .addStringOption(o => o.setName('product').setDescription('product id').setRequired(true))
    .addStringOption(o => o.setName('variant').setDescription('variant sku or name').setRequired(true)),

  new SlashCommandBuilder()
    .setName('removestock')
    .setDescription('Remove a specific key from a variant')
    .addStringOption(o => o.setName('product').setDescription('product id').setRequired(true))
    .addStringOption(o => o.setName('variant').setDescription('variant sku or name').setRequired(true))
    .addStringOption(o => o.setName('key').setDescription('exact key to remove').setRequired(true)),

  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show command help')
].map(c => c.toJSON());

if (!token || !guildId) {
  console.error('Set DISCORD_TOKEN and GUILD_ID in bot/.env');
  process.exit(1);
}

(async () => {
  try {
    const rest = new REST({ version: '10' }).setToken(token);
    // NOTE: We register guild commands (fast deploy). You can later switch to application commands.
    await rest.put(Routes.applicationGuildCommands((await rest.get(Routes.oauth2CurrentApplication())).id, guildId), { body: commands });
    console.log('Slash commands deployed.');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
