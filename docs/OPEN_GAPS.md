# Open gaps — Career Connect site

Each entry: what is blocked, what unblocks it, who can do it.

## Needs the client or the owner

1. **Switch form mail to the client.** The site now shows careerconnectconsult@gmail.com, but form messages are pinned to `info@thecareerconnect.net` (Vercel env `CONTACT_TO_EMAIL`), which forwards to the owner while they check everything works. **Unblock:** the owner says when; Claude sets `CONTACT_TO_EMAIL=careerconnectconsult@gmail.com` and redeploys. **Who:** owner, then Claude.
2. **Hobby plan.** Team `the-career-connect` is on Vercel Hobby, which is non-commercial only. **Unblock:** upgrade to Pro before launch. **Who:** owner or client.
3. **Photo licensing.** All photos came from the old Webflow site; their source and licence are unknown, so there is no credits page. **Unblock:** confirm they were licensed (for example Canva or Adobe Stock), or replace them. **Who:** owner (built the old site).
4. **Blog bylines.** The old site listed placeholder-looking authors (Anna Dommno, Thomas Tammeo, Christie Lashan, Jonah Oberton, Mariah Roberts; every post page said "Jennifer Hudson, January 10, 2020"). The new site credits posts to "Career Connect". **Unblock:** the client names real authors if there are any. **Who:** owner, to ask the client.
5. **Social media links.** The old contact page had placeholder "[Facebook], [Twitter], [LinkedIn]" text and footer icons with no real URLs. The new site shows no social links. **Unblock:** the client supplies profile URLs. **Who:** owner, to ask the client.

## Claude can do

- **Mirror the new phone, email, logo and portrait into the Webflow project** (not published; see `CLAUDE.md`, Webflow mirror).

- **Founder-led redesign: the version the client loved** (hero with the career photo, Calendly booking, stories first, motion). Combined with the 2026-10-01 logo, portrait, contact and speed updates on branch `redesign-merged`; ships to production on the owner's go.
- Mirror the new design and copy into the Webflow backup once the owner approves the Vercel version (see `CLAUDE.md` → Webflow mirror).

## Done 2026-10-01

- New contact details live: (704) 620-1172 and careerconnectconsult@gmail.com (site, footer, JSON-LD, privacy and terms). The client's logo is in the header (mark), the footer (full logo) and the favicons, and is set as the JSON-LD `logo`. It shows "EST. 2025", which settles the founding-year question. Carla's professional portrait replaces the webcam still.
- PageSpeed mobile on www: 100/100/100/100 (Lighthouse, live), after self-hosting fonts and inlining CSS.

- SEO handover (owner): sitemap submitted in Google Search Console; the client's Google Business Profile is live; thecareerconnect.webflow.io unpublished (verified 404, so it no longer competes as a duplicate).

- Indexing on: `PUBLIC_IS_PRODUCTION=true` on production; robots.txt allows crawling; sitemap at `/sitemap-index.xml` (20 URLs). Ready for Search Console.
- One URL per page: no trailing slash, `/about/` and `/about.html` 308 to `/about`, canonicals match the sitemap.
- Cloudflare: apex and `www` CNAMEs switched to DNS-only, as Vercel recommends.

- Domain attached: apex 308s to `www.thecareerconnect.net` (the canonical, set in `seo.siteUrl`).
- Resend: `RESEND_API_KEY` (sensitive) and `CONTACT_FROM_EMAIL=noreply@thecareerconnect.net` set on the project. The domain is verified in Resend. An end-to-end form submission to `delivered@resend.dev` returned 200, and the destination was then reset to the default.
