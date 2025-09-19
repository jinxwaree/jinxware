# Jinxware API Server

Simple Express API with JSON file storage to drive products, variants, and stock.

## Setup

1) Copy .env.example to .env and set API_KEY:
   PORT=3001
   API_KEY=your_secret_key
   ALLOWED_ORIGIN=*

2) Install dependencies:
   npm install

3) Start server:
   npm start

This serves:
- GET /api/products
- POST /api/products (auth)
- PATCH /api/products/:id (auth)
- POST /api/products/:id/variants (auth)
- PATCH /api/products/:id/stock (auth)

Data is stored in server/data/products.json.
