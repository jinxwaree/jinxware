# Deploy Jinxware

This project contains:
- Static site (index.html, products.html, styles.css, script.js, assets/)
- API (server/) — Express, stores data in server/data/products.json
- Discord bot (bot/)

Recommended hosting
- Frontend: Vercel (jinxware.xyz)
- API: Render Web Service (api.jinxware.xyz)
- Bot: Render Background Worker

Steps

1) Initialize git and push to GitHub
- In PowerShell:
  git init
  git add .
  git commit -m "init"
  # create a new GitHub repo and then:
  git remote add origin https://github.com/<you>/jinxware.git
  git push -u origin main

2) Frontend on Vercel
- Import your repo on vercel.com
- Project root: demo-landing (the folder with index.html)
- Build command: none
- Output directory: .
- Domain: add jinxware.xyz and www.jinxware.xyz
- vercel.json already proxies /api/* to https://api.jinxware.xyz

3) API on Render
- New Web Service -> select your repo, set root to server
- Start command: node index.js
- Environment
  - API_KEY: <same key as local>
  - ALLOWED_ORIGIN: https://jinxware.xyz,https://www.jinxware.xyz
- (Optional) Disk: mount /opt/render/project/src/server/data (so products.json persists)
- Custom domain: api.jinxware.xyz (add DNS CNAME per Render instructions)

4) Bot on Render
- New Background Worker -> root: bot
- Start command: node index.js
- Environment
  - DISCORD_TOKEN: <your token>
  - API_URL: https://api.jinxware.xyz
  - API_KEY: <same as API>

5) DNS
- At your registrar/Cloudflare:
  - A  jinxware.xyz  -> 76.76.21.21 (Vercel apex)
  - CNAME  www       -> cname.vercel-dns.com
  - CNAME  api       -> <your Render API host>

After this
- Your site loads from jinxware.xyz
- Script calls /api/products which Vercel proxies to api.jinxware.xyz
- The bot calls the API directly.

Troubleshooting
- CORS: ensure ALLOWED_ORIGIN matches your site origins.
- 404 on /api: confirm api.jinxware.xyz is live and vercel.json is deployed.
