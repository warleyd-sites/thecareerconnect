# CLAUDE.md — Career Connect Consultants site

Client site for Career Connect Consultants, LLC (founder Carla Mackey, Laurel MD). Read with the global rules in `~/.claude/CLAUDE.md`.

## What this repo is

- **Astro 4 static site**, cloned from `warleyd-sites/warleyd-client-template` on 2026-09-30 (template commit `d690e5c`), then extended: blog and legal content collections, pricing and testimonials pages, a brand-kit theme, and a root `/api/contact.ts` Vercel Function.
- **Production:** Vercel, domain `thecareerconnect.net` (registered 2026-09-30 on Cloudflare).
- **Backup:** the Webflow site `thecareerconnect.webflow.io`. See "Webflow mirror" below.

## Rules carried over from the template

- **No visitor-facing copy in `.astro` files.** Copy lives in `src/site-data.json` (including UI labels under `ui` and `form`), `src/content/blog/*.md` and `src/content/legal/*.md`.
- **Claim nothing the client hasn't stated.** Every claim on the site traces to the client's old Webflow site or to the client directly: pricing, the NDA, the 24-hour response time, service areas, office hours. No invented stats, reviews, credentials or years in business (`yearsInBusiness: 0` = not stated).
- **Never present a stock photo as the client's own work.** Alt text describes what is shown, never "our clients" or "our team".
- **The build runs with no network and no model.**
- **Previews are noindex.** Only a build with `PUBLIC_IS_PRODUCTION=true` is indexable.

## Brand (from the client's brand kit, 2026-09-30)

Navy `#052649`, blue `#0E508D`, orange `#E97D22`, gold `#C49C5E`. Montserrat for the interface and headings; Libre Baskerville for body text and italic display lines. Tagline: "Connecting Talent to Opportunity". The hex codes printed in the kit image were garbled, so these values were sampled from the image pixels.

Primary buttons use **navy text on orange**. White on `#E97D22` is about 2.9:1 and fails WCAG AA; don't "fix" it back to white.

The orange swoosh (hero, `PageHeader`) is the one recurring brand gesture. Don't add more decoration.

## Webflow mirror

The owner wants the Webflow site kept as a backup that tracks this one. When a change here is published:

1. Deploy here first (Vercel is the source of truth).
2. Mirror the same content change in the Webflow site through the Webflow MCP, then publish Webflow.
3. Note in the commit or PR that Webflow was updated, or name what wasn't mirrored.

Webflow can't run the contact function or the blog/legal Markdown directly. Mirror their **content**, not their mechanics.

## Commands

```bash
npm test                                   # the gate
npm run build && npx astro preview         # look at it
```

Git author must be `charles.warleyd@gmail.com` for Vercel deploys (see portfolio memory).

## Open work

`docs/OPEN_GAPS.md`.
