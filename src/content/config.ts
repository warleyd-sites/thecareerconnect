import { defineCollection, z } from "astro:content";

// Blog posts are Markdown files in src/content/blog. The filename is the URL
// slug, so /blog/<filename-without-.md>. `image` is a bare filename from
// src/images, resolved the same way as every other image on the site.
const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().min(50).max(300),
    category: z.enum(["Career", "Post-school", "Education"]),
    date: z.coerce.date(),
    image: z.object({ file: z.string(), alt: z.string() }).optional(),
  }),
});

// Privacy policy and terms: Markdown so the wording is editable like any
// other copy. The filename is the URL (/privacy, /terms).
const legal = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().min(50).max(300),
    updated: z.coerce.date(),
  }),
});

export const collections = { blog, legal };
