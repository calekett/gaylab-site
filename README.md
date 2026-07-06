# gaylab.me — the public info hub

A zero-dependency static site (plain HTML/CSS/JS, no build step) for GitHub Pages.
It's the public face of the lab: what game servers exist, how to connect, and a
friendly overview — **no internal IPs, hostnames, or admin data**.

## Edit the content

`data.js` is the only file you touch day-to-day. Add/remove servers, flip a
`status` (`online` / `offline` / `maintenance` / `planned`), and bump `updated`.
Save → commit → push. Pages redeploys in ~30s. While every server is still
`planned`, the page shows an honest "Launching soon" banner automatically.

## Publish on GitHub Pages (fast path)

The main infra repo is private, so publish the site as **its own public repo**:

1. Create a new **public** repo, e.g. `gaylab-site`.
2. Copy the **contents** of this `site/` folder into that repo's root and push.
3. Repo → **Settings → Pages** → *Build and deployment* → **Deploy from a branch**
   → branch `main`, folder `/ (root)` → **Save**.
4. Still on Pages, set **Custom domain** to `gaylab.me` → **Save** (the included
   `CNAME` file already pins it). Tick **Enforce HTTPS** once the cert is issued
   (a few minutes to ~an hour).

> Prefer one repo? Put these files in a `/docs` folder of a **public** repo and
> choose *Deploy from a branch → /docs*. (Pages on a **private** repo needs GitHub
> Pro.)

## DNS for the apex domain

At your registrar (or Cloudflare later), point the apex at GitHub Pages:

```
A     @     185.199.108.153
A     @     185.199.109.153
A     @     185.199.110.153
A     @     185.199.111.153
CNAME www   <your-github-username>.github.io.
```

Optional IPv6 — add AAAA `@` → `2606:50c0:8000::153`, `…8001::153`, `…8002::153`,
`…8003::153`. On Cloudflare, keep these **DNS only** (grey cloud) until HTTPS is
green, or set SSL mode *Full*.

## How this fits the bigger DNS plan

Hosting the apex on Pages means the public landing page lives **off your home
connection** — resilient, and it never exposes your home IP. The rest of
`gaylab.me` points elsewhere:

| Name | Points at | How |
|---|---|---|
| `gaylab.me`, `www` | **GitHub Pages** (this site) | A/AAAA above |
| `mc.` / `terraria.` / `valheim.` | home public IP | DNS-only + OPNsense port-forward |
| `dash.` / `grafana.` / `panel.` | Tailscale / tunnel | admin, gated |

## Live status later (optional)

Statuses in `data.js` are hand-edited (honest "as of <date>"). To auto-update,
stand up **Uptime Kuma** and either embed its public status page or publish a small
`status.json` the page fetches — hook is stubbed at the bottom of `app.js`.

## Files

```
site/
├── index.html     structure
├── style.css      the neon-pride theme
├── app.js         renders data.js, copy-to-clipboard, pre-launch banner
├── data.js        ← you edit this
├── CNAME          gaylab.me
├── 404.html       branded not-found
├── favicon.svg    inline rainbow mark
└── robots.txt
```
