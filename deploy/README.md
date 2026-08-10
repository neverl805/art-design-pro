# Deployment

## Access control

The panel and its API are public-facing and are gated by **HTTP Basic auth in nginx**, not by the application. See `nginx/hcaptcha_monitor.conf` for the config and the reasoning; the short version is that `src/router/guards/beforeEach.ts` deliberately skips the login check, and even if it did not, `/api/logs/*` is reachable directly with curl and would still have been open.

Verified after each change — unauthenticated must be 401 on **both** the SPA and the API:

```sh
curl -s -o /dev/null -w '%{http_code}\n' http://<host>/
curl -s -o /dev/null -w '%{http_code}\n' http://<host>/api/logs/overview
curl -s -o /dev/null -w '%{http_code}\n' -X POST http://<host>/api/logs/cleanup
curl -s -o /dev/null -w '%{http_code}\n' -u user:pass http://<host>/api/logs/overview   # 200
```

Checking only the SPA is not enough: the API is the thing that actually serves the data.

## Known gaps

- **Plain HTTP.** Basic credentials travel base64-encoded, which is not encryption. A certificate and a 80->443 redirect would fix it.
- **`/api/logs/cleanup` mutates and is only protected by the proxy.** Anything that reaches `127.0.0.1:8000` directly bypasses the gate; the check belongs in `art_server` as well.
