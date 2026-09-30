# CLAUDE.md — WarleyD Client Site Template

Repo-specific guidance for Claude Code. Read this in addition to the global rules in `~/.claude/CLAUDE.md`.

## What this repo IS

A **template** for client trade sites (plumbing, HVAC, landscaping, roofing, electrical, etc.) sold via `websites.warleyd.com`. Each client gets a clone with `src/site-data.json` replaced by their own data.

This is the **build-it-once-clone-it-per-client** pattern. The template rarely changes; the per-client clones differ only in data and images.

> **The data layer moved.** It used to be `src/config/site.ts`, hand-edited per client, with copy also written directly into `.astro` files. It is now **`src/site-data.json`**, and `src/config/site.ts` is a thin typed adapter over it. **No visitor-facing copy lives in any `.astro` file.** If you are about to type a sentence a visitor will read into a `.astro` file, stop — it belongs in the data.

## Required Reading

Before any non-trivial change, read in this order:

1. **`VISION.md`** — template intent, what stays template-level vs. per-client.
2. **`BUILD_INSTRUCTIONS.md`** — how an order becomes a finished site. **Follow this when cloning for a real client.**
3. **`src/site-data.json`** — the SSOT. For a client clone this is the only data file you edit.
4. **`../READINESS_RUBRIC.md`** — MARKETING_SITE category bar.

## Build / Test Commands

```bash
npm install
npm run dev                                # dev server
npm run build                              # preview build — noindex, no sitemap
PUBLIC_IS_PRODUCTION=true npm run build    # live build — indexable + sitemap
npm run preview                            # serve the built site
npm test                                   # data + rendering + honesty checks
```

`npm test` is the real gate. It fails if copy leaks into `.astro` files, if an image slot points at a missing file, if two city pages share body copy, or if an unverifiable claim appears in the template.

**The build must run with no network and no model.** That is what keeps delivery off metered inference. Never add a build step that fetches anything.

## Git Workflow

- **Template repo (this one):** branch from `master` as `claude/<short-description>`, open a PR.
- **Per-client clones:** a new repo per client at `warleyd-sites/<slug>`, not a branch here.

## Auto-Merge Policy

**Doc-only PRs may be auto-merged.** Doc-only = `*.md`, `*.mdx`, `*.txt`, `public/robots.txt`, `LICENSE`, `.gitignore` comment-only.

**Anything else requires explicit go-ahead.** Especially: `src/site-data.json` schema changes, `BUILD_INSTRUCTIONS.md` workflow changes, `astro.config.mjs`, `src/layouts/Layout.astro`.

## Hard Rules

- **NEVER put real client data in this repo.** The shipped `src/site-data.json` carries `"_sample": true` and demo copy. A client clone must drop `_sample`; a test fails if sample copy survives into real client data.
- **NEVER write visitor-facing copy into a `.astro` file.** Everything comes from `site-data.json`. The `.astro` files are loops and bindings.
- **NEVER assert a claim the intake does not support** — licensing, insurance, guarantees, free estimates, callback times, warranties, review counts. False claims create refund liability; honesty is the moat (`VISION.md`). A test enforces this.
- **NEVER present a stock photo as the client's own work.** Images are uncaptioned; licences live on `/credits`. A test checks alt text for authorship claims.
- **`yearsInBusiness: 0` means "not stated"** — the site hides the figure. Never default it to a guess.
- **NEVER add per-client code branches.** All customization is data-driven. No `if (client === 'finky') { ... }`.
- **NEVER add SSR unless unavoidable.** Trade sites are static; SSR adds cost without conversion lift.
- Per global rule: never leave work local. Commit + push the same session.

## Architecture Quick Reference

- **Astro 4.x** static site, **@astrojs/tailwind**, **@astrojs/sitemap**
- **Data layer:** `src/site-data.json` → `src/config/site.ts` (typed adapter + derived helpers: `telHref`, `areaLinks`, `areasFormatted`, `schemaType`, `isProd`)
- **Images:** originals in `src/images/`, resolved by filename via `src/lib/images.ts`, rendered through `src/components/SiteImage.astro`. Every slot is optional — an empty or missing one renders nothing.
- **Pages:** index, about, services, `services/[service]`, `service-areas/[city]`, contact, privacy, terms, credits, plus a generated `robots.txt`
- **Components:** Hero, Services, Footer, Nav, ContactForm, SiteImage
- **SEO:** canonical, Open Graph, Twitter card, JSON-LD (LocalBusiness + Service + FAQPage), sitemap and `robots.txt` — all derived from `seo.siteUrl`
- **Indexing gate:** every build is `noindex` and `Disallow: /` unless `PUBLIC_IS_PRODUCTION=true`
- **Contact form:** `src/pages/api/contact.ts`, Resend, needs `RESEND_API_KEY`

## Workflow for a new client clone

1. Create `warleyd-sites/<slug>` from this template
2. Read `BUILD_INSTRUCTIONS.md` end to end
3. Replace `src/site-data.json` with the client's data (drop `_sample`)
4. Source images (`node scripts/source-images.mjs`) and **review every one by eye** — licence filters are mechanical, relevance is not
5. `npm test && npm run build`, then click through `npm run preview`
6. Strip template-only docs, write a client-facing `README.md`
7. Deploy, set the custom domain, point `seo.siteUrl` at it, rebuild with `PUBLIC_IS_PRODUCTION=true`

The template itself should rarely change — only when a pattern benefits all clients.

## User testing (read by /user-test)

Protocol: `.claude/skills/user-test/SKILL.md` (synced from `portfolio-root/_portfolio/skills/user-test` — do not edit the copy). Findings: `docs/USER_TESTING.md`.

- type: TEMPLATE
- live: https://websites.warleyd.com
- dev: http://localhost:4321 (npm run dev)
- test account: (none yet — writes on live are blocked; add E2E_TEST_EMAIL / E2E_TEST_PASSWORD to .env.example to unblock)
- flows:
  - landing → contact form (Resend)
  - every page at 375px
- persona notes: client-site starter; findings here fix the template so every future client site inherits them
