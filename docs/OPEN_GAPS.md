# Open gaps — Career Connect site

Each entry: what is blocked, what unblocks it, who can do it.

## Needs the client or the owner

1. **Logo files.** The site uses a text-and-shape stand-in (`src/components/Logo.astro`, `public/favicon.svg`). The brand kit says transparent PNG and SVG files were provided. **Unblock:** drop the SVG into `public/`, then swap `Logo.astro` to an `<img>`. **Who:** owner, to get the files from the client.
2. **Confirm `info@` forwarding.** Form mail goes to `info@thecareerconnect.net` (the default; `CONTACT_TO_EMAIL` is unset). The zone has Cloudflare Email Routing MX records, but the API token can't read the routing rules, so it's unverified that `info@` forwards to an inbox someone reads. **Unblock:** check Cloudflare → Email → Routing rules, or send one test message to `info@`. **Who:** owner.
3. **Search indexing is off.** The site is live on www.thecareerconnect.net but builds as noindex, because `PUBLIC_IS_PRODUCTION` isn't set. **Unblock:** the owner approves the site, then Claude sets the variable on production and redeploys. **Who:** owner says go, then Claude.
8. **Hobby plan.** Team `the-career-connect` is on Vercel Hobby, which is non-commercial only. **Unblock:** upgrade to Pro before launch. **Who:** owner or client.
4. **Founding year conflict.** The new brand kit says "EST. 2025"; the old site says "circa 2023", "est. 2023" and "© 2023". The site currently states no year. **Unblock:** the client confirms the year. **Who:** owner, to ask the client.
5. **Photo licensing.** All photos came from the old Webflow site; their source and licence are unknown, so there is no credits page. **Unblock:** confirm they were licensed (for example Canva or Adobe Stock), or replace them. **Who:** owner (built the old site).
6. **Blog bylines.** The old site listed placeholder-looking authors (Anna Dommno, Thomas Tammeo, Christie Lashan, Jonah Oberton, Mariah Roberts; every post page said "Jennifer Hudson, January 10, 2020"). The new site credits posts to "Career Connect". **Unblock:** the client names real authors if there are any. **Who:** owner, to ask the client.
7. **Social media links.** The old contact page had placeholder "[Facebook], [Twitter], [LinkedIn]" text and footer icons with no real URLs. The new site shows no social links. **Unblock:** the client supplies profile URLs. **Who:** owner, to ask the client.

## Claude can do

- **Cloudflare proxy on the Vercel records.** The apex and `www` CNAMEs are proxied (orange cloud); Vercel recommends DNS-only. Works today. Switch both to DNS-only if the owner agrees.

- Mirror the new design and copy into the Webflow backup once the owner approves the Vercel version (see `CLAUDE.md` → Webflow mirror).

## Done 2026-10-01

- Domain attached: apex 308s to `www.thecareerconnect.net` (the canonical, set in `seo.siteUrl`).
- Resend: `RESEND_API_KEY` (sensitive) and `CONTACT_FROM_EMAIL=noreply@thecareerconnect.net` set on the project. The domain is verified in Resend. An end-to-end form submission to `delivered@resend.dev` returned 200, and the destination was then reset to the default.
