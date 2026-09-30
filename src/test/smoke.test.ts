/**
 * Smoke tests: key Astro components render via the experimental Container
 * API, and the site-data.json the template ships with is internally coherent.
 *
 * These also guard the template's core promise — that no visitor-facing copy
 * is hard-coded in .astro files, and that no unverifiable claim is asserted.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import Hero from "../components/Hero.astro";
import Services from "../components/Services.astro";
import Footer from "../components/Footer.astro";
import Nav from "../components/Nav.astro";
import { site, areaLinks, allFaqs, schemaType, hours, closedDays, openingHoursSpec, reviews } from "../config/site";
import { hasImage } from "../lib/images";
import credits from "../image-credits.json";

/** Astro escapes `&`, `<`, `>` in rendered text — match what the browser gets. */
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

describe("smoke: components render", () => {
  it("renders the hero with values from the data", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Hero);
    expect(html).toContain(site.business.primaryCity);
    expect(html).toContain(site.business.phone);
  });

  it("renders the services section", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Services);
    expect(html).toContain(esc(site.services[0].name));
  });

  it("renders the nav and footer with the business name", async () => {
    const container = await AstroContainer.create();
    const nav = await container.renderToString(Nav);
    const footer = await container.renderToString(Footer);
    expect(nav).toContain(esc(site.business.name));
    expect(footer).toContain(esc(site.business.name));
  });
});

describe("smoke: site-data coherence", () => {
  it("has the fields every page depends on", () => {
    expect(site.business.name).toBeTruthy();
    expect(site.business.tagline).toBeTruthy();
    expect(site.business.trade).toBeTruthy();
    expect(site.business.primaryCity).toBeTruthy();
    expect(site.business.phone).toBeTruthy();
    expect(site.business.serviceAreas.length).toBeGreaterThan(0);
    expect(site.services.length).toBeGreaterThan(0);
    expect(site.locations.length).toBeGreaterThan(0);
    expect(site.home.aboutParagraph).toBeTruthy();
    expect(site.pages.about.sections.length).toBeGreaterThan(0);
    expect(site.pages.contact.responseLine).toBeTruthy();
  });

  it("gives every service a slug, name, description and detail", () => {
    for (const s of site.services) {
      expect(s.slug, `service ${s.name} needs a slug`).toBeTruthy();
      expect(s.name).toBeTruthy();
      expect(s.description).toBeTruthy();
      expect(s.detail?.intro, `service ${s.slug} needs detail.intro`).toBeTruthy();
    }
  });

  it("gives every location a slug and unique body copy", () => {
    const bodies = new Set<string>();
    for (const l of site.locations) {
      expect(l.slug, `location ${l.city} needs a slug`).toBeTruthy();
      expect(l.body, `location ${l.slug} needs body copy`).toBeTruthy();
      bodies.add(l.body);
    }
    expect(bodies.size, "every city page must have unique body copy").toBe(site.locations.length);
  });

  it("has unique service slugs and unique location slugs", () => {
    const svc = site.services.map((s) => s.slug);
    const loc = site.locations.map((l) => l.slug);
    expect(new Set(svc).size).toBe(svc.length);
    expect(new Set(loc).size).toBe(loc.length);
  });

  it("only links to service areas that actually generate a route", () => {
    const routes = new Set(site.locations.map((l) => `/service-areas/${l.slug}`));
    for (const a of areaLinks) expect(routes.has(a.href)).toBe(true);
  });

  it("never ships the demo record as a real client site", () => {
    const isSample = Boolean((site as unknown as { _sample?: boolean })._sample);
    if (!isSample) {
      const raw = JSON.stringify(site).toLowerCase();
      expect(raw, "client data still contains template sample copy").not.toContain("sample ");
      expect(raw).not.toContain("ridgeline");
    }
  });

  it("carries no placeholder residue", () => {
    const raw = JSON.stringify(site).toLowerCase();
    for (const bad of ["placeholder", "lorem ipsum", "example.com", "555-0123"]) {
      expect(raw).not.toContain(bad);
    }
  });

  it("collects FAQs for structured data without duplicates", () => {
    const qs = allFaqs().map((f) => f.q);
    expect(qs.length).toBeGreaterThan(0);
    expect(new Set(qs).size).toBe(qs.length);
  });
});

describe("smoke: images", () => {
  it("resolves every image slot referenced by site-data.json", () => {
    const slots: { file: string; alt: string }[] = [
      site.business.heroImage,
      ...(site.home.gallery ?? []),
      ...(site.pages.about.images ?? []),
      ...site.services.map((s) => s.image),
      ...site.locations.map((l) => l.image),
    ].filter(Boolean) as { file: string; alt: string }[];

    // Zero images is valid — the template ships with empty slots. What must
    // never happen is a slot pointing at a file that is not in the repo.
    const missing = slots.filter((s) => !hasImage(s)).map((s) => s.file);
    expect(missing, `site-data.json points at files not in src/images: ${missing.join(", ")}`).toEqual([]);
  });

  it("gives every image alt text", () => {
    for (const s of site.services) {
      if (s.image) expect(s.image.alt, `service ${s.slug} image needs alt`).toBeTruthy();
    }
    for (const l of site.locations) {
      if (l.image) expect(l.image.alt, `location ${l.slug} image needs alt`).toBeTruthy();
    }
  });

  it("credits every image that requires attribution", () => {
    const required = Object.entries(credits as Record<string, { attributionRequired: boolean }>)
      .filter(([file, c]) => c.attributionRequired && hasImage({ file, alt: "" }));
    // Each must carry the fields the /credits page renders.
    for (const [file, c] of required) {
      const full = c as unknown as { license?: string; source?: string };
      expect(full.license, `${file} needs a licence`).toBeTruthy();
      expect(full.source, `${file} needs a source`).toBeTruthy();
    }
  });

  it("never claims a photo depicts the client's own work", () => {
    // Scoped to alt text: these are stock and public photos, so describing
    // them as the client's own jobs would be a false claim. Body copy is
    // exempt — "plenty of our work is one-time" is the client's own prose.
    const alts = [
      site.business.heroImage,
      ...(site.home.gallery ?? []),
      ...(site.pages.about.images ?? []),
      ...site.services.map((s) => s.image),
      ...site.locations.map((l) => l.image),
    ]
      .filter(Boolean)
      .map((i) => (i as { alt: string }).alt.toLowerCase());

    for (const alt of alts) {
      for (const claim of ["our work", "our recent", "we completed", "our portfolio", "our crew", "our team"]) {
        expect(alt, `alt text must not claim authorship: "${alt}"`).not.toContain(claim);
      }
    }
  });
});

describe("smoke: SEO", () => {
  it("has a canonical origin so canonical/OG/sitemap can be absolute", () => {
    expect(site.seo.siteUrl, "seo.siteUrl drives canonical links and the sitemap").toBeTruthy();
    expect(() => new URL(site.seo.siteUrl)).not.toThrow();
    expect(site.seo.siteUrl).toMatch(/^https:\/\//);
  });

  it("has a title suffix and a meta description of sensible length", () => {
    expect(site.seo.titleSuffix).toBeTruthy();
    expect(site.seo.description.length).toBeGreaterThan(50);
    expect(site.seo.description.length).toBeLessThanOrEqual(300);
  });

  it("points og:image at a file that exists", () => {
    const og = site.seo.ogImage ?? site.business.heroImage;
    if (og) expect(hasImage(og), `og image ${og.file} missing from src/images`).toBe(true);
  });

  it("gives the site a resolvable trade → schema.org type", () => {
    expect(schemaType).toBeTruthy();
    expect(schemaType).toMatch(/^[A-Z]/);
  });
});

describe("smoke: hours and reviews", () => {
  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  it("uses valid day names and 24h times in opening hours", () => {
    for (const block of hours) {
      expect(block.days.length).toBeGreaterThan(0);
      for (const d of block.days) expect(DAYS, `unknown day "${d}"`).toContain(d);
      expect(block.opens).toMatch(/^\d{2}:\d{2}$/);
      expect(block.closes).toMatch(/^\d{2}:\d{2}$/);
      expect(block.opens < block.closes, `${block.opens} must precede ${block.closes}`).toBe(true);
    }
  });

  it("never lists the same day twice across hour blocks", () => {
    const seen = hours.flatMap((b) => b.days).concat(closedDays);
    expect(new Set(seen).size).toBe(seen.length);
  });

  it("emits openingHoursSpecification only when hours exist", () => {
    expect(openingHoursSpec.length).toBe(hours.length);
    for (const spec of openingHoursSpec) {
      expect(spec.dayOfWeek.every((d) => d.startsWith("https://schema.org/"))).toBe(true);
    }
  });

  it("NEVER emits aggregateRating anywhere in the template", () => {
    // The reviews live on Google. Marking up someone else's reviews as our own
    // structured data breaches Google's policy and risks a manual action, so
    // the rating is visible content only. This test is the guard.
    const offenders: string[] = [];
    const walk = (dir: string): string[] =>
      readdirSync(dir).flatMap((e) => {
        const full = join(dir, e);
        return statSync(full).isDirectory() ? walk(full) : [full];
      });
    for (const f of walk(new URL("..", import.meta.url).pathname)) {
      if (!/\.(astro|ts)$/.test(f) || f.endsWith("smoke.test.ts")) continue;
      // Strip comments first: the codebase explains *why* it avoids
      // aggregateRating, and those explanations must not trip the guard. An
      // actual schema key in live code must.
      const code = readFileSync(f, "utf8")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/^\s*\/\/.*$/gm, "")
        .replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
      if (/["']?aggregateRating["']?\s*:/.test(code)) offenders.push(f);
    }
    expect(offenders).toEqual([]);
  });

  it("keeps review data honest when present", () => {
    if (!reviews) return;
    expect(reviews.rating).toBeGreaterThan(0);
    expect(reviews.rating).toBeLessThanOrEqual(5);
    expect(reviews.count).toBeGreaterThan(0);
    expect(reviews.source, "say where the reviews came from").toBeTruthy();
  });
});

describe("smoke: no copy hard-coded in .astro files", () => {
  const SRC = new URL("..", import.meta.url).pathname;

  function astroFiles(dir: string): string[] {
    return readdirSync(dir).flatMap((entry) => {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) return astroFiles(full);
      return full.endsWith(".astro") ? [full] : [];
    });
  }

  // Claims the intake does not capture. If a client genuinely is licensed or
  // insured, that belongs in site-data.json — never baked into the template.
  const FORBIDDEN = [
    "licensed & insured",
    "licensed & fully insured",
    "satisfaction guaranteed",
    "free quote",
    "free estimate",
    "within the hour",
    "24/7",
    "family-run",
    "family-owned",
  ];

  it("asserts no unverifiable claim anywhere in the template", () => {
    const offenders: string[] = [];
    for (const file of astroFiles(SRC)) {
      const text = readFileSync(file, "utf8").toLowerCase();
      for (const claim of FORBIDDEN) {
        if (text.includes(claim)) offenders.push(`${file.replace(SRC, "")} → "${claim}"`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
