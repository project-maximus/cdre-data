# CDRE Data

Simple Next.js website starter for collecting links and storing them in a Neon Postgres database.

## Stack

- Next.js (App Router)
- Tailwind CSS (v4)
- Neon serverless client (`@neondatabase/serverless`)
- Vercel-ready deployment

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Add environment variables:

```bash
cp .env.example .env
```

3. Start dev server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Verify Setup

```bash
npm run lint
npm run build
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import project in Vercel.
3. Add the same environment variables from `.env` into Vercel Project Settings.
4. Deploy.

## Neon DB Note

Set `NEON_DB` to your Neon connection string.

## Auth Table + Dummy Users

Run this once to create the `auth_users` table and seed sample users:

```bash
npm run db:init-auth
```

Dummy users:

- admin / admin123
- editor / editor123
- viewer / viewer123
