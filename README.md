# hCaptcha Monitor Frontend

Vue 3 monitoring UI for the FastAPI service in `/Users/neverland/art_server`. The dashboard displays current Safari hCaptcha solve outcomes, latency, target hosts, token usage, source health, request search, and per-request event timelines. The Token management page polls the live SQLite ledger, displays complete Token values, and supports creating, editing, enabling, disabling, and deleting records.

## Development

Start the monitor backend first, then run:

```bash
npm ci
npm run dev
```

The development server listens on `http://127.0.0.1:3006` and proxies `/api` to `http://localhost:8000` through `.env.development`.

## Verification

```bash
npm run build
npx eslint src/views/logs src/api/logs.ts
```

Production builds use `VITE_API_URL` from `.env.production`. Set it to `/` when the frontend and backend are served behind one reverse proxy, or to the monitor API origin when they are deployed separately.
