# Infrastructure

## Proxy Routes (Caddy)
- `/` → Next.js (reverse_proxy to port 3000)

## Background Services
- `nextjs` → `npm run start` (production, after build)
- Port: 3000

## Environment Variables (.env)
- DATABASE_URL (MySQL auto-provisioned)
- NEXTAUTH_URL (preview domain)
- NEXTAUTH_SECRET (generated)
- GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET (optional — disabled if absent)
- OPENAI_API_KEY (minted via create_openai_api_key)
- OPENAI_BASE_URL (from create_openai_api_key)

## Setup Script (runs on deploy)
1. npm ci
2. npx prisma generate
3. npx prisma migrate deploy
4. npm run build
5. npm run seed (idempotent — creates admin + demo user, seeds food DB)
6. (no key:generate — NextAuth uses NEXTAUTH_SECRET from env)

## Ports
- Next.js: 3000 (background service)
- MySQL: 3306 (managed)
