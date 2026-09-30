import type { APIRoute } from "astro";
import { site, isProd } from "@/config/site";

/**
 * robots.txt is generated, not static, because it has to agree with the
 * noindex gate: a preview build tells crawlers to stay out entirely, and only
 * a production build opens the site up and advertises the sitemap.
 */
export const GET: APIRoute = () => {
  const siteUrl = site.seo.siteUrl;

  const body = isProd
    ? [
        "User-agent: *",
        "Allow: /",
        "",
        ...(siteUrl ? [`Sitemap: ${new URL("/sitemap-index.xml", siteUrl).href}`, ""] : []),
      ].join("\n")
    : ["# Preview build — not for indexing.", "User-agent: *", "Disallow: /", ""].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
