// ============================================================
// SITE DATA ADAPTER
//
// There is NO hand-authored copy in this file, or in any .astro
// file. Every string a visitor reads comes from src/site-data.json,
// which the delivery pipeline drops in per client.
//
// This module only loads that JSON and derives values from it
// (slugs, hrefs, formatted lists). Logic lives here; copy does not.
// ============================================================

import data from "../site-data.json";

export type SiteData = typeof data;
export type Service = SiteData["services"][number];
export type Location = SiteData["locations"][number];
export type Faq = { q: string; a: string };

export const site = data;

/** Production builds set PUBLIC_IS_PRODUCTION=true. Previews leave it unset → noindex. */
export const isProd = import.meta.env.PUBLIC_IS_PRODUCTION === "true";

/** tel: href with all non-digits stripped. */
export const telHref = `tel:${site.business.phone.replace(/\D/g, "")}`;

export const mailtoHref = `mailto:${site.business.email}`;

/**
 * Area links are derived from `locations[]`, never from the
 * `business.serviceAreas` strings — locations carry the explicit slug
 * that [city].astro builds its routes from, so links can never point
 * at a route that was not generated.
 */
export const areaLinks = site.locations.map((l) => ({
  name: l.city,
  slug: l.slug,
  href: `/service-areas/${l.slug}`,
}));

/** "A, B & C" — for prose. Falls back gracefully for 0/1/2 entries. */
export function formatList(items: readonly string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} & ${items[items.length - 1]}`;
}

export const areasFormatted = formatList(site.business.serviceAreas);

/** Lowercased trade for mid-sentence use ("landscaping services in …"). */
export const tradeLower = site.business.trade.toLowerCase();

/**
 * Years in business is only shown when the intake actually supplied it.
 * A `0` means "not stated" — rendering "0+ years" would be a false claim.
 */
export const hasYears = typeof site.about.yearsInBusiness === "number" && site.about.yearsInBusiness > 0;

/** US-XX region code from the tail of `business.address` ("Quakertown, PA" → "US-PA"). */
export const geoRegion = `US-${site.business.address.split(",").pop()?.trim() ?? ""}`;

/**
 * schema.org type for the trade. Only maps trades that have a real
 * schema.org subtype; anything else stays LocalBusiness rather than
 * being forced into a type that does not exist.
 */
const SCHEMA_TYPES: Record<string, string> = {
  Plumbing: "Plumber",
  HVAC: "HVACBusiness",
  Electrical: "Electrician",
  Roofing: "RoofingContractor",
  "General Contractor": "GeneralContractor",
};

export const schemaType = SCHEMA_TYPES[site.business.trade] ?? "LocalBusiness";

/**
 * Warley Digital attribution — fixed by contract, identical on every client
 * site, so it is template-level and not part of the per-client data.
 */
export const ATTRIBUTION = {
  text: "Site by Warley Digital",
  url: "https://websites.warleyd.com",
};

/** Optional OG image — only emitted when the data supplies one. */
export const ogImage: string | undefined = (site.seo as { ogImage?: string }).ogImage;

export interface HoursBlock {
  days: string[];
  opens: string;
  closes: string;
}

const business = site.business as typeof site.business & {
  hours?: HoursBlock[];
  closedDays?: string[];
  reviews?: { rating: number; count: number; source: string; url?: string };
};

export const hours: HoursBlock[] = business.hours ?? [];
export const closedDays: string[] = business.closedDays ?? [];

/** "8:00 AM" from "08:00" — display only; the schema keeps the 24h form. */
function to12h(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour} ${period}` : `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

/** "Mon–Fri" from a run of consecutive days, else "Mon, Wed". */
const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SHORT: Record<string, string> = {
  Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu",
  Friday: "Fri", Saturday: "Sat", Sunday: "Sun",
};

function formatDays(days: string[]): string {
  if (days.length === 0) return "";
  if (days.length === 1) return SHORT[days[0]] ?? days[0];
  const idx = days.map((d) => DAY_ORDER.indexOf(d)).sort((a, b) => a - b);
  const consecutive = idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
  return consecutive
    ? `${SHORT[DAY_ORDER[idx[0]]]}–${SHORT[DAY_ORDER[idx[idx.length - 1]]]}`
    : idx.map((i) => SHORT[DAY_ORDER[i]]).join(", ");
}

/** Human-readable opening hours, derived from the same data the schema uses. */
export const hoursDisplay: { days: string; time: string }[] = [
  ...hours.map((b) => ({ days: formatDays(b.days), time: `${to12h(b.opens)} – ${to12h(b.closes)}` })),
  ...(closedDays.length > 0 ? [{ days: formatDays(closedDays), time: "Closed" }] : []),
];

/** schema.org openingHoursSpecification. Omitted entirely when no hours exist. */
export const openingHoursSpec = hours.map((b) => ({
  "@type": "OpeningHoursSpecification",
  dayOfWeek: b.days.map((d) => `https://schema.org/${d}`),
  opens: b.opens,
  closes: b.closes,
}));

/**
 * Review data shown as visible content only.
 *
 * Deliberately NOT emitted as schema.org aggregateRating: Google's
 * structured-data policy forbids self-serving markup of reviews that live on
 * another site. Displaying the figure with a link to the source is honest;
 * marking it up as our own would risk a manual action.
 */
export const reviews = business.reviews ?? null;

/** Every FAQ on the site, for a single FAQPage block. */
export function allFaqs(): Faq[] {
  const trade = site.pages?.services?.faq ?? [];
  const perService = site.services.flatMap((s) => s.detail?.faq ?? []);
  return [...trade, ...perService];
}
