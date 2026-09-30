# Security Policy — WarleyD Client Site Template

> This is a **template** that's cloned per client. Security fixes here propagate to all future clones — but **existing clones do not auto-update**, so security findings need to be communicated separately when clones need patching.

## Reporting a vulnerability
Email **charles.warleyd@gmail.com** with details. Please do not file public issues for security problems.

## Supported versions
Only the `master` branch (the template head) receives security updates. Per-client clones get fixes by re-applying the template's diff manually (or via a future template-sync script).

## What we promise
- Acknowledge reports within 72 hours
- Fix critical vulnerabilities within 7 days
- Credit reporters in release notes if they want
- Notify all per-client clone owners if the finding affects deployed clones

## What's in scope
- **Resend API key exposure** — anything that puts `RESEND_API_KEY` in the client bundle (it's server-only via Astro API route)
- **Contact form abuse** — spam, lead pollution, contact-data leaks via `src/pages/api/contact.ts`
- **XSS, CSRF** on the contact form
- **Build-time secret leaks** — anything in `dist/` after `astro build` that shouldn't be there
- **Data leaks** — submitter PII via the contact form
- **Supply chain** (compromised dependencies; Renovate covers this)

## What's NOT in scope
- Findings on third-party services (Vercel / Resend — report to them directly)
- Social engineering of staff
- Physical attacks
- Denial of service via simple flooding
- Sample data in `src/site-data.json` (flagged `_sample`) — by design, not real PII

## Hard guarantees (do NOT regress without owner approval)
- Per-client repos — never multi-tenant (no cross-client blast radius)
- No CMS — clones stay static (no admin surface to attack)
- `RESEND_API_KEY` stays server-side (Astro API route, not `PUBLIC_` env var)
- Form-field schema mirrors `websites.warleyd.com` order form — never diverged silently

## Template-vs-clone security note
A security fix in this template MUST be communicated to every per-client clone owner (currently: Charles). There is no auto-sync mechanism — see VISION.md §9.
