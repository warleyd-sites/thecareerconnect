/// <reference types="vitest" />
import { getViteConfig } from "astro/config";

// Known noise: at startup Astro 4's content-collection sync logs
// "Error when evaluating SSR module src/content/config.ts: module is not
// defined" under Vitest 4's Vite. It does not affect any test; `npm run build`
// is what validates the collections against their schemas.
export default getViteConfig({
  test: {
    globals: true,
  },
});
