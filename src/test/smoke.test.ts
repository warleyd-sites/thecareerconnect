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
import Footer from "../components/Footer.astro";
import Nav from "../components/Nav.astro";
import { site, allFaqs, schemaType, hours, closedDays, openingHoursSpec, reviews } from "../config/site";
import { hasImage } from "../lib/images";
import vercelConfig from "../../vercel.json";
import { POST } from "../../api/contact";

/** Astro escapes `&`, `<`, `>` in rendered text — match what the browser gets. */
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

describe("smoke: components render", () => {
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
    expect(site.home.aboutParagraph).toBeTruthy();
    expect(site.about.story).toBeTruthy();
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

  it("has unique service slugs", () => {
    const svc = site.services.map((s) => s.slug);
    expect(new Set(svc).size).toBe(svc.length);
  });

  it("keeps the old Webflow service URLs working without redirects", () => {
    // These paths are indexed and linked from the old site. Renaming a slug
    // breaks them unless a redirect is added to vercel.json.
    const slugs = site.services.map((s) => s.slug);
    for (const old of ["career-counseling", "internship-opportunities", "job-search-support", "networking-skills", "professional-development", "workshops"]) {
      expect(slugs, `/services/${old} must still exist`).toContain(old);
    }
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
      ...site.home.audiences.map((a) => a.image),
      ...site.testimonials.items.map((t) => t.image),
      site.about.ownerImage,
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
      ...site.home.audiences.map((a) => a.image),
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

describe("old Webflow URLs", () => {
  const redirects = new Map(vercelConfig.redirects.map((r) => [r.source, r.destination]));

  it("redirects every page path the old site used", () => {
    // Paths crawled from thecareerconnect.webflow.io on 2026-09-30.
    expect(redirects.get("/about-us")).toBe("/about");
    expect(redirects.get("/our-blog")).toBe("/blog");
    expect(redirects.get("/post/:slug")).toBe("/blog/:slug");
    expect(redirects.get("/contact-us/:path*")).toBe("/contact");
    expect(redirects.get("/privacy-policy/:path*")).toBe("/privacy");
  });

  it("keeps every old blog post slug so /post/<slug> lands on a real page", () => {
    const posts = readdirSync(new URL("../content/blog", import.meta.url)).map((f) => f.replace(/\.md$/, ""));
    for (const old of [
      "10-great-examples-of-responsive-resumes",
      "20-myths-about-interviews",
      "5-principles-of-effective-networking",
      "7-things-about-choosing-careers-you-should-know",
      "what-will-the-career-field-be-like-in-100-years",
    ]) {
      expect(posts, `blog post ${old} must still exist`).toContain(old);
    }
  });
});

describe("contact endpoint", () => {
  const post = (body: unknown) =>
    POST(new Request("http://x/api/contact", { method: "POST", body: JSON.stringify(body) }));

  it("rejects a message with no name, naming the field", async () => {
    const res = await post({ email: "a@b.co", message: "hi" });
    expect(res.status).toBe(400);
    expect((await res.json()).field).toBe("name");
  });

  it("rejects an invalid email", async () => {
    const res = await post({ name: "A", email: "nope", message: "hi" });
    expect((await res.json()).field).toBe("email");
  });

  it("silently accepts honeypot submissions without sending", async () => {
    const res = await post({ name: "Bot", email: "b@b.co", message: "spam", website: "http://spam" });
    expect(res.status).toBe(200);
  });

  it("fails closed when Resend is not configured", async () => {
    const prev = process.env.RESEND_API_KEY;
    delete process.env.RESEND_API_KEY;
    const res = await post({ name: "A", email: "a@b.co", message: "hi" });
    expect(res.status).toBe(500);
    if (prev) process.env.RESEND_API_KEY = prev;
  });
});

describe("booking", () => {
  it("books through the client's Calendly page", () => {
    const url = new URL(site.booking.url);
    expect(url.protocol).toBe("https:");
    expect(url.hostname).toBe("calendly.com");
  });

  it("lets Calendly through the content security policy", () => {
    const csp = vercelConfig.headers[0].headers.find((h) => h.key === "Content-Security-Policy")!.value;
    expect(csp).toMatch(/script-src[^;]*https:\/\/assets\.calendly\.com/);
    expect(csp).toMatch(/frame-src[^;]*https:\/\/calendly\.com/);
    // The popup's close button is an image from assets.calendly.com.
    expect(csp).toMatch(/img-src[^;]*https:\/\/assets\.calendly\.com/);
  });
});
