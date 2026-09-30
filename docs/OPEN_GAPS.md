# Open gaps — Career Connect site

Each entry: what is blocked, what unblocks it, who can do it.

## Needs the client or the owner

1. **Logo files.** The site uses a text-and-shape stand-in (`src/components/Logo.astro`, `public/favicon.svg`). The brand kit says transparent PNG and SVG files were provided. **Unblock:** drop the SVG into `public/`, then swap `Logo.astro` to an `<img>`. **Who:** owner, to get the files from the client.
2. **Where contact form messages go.** Default destination is `info@thecareerconnect.net`, but that domain has no MX records yet (registered 2026-09-30), so mail to it would bounce. **Unblock:** set `CONTACT_TO_EMAIL` in Vercel to an inbox the client reads, or set up email on the domain. **Who:** owner.
3. **Resend key on the Vercel project.** `RESEND_API_KEY` must be set for the form to send. The endpoint returns 500 without it, and the form then shows its "didn't send, call us" message. **Who:** owner (Vercel dashboard).
4. **Founding year conflict.** The new brand kit says "EST. 2025"; the old site says "circa 2023", "est. 2023" and "© 2023". The site currently states no year. **Unblock:** the client confirms the year. **Who:** owner, to ask the client.
5. **Photo licensing.** All photos came from the old Webflow site; their source and licence are unknown, so there is no credits page. **Unblock:** confirm they were licensed (for example Canva or Adobe Stock), or replace them. **Who:** owner (built the old site).
6. **Blog bylines.** The old site listed placeholder-looking authors (Anna Dommno, Thomas Tammeo, Christie Lashan, Jonah Oberton, Mariah Roberts; every post page said "Jennifer Hudson, January 10, 2020"). The new site credits posts to "Career Connect". **Unblock:** the client names real authors if there are any. **Who:** owner, to ask the client.
7. **Domain.** `thecareerconnect.net` has no DNS records. **Unblock:** in Cloudflare, add the records Vercel shows when the domain is added to the project (apex A record plus `www` CNAME), then set `PUBLIC_IS_PRODUCTION=true` on production and redeploy. **Who:** owner (Cloudflare access).
8. **Social media links.** The old contact page had placeholder "[Facebook], [Twitter], [LinkedIn]" text and footer icons with no real URLs. The new site shows no social links. **Unblock:** the client supplies profile URLs. **Who:** owner, to ask the client.

## Claude can do

- Mirror the new design and copy into the Webflow backup once the owner approves the Vercel version (see `CLAUDE.md` → Webflow mirror).
