# Career Connect Consultants — website

The website for Career Connect Consultants, LLC: **thecareerconnect.net** (hosted on Vercel).
Built by [Warley Digital](https://websites.warleyd.com), from the `warleyd-client-template` Astro starter.

The previous Webflow site at `thecareerconnect.webflow.io` stays up as a backup and is kept in step with this repo (see `CLAUDE.md`).

## Editing content

Almost everything a visitor reads lives in data files, not in page code:

| What | Where |
|---|---|
| Business details, services, pricing, testimonials, page copy, button labels | `src/site-data.json` |
| Blog posts (one Markdown file per post; the filename is the URL) | `src/content/blog/` |
| Privacy policy and terms | `src/content/legal/` |
| Photos (referenced by filename from the files above) | `src/images/` |
| Brand colors | `colors` in `src/site-data.json` |

## Running it

```bash
npm install
npm run dev                                # http://localhost:4321
npm test                                   # data, honesty and endpoint checks
npm run build                              # preview build: noindex, no sitemap
PUBLIC_IS_PRODUCTION=true npm run build    # production build: indexable, with sitemap
```

The contact form posts to `api/contact.ts`, a Vercel Function. It does not run under `npm run dev`; use `vercel dev` to test it locally. Environment variables are listed in `.env.example`.

## Old Webflow URLs

`vercel.json` redirects the old site's paths (`/about-us`, `/our-blog`, `/post/<slug>`, `/contact-us/...`, `/privacy-policy/...`) to their new homes. Service URLs (`/services/<slug>`) are unchanged. Tests fail if a slug the old site used disappears.
