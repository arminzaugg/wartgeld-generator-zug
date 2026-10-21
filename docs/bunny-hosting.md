# Bunny hosting

The site is served from Bunny at **https://wartgeld.nidea.ch**. These resources were created
once by hand (2026-10-21) and are not managed by a script; `npm run deploy:site` only uploads
the build into them. Ids used by the deploy script: `site/bunny-site.json`.

| Resource | Name / id | Settings |
|---|---|---|
| Storage zone | `wartgeld-site` (2007325) | region DE (Falkenstein), no replication, Standard tier |
| Pull zone | `wartgeld-site` (6844037) | origin = the storage zone, Standard tier, hostnames `wartgeld-site.b-cdn.net`, `wartgeld.nidea.ch` (free certificate, force SSL) |
| DNS | zone `nidea.ch` | one record: `CNAME wartgeld → wartgeld-site.b-cdn.net` (TTL 300); the apex and `www` are not part of this app |
| Shield zone (site) | 205244 on pull zone 6844037 | Basic (free) plan, WAF in log mode, bot detection log only |
| Shield zone (service) | 205245 on pull zone 6843620 (`wartgeld-address-lookup`) | same plan and modes |
| Address service | Edge Script 98219 | see README, `npm run deploy:edge` |

## Edge rules on the site pull zone (in this order)

1. **api** — URL `*/api/address`: change origin to `https://wartgeld-address-lookup.bunny.run`,
   cache time 0, request header `X-Wartgeld-Site: <BUNNY_SITE_FORWARD_SECRET>`.
2. **headers: security** — every URL: `X-Content-Type-Options: nosniff`,
   `Referrer-Policy: no-referrer`, `X-Frame-Options: DENY`,
   `Strict-Transport-Security: max-age=31536000`.
3. **cache: assets are immutable** — URL `*/assets/*`:
   `Cache-Control: public, max-age=31536000, immutable`, edge cache 1 year.
4. **cache: pages are revalidated** — every URL except `*/assets/*` and `*/api/address`:
   `Cache-Control: no-cache`, edge cache 300 s (a missed purge heals within 5 minutes).
5. **redirect** — URL `*://wartgeld-site.b-cdn.net/*`: 301 to `https://wartgeld.nidea.ch{{path}}`
   (one web address only, so settings in the browser are never split).

## Per-visitor limit (Bunny Shield)

- **Site zone, rule `AddressLookupPerVisitor`:** URI begins with `/api/address`, counted per IP,
  50 requests per 10 s, then 429 for 60 s. Pages keep loading while a visitor is blocked.
- **Service zone, rule `AddressLookupDirectCallers`:** the same limit for calls straight to
  `wartgeld-address-lookup.bunny.run`, except requests carrying the site's
  `X-Wartgeld-Site` marker. Requests forwarded by the site reach the service from Bunny's own
  addresses, so counting them there would lump all visitors together; they are already limited
  per visitor on the site zone. A forged marker value is limited like any direct call.
- Old-Netlify traffic reaches the service from Netlify's addresses and shares their counters
  until Netlify forwards to wartgeld.nidea.ch.
- Free plan limits: at most 2 rate-limit rules per zone, windows up to 10 s.

The marker value lives only in Bunny (edge rule + Shield rule) and in the git-ignored
`.env.local` as `BUNNY_SITE_FORWARD_SECRET`; the build fails if it ever appears in `dist/`.

## Re-creating the setup

1. Storage zone (DE, no replication) and pull zone with the storage zone as origin; update
   `site/bunny-site.json`.
2. Add the hostname to the pull zone, then the `CNAME wartgeld` record; wait until
   `dig wartgeld.nidea.ch` answers, then load the free certificate and enable force SSL.
3. Edge rules 1–4, then rule 5 once the certificate is active.
4. Shield zones (Basic plan) on both pull zones and the two rate-limit rules above; check with
   requests the service rejects before calling Swiss Post (e.g. an unknown `Origin` → 403) that
   request 51 within 10 s answers 429.
5. `npm run deploy:edge`, then `npm run deploy:site`.

## Moving from the old Netlify address

1. Publish the Netlify deploy of this version; it shows the "umgezogen" notice.
2. On the old address: Einstellungen → «Einstellungen sichern».
3. On wartgeld.nidea.ch: Einstellungen → «Einstellungen laden» → «Übernehmen».
4. Create a test invoice and check sender block and signature.
5. Only then forward the Netlify site to wartgeld.nidea.ch (follow-up change).
