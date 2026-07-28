# Production deployment

The public site has one canonical origin: `https://fengxingzhicheng.com`. The
`www` hostname and every plain-HTTP request redirect to that origin. Direct
HTTPS access by IP is intentionally unsupported because a hostname certificate
cannot validate an IP address.

No passwords or private keys belong in this repository. Use an SSH key and a
non-root deployment account with only the sudo permissions required to install
a release, restart `fx-web.service`, and validate/reload Nginx. Rotate any
credential that has previously been shared in chat, documentation, or shell
history.

## One-time host setup

1. Point the apex and `www` DNS records at the server.
2. Create the dedicated service account used by `deploy/fx-web.service` without
   an interactive password, then grant it read access to the release tree:

   ```bash
   sudo useradd --system --home /opt/fx/apps/website --shell /usr/sbin/nologin fx-web
   sudo install -d -o fx-web -g fx-web /opt/fx/apps/website/releases
   ```

   The deployment account may update release symlinks through narrowly scoped
   sudo rules; the Node.js process itself must continue to run as `fx-web`.
3. Obtain a certificate whose SAN contains both `fengxingzhicheng.com` and
   `www.fengxingzhicheng.com`. The checked-in Nginx template expects the usual
   Certbot paths under `/etc/letsencrypt/live/fengxingzhicheng.com/`.
4. Copy `deploy/nginx.conf` to `/etc/nginx/sites-available/fx-web`, link it into
   `sites-enabled`, and disable the distribution's other `default_server` site.
   Keep port `3010` bound to loopback and blocked from the public network.
5. Verify automatic certificate renewal with `certbot renew --dry-run` (or the
   equivalent command for the certificate manager in use).

Do not enable HSTS before both hostnames work over HTTPS. The template includes
one year of HSTS with `includeSubDomains`; remove that directive during the
initial certificate bootstrap if unrelated subdomains are not HTTPS-ready.

## Release layout

The deployment workflow replaces the contents of
`/opt/fx-web/apps/website/current` in place after CI verification. No release
archive, snapshot, or previous-service copy is retained. A standalone Next.js
release needs these items together:

```text
server.js
.next/static/
public/
node_modules/        # included by the standalone output
.env                 # provisioned on-host, never copied from source control
```

On the first activation at this path, the workflow creates the target
directory. If that directory has no `.env`, it moves the existing `.env` from
`/opt/fx/apps/website/current`; it never copies the file or creates a backup.
The workflow installs the matching `fx-web.service` unit and reloads systemd
before it starts the new release.

Copy `.next/static` into `.next/standalone/.next/static` and `public` into
`.next/standalone/public` before publishing the release directory. The host
`.env` file is preserved during the in-place replacement and is never copied
from source control.

The Nginx cache policy is deliberately narrow:

- `/_next/static/` and `/media/optimized/`: one year, `immutable`.
- HTML, API routes, and `/media/uploads/`: the cache policy returned by Next.js.

Only content-addressed or release-owned files may be placed in
`/media/optimized/`. Replacing a file without changing its URL will leave stale
copies in browsers for up to one year.

## Preflight and activation

Build and verify locally or in CI before uploading:

```bash
npm ci
npm run lint
npx tsc --noEmit
npm run build
```

On the host, validate configuration before any reload:

```bash
sudo nginx -t
sudo systemctl daemon-reload
sudo systemctl restart fx-web.service
curl --fail --silent --show-error http://127.0.0.1:3010/ >/dev/null
sudo nginx -t && sudo systemctl reload nginx
```

Do not reload Nginx when `nginx -t` fails. Check both the upstream and the public
edge after activation:

```bash
systemctl is-active --quiet fx-web.service
curl --fail --silent --show-error http://127.0.0.1:3010/ >/dev/null
curl --fail --silent --show-error https://fengxingzhicheng.com/ >/dev/null
curl --head http://fengxingzhicheng.com/
curl --head https://www.fengxingzhicheng.com/
curl --head https://fengxingzhicheng.com/_next/static/<build-asset>
```

Expected results are `200` for the canonical homepage, `308` to the apex HTTPS
origin for HTTP and `www`, and
`Cache-Control: public, max-age=31536000, immutable` for a real build asset.
Also exercise the contact form and an authenticated admin login after each
release; a homepage-only check does not cover the database or write paths.

## Incident recovery

When a deployment fails, inspect the service and deployment logs first, trace
the root cause, and deploy a corrected version. Do not apply speculative
patches or restore a prior service copy. Database changes require their own
forward-compatible migration plan before deployment.
