# Open gaps — Career Connect site

Each entry: what is blocked, what unblocks it, who can do it.

## Needs the client or the owner

1. **Logo files.** The site uses a text-and-shape stand-in (`src/components/Logo.astro`, `public/favicon.svg`). The brand kit says transparent PNG and SVG files were provided. **Unblock:** drop the SVG into `public/`, then swap `Logo.astro` to an `<img>`. **Who:** owner, to get the files from the client.
2. **Switch `info@` forwarding to the client.** Owner confirmed 2026-10-01 that `info@` forwards to the owner's inbox for now. Was: **Confirm `info@` forwarding.** Form mail goes to `info@thecareerconnect.net` (the default; `CONTACT_TO_EMAIL` is unset). The zone has Cloudflare Email Routing MX records, but the API token can't read the routing rules, so it's unverified that `info@` forwards to an inbox someone reads. **Unblock:** check Cloudflare → Email → Routing rules, or send one test message to `info@`. **Who:** owner.
3. **The old Webflow site competes with the new one in Google.** `thecareerconnect.webflow.io` is indexable (no noindex, no canonical) and carries the same copy, so Google may treat the new site as a duplicate or split rankings between them. **Unblock:** Webflow → Site settings → SEO → turn on "Disable Webflow subdomain indexing", then republish. The backup stays reachable, just out of Google. **Who:** owner (Webflow dashboard).
4. **Hobby plan.** Team `the-career-connect` is on Vercel Hobby, which is non-commercial only. **Unblock:** upgrade to Pro before launch. **Who:** owner or client.
5. **Founding year conflict.** The new brand kit says "EST. 2025"; the old site says "circa 2023", "est. 2023" and "© 2023". The site currently states no year. **Unblock:** the client confirms the year. **Who:** owner, to ask the client.
6. **Photo licensing.** All photos came from the old Webflow site; their source and licence are unknown, so there is no credits page. **Unblock:** confirm they were licensed (for example Canva or Adobe Stock), or replace them. **Who:** owner (built the old site).
7. **Blog bylines.** The old site listed placeholder-looking authors (Anna Dommno, Thomas Tammeo, Christie Lashan, Jonah Oberton, Mariah Roberts; every post page said "Jennifer Hudson, January 10, 2020"). The new site credits posts to "Career Connect". **Unblock:** the client names real authors if there are any. **Who:** owner, to ask the client.
8. **Social media links.** The old contact page had placeholder "[Facebook], [Twitter], [LinkedIn]" text and footer icons with no real URLs. The new site shows no social links. **Unblock:** the client supplies profile URLs. **Who:** owner, to ask the client.

9. **A professional portrait of Carla.** The founder-led redesign (approved direction, 2026-10-01) puts her photo large in the hero. The only one available, `src/images/carla-mackey.jpg`, is a webcam still. It works cropped into the arch frame, but a real portrait would lift the whole site. **Who:** owner, to ask the client.
10. **Confirm the Calendly event.** calendly.com/thecareerconnect has one event, "30 Minute Consultation". The redesign promotes it as the main action. Is it the $20 student consultation from the pricing page, or something else? **Who:** owner, to ask the client.

## Claude can do

- **Founder-led redesign.** Plan: `~/.claude/plans/compare-the-style-and-swirling-hamming.md`. Mockups: https://claude.ai/artifact/LFBGriJPsHrC89dScEni5r. Waiting on the owner's approval of the artboards before any site code changes.
- Mirror the new design and copy into the Webflow backup once the owner approves the Vercel version (see `CLAUDE.md` → Webflow mirror).

## Done 2026-10-01

- Indexing on: `PUBLIC_IS_PRODUCTION=true` on production; robots.txt allows crawling; sitemap at `/sitemap-index.xml` (20 URLs). Ready for Search Console.
- One URL per page: no trailing slash, `/about/` and `/about.html` 308 to `/about`, canonicals match the sitemap.
- Cloudflare: apex and `www` CNAMEs switched to DNS-only, as Vercel recommends.

- Domain attached: apex 308s to `www.thecareerconnect.net` (the canonical, set in `seo.siteUrl`).
- Resend: `RESEND_API_KEY` (sensitive) and `CONTACT_FROM_EMAIL=noreply@thecareerconnect.net` set on the project. The domain is verified in Resend. An end-to-end form submission to `delivered@resend.dev` returned 200, and the destination was then reset to the default.
