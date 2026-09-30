# VISION.md — WarleyD Client Site Template

## §1 — Product intent
**A reusable Astro template for trade-business client sites** (plumbing, HVAC, landscaping, roofing, electrical). Each client order from `websites.warleyd.com` becomes a new clone of this template with the data layer filled in.

The template is the **production engine** behind WarleyD's flyer-to-website-hub service ($300 / 3-page / 72-hour SLA). It exists to make per-client turnaround fast, repeatable, and high quality.

## §2 — Target user
- **Trade business owners** (plumbers, electricians, HVAC techs, etc.) — typically solo or small team, mobile-first, phone-as-primary-contact
- **Charles**, when fulfilling a flyer-to-website-hub order
- **Claude Code**, when reading `BUILD_INSTRUCTIONS.md` to assemble a clone

Not enterprise. Not e-commerce. Not multi-vertical SaaS.

## §3 — Look and feel
> Production bar: see `./PRODUCTION_BAR.md` (generated — do not edit). This section captures only what defines *this* product's identity on top of the bar.

- Clean, trade-appropriate aesthetic — competent and approachable, not slick or "tech-bro"
- Big phone number, clear service list, simple contact form
- Color palette per client (default: WarleyD orange + navy)
- Trade-relevant emoji service icons (default; client may swap)
- Mobile-first — most trade leads come from mobile search

## §4 — Production quality bar
- Lighthouse Perf ≥ 90 (static Astro — should be achievable)
- Lighthouse A11y ≥ 90
- Lighthouse SEO ≥ 90 (per-vertical landing page for primary city)
- Build green on every push
- Contact form delivers reliably via Resend
- No JavaScript errors in browser console

## §5 — Non-goals
- No CMS (clones are static; clients call WarleyD for content updates)
- No client login / portal
- No e-commerce, scheduling integration, or live chat
- No A/B testing infrastructure
- No analytics beyond Plausible (privacy-respecting; not for enterprise reporting)
- No multi-language

## §6 — Strategic choices
- **Astro** chosen for speed (static + zero JS by default), familiarity (HTML-first), and Vercel-native deploy
- **Tailwind** for fast theme customization per client
- **Per-client clones, not multi-tenant** — clones diverge cleanly, no cross-client risk, no shared deploy blast radius
- **Resend** for the contact form — simple, free tier sufficient for most clients
- **`src/site-data.json` as single source of truth** — Claude only needs to fill in one file; rest is generic Astro components reading from it

## §7 — Brand
This template is internal infrastructure for WarleyD; per-client clones carry the client's brand entirely. Template's "demo instance" deploys to `warleyd-client-template.vercel.app` (or similar) as a portfolio piece showing what WarleyD delivers.

## §8 — What Claude must NEVER decide unilaterally
- **Changing the form-field schema** in `BUILD_INSTRUCTIONS.md` (mirrors the order form on `websites.warleyd.com`)
- **Switching templates to a different framework** (Next.js, SvelteKit, etc.) — Astro is the deliberate choice
- **Adding paid features** beyond what's in $300 / 3-page / 72-hour
- **Adding a CMS** — clones are deliberately static
- **Changing the per-client-repo pattern** to multi-tenant

## §9 — Open questions (owner input required)
- Should there be a second template variant for service-area-heavy clients (more `[city].astro` pages, regional SEO)?
- Should the contact form route to a Google Sheet in addition to email (per flyer-to-website-hub pattern)?
- Is the demo instance worth keeping deployed, or should it be archived once enough live clones exist as proof?
- Should template updates auto-propagate to existing client clones via a sync script, or stay manual?

## §10 — Quality bar in one line
**A client should look at their finished site and think "this looks like a real business, not a template."** That's the moat.
