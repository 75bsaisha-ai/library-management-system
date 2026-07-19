# Folio — Library Management System

A React + TypeScript + Vite frontend with an Express API backend, for
managing library books, members, and circulation (borrowing/returns).

## What's in this zip

This project was assembled from files sent one-by-one in chat, plus a few
fixes needed to make it actually installable and deployable:

- **Removed monorepo-only dependencies.** The original `package.json` used
  pnpm-workspace `"catalog:"` version aliases and depended on
  `@workspace/api-client-react`, a package generated inside a private
  monorepo that wasn't included. Both are gone now — every dependency has
  a real, installable version.
- **Added a real backend.** The frontend pages called REST endpoints
  (`/api/books`, `/api/members`, `/api/borrowings`, `/api/dashboard/*`,
  `/api/auth/*`) that had no server behind them. `server/index.js` is a
  small Express API implementing all of them, with in-memory seed data
  (10 books, 8 members, 8 borrowings) so the app is fully usable right
  after install — no database setup required.
- **Added `src/lib/api-client.ts`**, a drop-in replacement for the missing
  `@workspace/api-client-react` hooks (`useListBooks`, `useCreateMember`,
  etc.), implemented with TanStack Query + `fetch` against the bundled
  backend.
- **Removed Replit-only Vite plugins and required env vars** so the app
  builds and runs on any platform, not just Replit.

## Running locally

```bash
npm install
npm run dev
```

This starts the Vite dev server (frontend, default port 5173) and the
Express API (default port 3001) together, with `/api` requests proxied
from the frontend to the backend. Open http://localhost:5173.

**There's no pre-seeded login account.** Books/members/borrowings are
seeded, but you'll need to click **Create an account** on the login page
to register a staff login before you can sign in.

The forgot-password flow has no real email service wired up — the reset
code is returned in the API response (`devCode`) and logged to the server
console so you can complete the flow while testing. Wire up a real email
provider before using this in production.

## Building for production

```bash
npm run build   # builds the frontend into dist/public
npm start        # runs the Express server, which also serves dist/public
```

`npm start` runs one process that serves both the API and the built
frontend on a single port (`PORT`, default 3001) — this is the setup most
hosting platforms expect.

## Deploying

1. Push this project to a GitHub repo.
2. On your host (Render, Railway, Fly.io, a VPS, etc.), create a new Node
   web service pointing at the repo with:
   - **Build command:** `npm install && npm run build`
   - **Start command:** `npm start`
3. Set the `JWT_SECRET` environment variable to a long random string
   (see `.env.example`) — the built-in default is only safe for local
   testing.
4. Most platforms set `PORT` automatically; the app already respects it.

### Note on data persistence

`server/data.js` holds everything in memory — it resets on every server
restart/redeploy. That's fine for a demo or for testing the UI, but for
real use you'll want to swap it for a real database (Postgres, etc.) and
update the routes in `server/index.js` accordingly. The route logic and
response shapes are already written against a clear, consistent schema,
so that swap is mostly a matter of replacing the array lookups with
database queries.

## Project structure

```
├── src/               # React frontend
│   ├── pages/          # Route-level screens
│   ├── components/     # Layout, shared, and shadcn/ui components
│   ├── contexts/        # AuthContext
│   ├── hooks/            # use-toast, use-mobile
│   └── lib/               # api-client.ts (backend calls), utils, config
├── server/             # Express API + in-memory data
│   ├── index.js          # All routes
│   ├── data.js            # Seed data + derived-status helpers
│   └── auth.js             # JWT/bcrypt helpers
├── docs/                # Original planning/spec docs (reference only)
├── public/              # Static assets
└── index.html
```
