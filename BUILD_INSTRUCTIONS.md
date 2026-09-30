# WarleyD Client Site — Build Instructions

How a client order becomes a finished site.

> **This changed.** The template used to be filled in by hand-editing
> `src/config/site.ts` and writing copy directly into `.astro` files. It is now
> **data-driven**: every visitor-facing string comes from `src/site-data.json`,
> and the `.astro` files contain no copy at all. Writing copy into a `.astro`
> file is a bug, not a shortcut.

---

## The split

| Step | Needs a model? | Needs network? | Where it runs |
|---|---|---|---|
| 1. Write `site-data.json` | yes | yes | plan-credit Routine ("brain") |
| 2. Source images | no model | yes | `scripts/source-images.mjs`, human-reviewed |
| 3. `npm run build` | **no** | **no** | droplet ("hands") |

Step 3 is deliberately dumb. Once `site-data.json` and `src/images/` are in
place, the build is pure templating — that is what keeps delivery off metered
inference.

---

## Step 1 — write `src/site-data.json`

Schema and acceptance rules live in the hub repo at
`automation/phase-1-delivery/site-data.routine.md`. Shape:

```
_sample        omit for real clients (its presence means "this is demo data")
business       name, trade, tagline, pitch, phone, email, address,
               primaryCity, serviceAreas[], heroImage
colors         primary, navy, accent
about          ownerName, yearsInBusiness, story
seo            siteUrl, description, titleSuffix, ogImage
home           aboutParagraph, ctaBullets[], stats[], gallery[]
services[]     name, slug, icon, description, image,
               detail{ intro, whatsIncluded[], process[], commonSigns[], faq[] }
locations[]    city, slug, neighborhoods[], image, body
pages.about    sections[], images[]
pages.services faq[]
pages.contact  responseLine, expectBullets[]
```

### Rules that are not negotiable

- **Claim nothing the intake does not support.** No licensing, insurance,
  guarantees, free estimates, callback times, warranties or review counts unless
  the client actually stated them. Tests fail the build if those phrases appear
  in a `.astro` file.
- **`yearsInBusiness: 0` means "not stated."** The site hides the figure rather
  than printing "0 years". Never default it to a guess.
- **Every `locations[].body` must be unique** and carry real local detail.
  Duplicate city pages are worse than no city pages.
- **`seo.siteUrl` must be the real canonical origin.** Canonical links, the
  sitemap and OG image URLs are all built from it.
- **`seo.description` runs 50–300 characters.**
- **Do not reuse `<trade> in <primaryCity>` as the home title** — the
  `/service-areas/<primaryCity>` page owns it. The home page uses the tagline.

---

## Step 2 — images

Images live in `src/images/`, referenced by bare filename from `site-data.json`
(`{ "file": "...", "alt": "..." }`). Astro resizes and re-encodes at build time,
so the repo holds originals only.

**Every image slot is optional.** An empty slot renders nothing and a missing
file resolves to nothing rather than breaking the build. Shipping with no images
is valid.

```bash
cp scripts/image-specs.example.json scripts/image-specs.json   # then edit
node scripts/source-images.mjs
```

The script queries Openverse and Wikimedia Commons, filters to licences that
permit commercial use (never NonCommercial — these are commercial sites),
downloads, crops to a common ratio, and writes `src/image-credits.json`.

**Review what it picks before shipping.** Licence filters are mechanical;
relevance is not. Two failure modes seen in practice:

- Restricting to public domain surfaces **pre-1929 book scans and seed
  catalogues**, because that is largely what "public domain" means. A 1911
  engraving is not a hero image.
- Place-name searches return **the wrong country**. "Coopersburg" returned a
  Dutch village before it returned the Pennsylvania borough.

Build a contact sheet and look at every image before it ships.

### Attribution

`src/image-credits.json` records the licence per file and `/credits` renders it.
Images run **uncaptioned**; the footer link to `/credits` is what satisfies
CC BY / CC BY-SA. Never caption a stock photo as the client's own work — a test
enforces this against alt text.

When the client supplies real photos: drop them into `src/images/`, repoint
`site-data.json`, and delete their rows from `image-credits.json`. The credits
page updates itself.

---

## Step 3 — build and verify

```bash
npm install
npm test                                   # data + rendering + honesty checks
npm run build                              # preview: noindex, no sitemap
PUBLIC_IS_PRODUCTION=true npm run build    # live: indexable + sitemap
```

Before handing anything over, confirm:

- build completes with **no network and no model**
- every route has a unique `<title>`, meta description and body
- no `PLACEHOLDER`, `lorem`, `undefined` or unrendered `{...}` in `dist/`
- NAP (name, address, phone) identical on every page
- preview build is `noindex` everywhere; the production build is not
- `_sample` is **absent** from the client's `site-data.json`

---

## Step 4 — ship

Each client gets their own transferable repo at `warleyd-sites/<slug>`, not a
branch of this template. Strip template-only docs (this file, `GO-*.md`,
`CONVENTIONS.md`, `VISION.md`, `PRODUCTION_BAR.md`, `CLAUDE.md`) and write a
client-facing `README.md` explaining how to edit `site-data.json`.
