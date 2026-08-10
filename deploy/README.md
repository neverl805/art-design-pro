# Deployment

## Access control

The panel and its API are reachable only under the path prefix in `nginx/hcaptcha_monitor.conf` (`/hcp_solver/` at time of writing). HTTP Basic auth was removed on 2026-08-10 because it prompted on every poll; the prefix replaces it.

The prefix covers the **API as well as the SPA**, and the bare `/api/` returns 404. That is the point: `src/router/guards/beforeEach.ts` skips the login check, and even if it did not, `/api/logs/*` is reachable directly with curl, so protecting only the panel protects nothing.

Verified after each change — everything outside the prefix must be 404:

```sh
curl -s -o /dev/null -w '%{http_code}
' http://<host>/                      # 404
curl -s -o /dev/null -w '%{http_code}
' http://<host>/api/logs/overview     # 404
curl -s -o /dev/null -w '%{http_code}
' -X POST http://<host>/api/logs/cleanup  # 404
curl -s -o /dev/null -w '%{http_code}
' http://<host>/hcp_solver/api/logs/overview  # 200
```

Checking only the SPA is not enough: the API is the thing that serves the data.

**Changing the prefix means rebuilding.** `VITE_BASE_URL` and `VITE_API_URL` in `.env.production` are compiled into the asset and XHR paths; editing nginx alone gives a 404 on every asset.

## Known gaps

- **Plain HTTP.** Basic credentials travel base64-encoded, which is not encryption. A certificate and a 80->443 redirect would fix it.
- **`/api/logs/cleanup` mutates and is only protected by the proxy.** Anything that reaches `127.0.0.1:8000` directly bypasses the gate; the check belongs in `art_server` as well.
