# Deploy Jinxware

This project contains:
- Static site (index.html, products.html, styles.css, script.js, assets/)
- API (server/) — Express, stores data in server/data/products.json
- Discord bot (bot/)

Recommended hosting (simple)
- Easiest: Netlify Drop (drag-and-drop) or Netlify from GitHub — static site only
- Also easy: Vercel — static site only
- You can add an API/bot later if you want, but it's optional

Steps (static only)

A) Netlify Drop (fastest, no account required)
- Zip the demo-landing folder contents (index.html, products.html, styles.css, script.js, assets/, products.json)
- Go to https://app.netlify.com/drop and drag the zip
- You get a live URL immediately
- Optional: add a custom domain later in Netlify (jinxware.xyz)

B) Vercel (free, with your GitHub repo)
- Import your repo on vercel.com
- Project root: demo-landing
- Build command: none
- Output directory: .
- Add jinxware.xyz and www.jinxware.xyz in Domains and follow their DNS steps

How to edit products (static mode)
- Edit products.json at repo root (or in the deployed files) to change products, variants, and images
- The site fetches products.json and renders dynamically
- No servers, APIs, or bots needed

If you later want dynamic updates via a bot/API, you can re-enable the server/ and bot/ folders and switch the loader back.
