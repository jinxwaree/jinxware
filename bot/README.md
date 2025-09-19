# Jinxware Bot

Slash commands to manage products and stock via the API.

## Configure
1) Copy `.env.example` to `.env` and fill in:
   - DISCORD_TOKEN=your_bot_token
   - GUILD_ID=target_guild_id (for fast deploy)
   - API_URL=http://localhost:3001
   - API_KEY=the same as server/.env

2) Install deps:
   npm install

3) Deploy slash commands to your guild:
   npm run deploy

4) Start the bot:
   npm start

## Commands
- /addproduct id name [image]
- /addvariant product sku name [price] [stock]
- /setstock product sku stock

Tip: Use product IDs that match your site data-category values: `cod`, `fortnite`.
