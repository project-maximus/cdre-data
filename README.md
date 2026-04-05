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

## CDRE Content Structure Setup

Run this once to create content tables and seed the full CDRE hierarchy:

```bash
npm run db:init-content
```

This creates:

- `content_sections`
- `content_subsections`
- `content_resources`

## How Content Links Are Stored

- Sign in and open `/dashboard`.
- Choose a section and subsection.
- Choose one source mode:
	- Google Drive Link
	- Use AI Generated Stuff
- If Google Drive mode is selected, add a valid Drive link.
- If AI mode is selected, you can add optional script/explanation text.
- Status values: `not_submitted`, `resubmit`, `done`.
