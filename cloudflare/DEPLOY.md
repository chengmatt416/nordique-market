# Cloudflare Pages Deployment Guide

This version replaces **Firebase** entirely with Cloudflare's stack:
- **D1** → Database (SQLite, replaces Firestore)
- **R2** → File storage (replaces Firebase Storage)
- **Workers** → API (replaces Next.js API routes + Firebase Admin SDK)
- **KV** → Session/cache (replaces Firebase Session)
- **JWT** → Auth tokens (replaces Firebase Auth + Admin SDK)

## Prerequisites

- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- Node.js 18+
- Cloudflare account with Workers Paid plan (for D1 + R2)

## Step 1: Create Cloudflare Resources

```bash
# Login to Cloudflare
npx wrangler login

# Create D1 database
npx wrangler d1 create nordique-market-db

# Create R2 bucket
npx wrangler r2 bucket create nordique-market-uploads

# Create KV namespace
npx wrangler kv:namespace create nordique-market-kv
```

## Step 2: Configure wrangler.toml

Edit `wrangler.toml` and replace:
- `your-database-id-here` → The ID from `wrangler d1 create` output
- `your-kv-id-here` → The ID from `wrangler kv:namespace create` output
- `JWT_SECRET` → A random string (use: `openssl rand -hex 32`)

## Step 3: Set Google OAuth Credentials

```bash
npx wrangler secret put GOOGLE_CLIENT_ID
# Paste your Google OAuth client ID

npx wrangler secret put JWT_SECRET
# Paste your JWT secret
```

## Step 4: Initialize Database

```bash
# Create tables
npm run db:init

# Seed default data
npm run db:seed
```

## Step 5: Update Frontend

In the main Next.js app, update the API calls to point to your Worker URL instead of `/api/*`:

1. Set `NEXT_PUBLIC_API_URL` to your Worker URL (e.g., `https://nordique-market-api.your-name.workers.dev`)

OR

2. Update the frontend fetch calls to use `process.env.NEXT_PUBLIC_API_URL` prefix.

## Step 6: Deploy

```bash
npm run deploy
```

## Step 7: Deploy Frontend to Cloudflare Pages

1. Go to Cloudflare Dashboard → Pages
2. Connect your GitHub repo
3. Build command: `npm run build`
4. Build output: `.next`
5. Set environment variables (same as Vercel but WITHOUT Firebase vars)
6. Framework preset: Next.js

## Important Differences from Vercel Version

| Feature | Vercel (Firebase) | Cloudflare |
|---------|------------------|------------|
| Database | Firestore (NoSQL) | D1 (SQLite) |
| Auth | Firebase Auth + Admin SDK | JWT + Google OAuth |
| File Storage | Firebase Storage | R2 |
| API | Next.js API Routes | Workers |
| Session | Firebase Session | KV + JWT |
| Search | Firestore queries | SQL LIKE queries |

## Schema Changes

- Table/column names use snake_case instead of camelCase
- Dates stored as ISO strings instead of Timestamp objects
- Arrays stored as JSON strings
- Products use `LIKE` for search instead of Firestore `>=` / `<` range queries
