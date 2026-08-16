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

## Deployment

Build it with exactly this, and **do not pass `VITE_*` on the command line**:

```bash
npm run build          # reads .env.production; that file is the authority
```

`.env.production` already carries the deployed values — `VITE_BASE_URL = /hcp_solver/` and `VITE_API_URL = /hcp_solver/`. Both are baked into the bundle at build time, so getting one wrong cannot be fixed by an nginx change afterwards; it needs a rebuild.

**Why the warning is here.** On 2026-08-16 a build passed `VITE_API_URL=/hcp_solver/api` on the command line "to be sure the prefix was right". The app appends its own `/api`, so every request went to `/hcp_solver/api/api/logs/...` and answered **404** — while the page itself loaded perfectly, because `VITE_BASE_URL` was fine and the static assets resolved. The failure looks like "the panel opens but has no data", which reads as a backend problem and sends you to the wrong place. Vite does not warn: an override is just a value, and a wrong value produces a bundle that builds, loads, and is useless.

**The signal that would have caught it immediately: the content hash.** Vite names chunks by content, so the same source built the same way produces the same filenames. A correct build here yields `assets/index-Cp-wwGRY.js`. When a rebuild's hashes do not match the artifact you are replacing, **the build input differed** — that is a hard signal, not noise, and it must be explained before deploying, not explained away. It was explained away that day as lint reformatting, and it was not.

The prefix is also coupled to nginx: `location ^~ /hcp_solver/` serves this as an `alias`, and the API is reached through `^~ /hcp_solver/api/` with a rewrite that strips the prefix. Changing the prefix means changing both this file and that vhost, and rebuilding — editing the vhost alone is not enough.

Deploy by replacing the whole directory rather than copying files into it, so a half-written tree is never served, and keep the previous one:

```bash
mv /www/wwwroot/dist /www/wwwroot/dist.pre-<date> && mv <new>/dist /www/wwwroot/dist
chown -R www:www /www/wwwroot/dist
```

Then verify the API, not just the page — the page loading proves nothing about it:

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://<host>/hcp_solver/api/logs/overview   # 200
```
