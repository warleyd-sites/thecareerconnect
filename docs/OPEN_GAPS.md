# Open gaps — Career Connect site

Each entry: what is blocked, what unblocks it, who can do it.

## Needs the client or the owner

1. **Logo files.** The site uses a text-and-shape stand-in (`src/components/Logo.astro`, `public/favicon.svg`). The brand kit says transparent PNG and SVG files were provided. **Unblock:** drop the SVG into `public/`, then swap `Logo.astro` to an `<img>`. **Who:** owner, to get the files from the client.
2. **Where contact form messages go.** Default destination is `info@thecareerconnect.net`, but that domain has no MX records yet (registered 2026-09-30), so mail to it would bounce. **Unblock:** set `CONTACT_TO_EMAIL` in Vercel to an inbox the client reads, or set up email on the domain. **Who:** owner.
3. **Resend key on the Vercel project.** `RESEND_API_KEY` must be set for the form to send. The live endpoint returns 500 "Not configured" without it, and the form then shows its "didn't send, call us" message. **Unblock:** the owner saves the key to `~/.config/vercel-tokens/resend-thecareerconnect`; Claude sets it on the project and verifies the sending domain in Resend (DNS via Cloudflare). **Who:** owner, then Claude.
8. **Hobby plan.** Team `the-career-connect` is on Vercel Hobby, which is non-commercial only. **Unblock:** upgrade to Pro before launch. **Who:** owner or client.
4. **Founding year conflict.** The new brand kit says "EST. 2025"; the old site says "circa 2023", "est. 2023" and "© 2023". The site currently states no year. **Unblock:** the client confirms the year. **Who:** owner, to ask the client.
5. **Photo licensing.** All photos came from the old Webflow site; their source and licence are unknown, so there is no credits page. **Unblock:** confirm they were licensed (for example Canva or Adobe Stock), or replace them. **Who:** owner (built the old site).
6. **Blog bylines.** The old site listed placeholder-looking authors (Anna Dommno, Thomas Tammeo, Christie Lashan, Jonah Oberton, Mariah Roberts; every post page said "Jennifer Hudson, January 10, 2020"). The new site credits posts to "Career Connect". **Unblock:** the client names real authors if there are any. **Who:** owner, to ask the client.
7. **Social media links.** The old contact page had placeholder "[Facebook], [Twitter], [LinkedIn]" text and footer icons with no real URLs. The new site shows no social links. **Unblock:** the client supplies profile URLs. **Who:** owner, to ask the client.

## Claude can do

- **Domain.** `thecareerconnect.net` is an active Cloudflare zone (account OnlyWorkLife, zone `df5c84c7f7dfa6f00548984719d06d05`) with no DNS records. The `CLOUDFLARE_API_TOKEN` in the environment can read it (write access not yet tested). Once the Vercel project exists: add the domain in Vercel, create the records Vercel asks for (DNS-only, not proxied), set `PUBLIC_IS_PRODUCTION=true` on production and redeploy. The project now exists (team `the-career-connect`), so this is unblocked; waiting on the owner to say go.

- Mirror the new design and copy into the Webflow backup once the owner approves the Vercel version (see `CLAUDE.md` → Webflow mirror).
