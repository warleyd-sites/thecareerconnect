# WarleyD Client Site Template

Reusable **Astro template** for trade-business client sites (plumbing, HVAC, landscaping, roofing, electrical). Each client deploys gets a clone of this repo with `src/site-data.json` filled in from their order form on [`websites.warleyd.com`](https://websites.warleyd.com).

> **For Claude Code:** read [`CLAUDE.md`](./CLAUDE.md) → [`VISION.md`](./VISION.md) → [`BUILD_INSTRUCTIONS.md`](./BUILD_INSTRUCTIONS.md) before any non-trivial change. If you're cloning this template to build a real client site, follow [`BUILD_INSTRUCTIONS.md`](./BUILD_INSTRUCTIONS.md) end to end.

## Quick start (template editing)

```bash
npm install
npm run dev       # Astro dev server on http://localhost:4321
npm run build     # production build (validates everything compiles)
npm run preview   # preview the production build
```

## Per-client clone workflow

```bash
# 1. Create the new client repo from this template
gh repo create warleyd-sites/<client-name> --template warleyd-sites/warleyd-client-template

# 2. Clone locally
git clone https://github.com/warleyd-sites/<client-name>.git
cd <client-name>

# 3. Follow BUILD_INSTRUCTIONS.md:
#    - Fill `src/site-data.json` from the order form (Step 1)
#    - Generate page copy (Step 2+)

# 4. Push to master — Vercel auto-deploys
git push origin master
```

Configure a custom domain in Vercel + per-domain sending in Resend after first deploy.

## Architecture

- **Astro 4.x** static site generator with `@astrojs/vercel` adapter
- **Tailwind CSS** for per-client theming
- **Resend** for the contact form (key in `.env`)
- **Single SSOT** at [`src/site-data.json`](./`src/site-data.json`) — the only data file most clones need to edit

```
warleyd-client-template/
├── src/
│   ├── config/`src/site-data.json`        # SSOT — fill this in per client
│   ├── layouts/Layout.astro
│   ├── components/           # Hero, Services, Footer, Nav, ContactForm
│   ├── pages/                # index, about, services, contact, service-areas/[city]
│   └── pages/api/contact.ts  # Resend POST handler
├── BUILD_INSTRUCTIONS.md     # the authoritative build prompt for Claude
├── CLAUDE.md
├── VISION.md
├── STATUS.md
└── SECURITY.md
```

## Environment variables

Copy `.env.example` to `.env` (gitignored). Required:

```
RESEND_API_KEY=re_xxx   # WarleyD's Resend account; per-domain sending set up after first deploy
```

## Quality bar

Trade client sites should hit:
- Lighthouse Perf ≥ 90 (static Astro — should be effortless)
- Lighthouse A11y ≥ 90
- Lighthouse SEO ≥ 90
- Contact form delivers reliably via Resend

## Security

See [`SECURITY.md`](./SECURITY.md). Note that security fixes here don't auto-propagate to per-client clones — manual sync (or future script) required.

## License

No license declared — this is WarleyD internal infrastructure. Per-client clones inherit the template's terms.
