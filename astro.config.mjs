import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

// The canonical origin comes from the client data, so one template serves
// every client without a per-clone config edit. Canonical links, the sitemap
// and absolute OG URLs all depend on it.
import siteData from "./src/site-data.json" with { type: "json" };

const siteUrl = siteData?.seo?.siteUrl || undefined;
const isProd = process.env.PUBLIC_IS_PRODUCTION === "true";

export default defineConfig({
  output: "static",
  site: siteUrl,
  integrations: [
    tailwind(),
    // A preview build is noindex, so shipping a sitemap for it would send
    // crawlers mixed signals. Only production gets one.
    ...(siteUrl && isProd ? [sitemap()] : []),
  ],
});
