/**
 * Image resolver.
 *
 * site-data.json refers to images by bare filename ("quakertown-broad-st.jpg").
 * The files live in src/images/, so `astro:assets` can optimise them at build
 * time — resized, re-encoded, hashed, and served responsively. Nothing is
 * fetched at build time; the files must already be in the repo.
 *
 * A filename with no matching file resolves to undefined rather than throwing,
 * so a site whose image slots are still empty builds and renders cleanly.
 */

const modules = import.meta.glob<{ default: ImageMetadata }>(
  "../images/*.{jpg,jpeg,png,webp,avif}",
  { eager: true },
);

const byFilename = new Map<string, ImageMetadata>();
for (const [path, mod] of Object.entries(modules)) {
  const filename = path.split("/").pop();
  if (filename) byFilename.set(filename, mod.default);
}

/** A slot in site-data.json: which file, and what it shows. */
export interface ImageRef {
  file: string;
  /** Empty string marks a purely decorative image — screen readers skip it. */
  alt: string;
}

export function resolveImage(file?: string | null): ImageMetadata | undefined {
  if (!file) return undefined;
  return byFilename.get(file);
}

/** True when the slot is filled AND the file actually exists on disk. */
export function hasImage(ref?: ImageRef | null): boolean {
  return Boolean(ref?.file && byFilename.has(ref.file));
}

/** Drops slots whose files are missing, so galleries never render gaps. */
export function presentImages(refs?: readonly ImageRef[] | null): ImageRef[] {
  return (refs ?? []).filter((r) => hasImage(r));
}

/** How many images the build actually found — used by the smoke tests. */
export const availableImageCount = byFilename.size;
