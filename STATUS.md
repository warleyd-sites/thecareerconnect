# STATUS — WarleyD Client Site Template

**Last updated:** 2026-06-05
**Phase:** stable template (low-churn — updates benefit all future clones)
**Live URL:** _Vercel demo instance (placeholder content)_
**Repo:** https://github.com/warleyd-sites/warleyd-client-template

## Current focus
Recent: canonical URL build error fixed when `Astro.site` is not configured (`6e1c0b0`). Initial Astro template with site.ts config system (`ae78a0e`).

## Blockers
- No CI workflow in place — build only runs on Vercel push, not via GitHub Actions
- README.md missing — replaced by this PR with link to BUILD_INSTRUCTIONS
- `package-lock.json` not yet tracked (was untracked, .gitignore doesn't ignore it but it wasn't committed) — fixed this iteration

## Open owner action items
See root `OWNER_ACTIONS.md` for portfolio-wide tasks. Project-specific:
- [ ] Create Sentry project `warleyd / warleyd-client-template` → wire DSN (or decide it's not worth the noise for a static Astro template)
- [ ] Decide whether to deploy the demo instance to a stable URL (currently no live URL noted)
- [ ] Resolve VISION.md §9 open questions (second template variant, contact form → Sheets, demo instance keep/archive, template sync to clones)
- [ ] Confirm Resend per-domain sending setup process for new clones is documented somewhere (BUILD_INSTRUCTIONS doesn't currently cover it)

## Recent shipping
- 2026-06-04: Canonical URL build-error fix when `Astro.site` not configured (`6e1c0b0`)
- 2026-06-04: Initial Astro template with `site.ts` config system (`ae78a0e`)
- 2026-06-05: Portfolio hygiene baseline — CLAUDE.md, VISION.md, STATUS.md, SECURITY.md, README.md, .editorconfig, .prettierrc, renovate.json, CI workflow

## Architecture (one-liner)
Astro 4 + Tailwind + @astrojs/vercel adapter. Contact form via Resend (`src/pages/api/contact.ts`). Single SSOT (`src/config/site.ts`). 5 pages, 1 layout, 5 components. **Per-client clones, not multi-tenant.**

## Hard constraints (don't change without owner OK)
- Form-field schema in `BUILD_INSTRUCTIONS.md` — mirrors the order form on `websites.warleyd.com`; changes break the build pipeline
- Astro choice — never swap to Next.js / SvelteKit / etc.
- Per-client repos — never multi-tenant
- No CMS — clones are deliberately static
- Pricing tier ($300 / 3-page / 72-hour) — owner approval

## Workflow reference
For new client clones, the workflow is documented in [`BUILD_INSTRUCTIONS.md`](./BUILD_INSTRUCTIONS.md):
1. `gh repo create warleyd-sites/<client> --template warleyd-sites/warleyd-client-template`
2. Fill `src/config/site.ts` from the order form per Step 1 mapping table
3. Generate custom copy per Step 2+
4. Push → Vercel deploys → configure domain → send client the URL

---

> This file is updated at the end of every working session. Keep it short — the goal is "what's the state in 30 seconds."
