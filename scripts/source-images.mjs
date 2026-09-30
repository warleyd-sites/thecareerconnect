/**
 * One-time image sourcing for a client site.
 *
 * Runs OFF the delivery path: it needs network, so it belongs to the "brain"
 * step, not the droplet build. It downloads, normalises and writes the files
 * into src/images/ plus a provenance manifest. After this runs, `npm run build`
 * is fully offline.
 */
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const OUT_DIR = process.argv[2] ?? "src/images";
const MANIFEST = path.join(OUT_DIR, "..", "image-credits.json");
const UA = { "User-Agent": "warleyd-site-builder/1.0 (warleydigitalseo@gmail.com)" };

const SPECS = JSON.parse(await readFile(process.argv[3] ?? "scripts/image-specs.json", "utf8"));

await mkdir(OUT_DIR, { recursive: true });

const manifest = existsSync(MANIFEST) ? JSON.parse(await readFile(MANIFEST, "utf8")) : {};

/**
 * Openverse's index for garden/landscaping terms is dominated by scanned
 * pre-1929 books and seed catalogues (Internet Archive Book Images), which
 * outrank modern photography no matter what licence filter is applied. A
 * 1911 engraving is useless as a hero image, so reject them outright.
 */
const ARCHIVAL = /\((1[6-9]\d\d|19[0-2]\d)\)|catalogue|catalog\b|journal|annual report|almanac|barn plans|book images|engraving|lithograph|herbarium|botanical print/i;

function looksArchival(r) {
  return ARCHIVAL.test(`${r.title ?? ""} ${r.creator ?? ""} ${r.source ?? ""}`);
}

/** Collect many candidates across query variants; the caller tries each in turn. */
async function candidatesOpenverse(spec) {
  const queries = [spec.q, ...(spec.alt_q ?? [])];
  const out = [];
  const seen = new Set();
  // Modern stock providers first; they carry present-day photography.
  const sources = spec.sources ?? ["stocksnap", "rawpixel", "flickr", ""];
  for (const source of sources) {
    for (const q of queries) {
      for (const wide of [false, true]) {
      const params = {
        q,
        license: spec.license ?? "cc0,pdm",
        mature: "false",
        page_size: "40",
      };
      if (source) params.source = source;
      if (!wide) params.size = "large";
      try {
        const res = await fetch("https://api.openverse.org/v1/images/?" + new URLSearchParams(params), { headers: UA });
        if (!res.ok) continue;
        const json = await res.json();
        for (const r of json.results ?? []) {
          if (!r.url || seen.has(r.url)) continue;
          if ((r.width ?? 0) < 640) continue;
          if (looksArchival(r)) continue;
          seen.add(r.url);
          out.push({
            downloadUrl: r.url,
            credit: {
              title: r.title ?? null,
              creator: r.creator ?? null,
              license: `${String(r.license).toUpperCase()}${r.license_version ? " " + r.license_version : ""}`,
              licenseUrl: r.license_url ?? null,
              source: r.source ?? "openverse",
              page: r.foreign_landing_url ?? null,
              attributionRequired: !/^(cc0|pdm)$/i.test(r.license),
            },
          });
        }
      } catch {
        /* try the next variant */
      }
      }
    }
  }
  return out;
}

/** Commons free-text search, filtered to licenses needing no attribution. */
async function candidatesCommonsSearch(spec) {
  const queries = [spec.q, ...(spec.alt_q ?? [])];
  const out = [];
  for (const q of queries) {
    try {
      const res = await fetch(
        "https://commons.wikimedia.org/w/api.php?" +
          new URLSearchParams({
            action: "query",
            generator: "search",
            gsrsearch: q,
            gsrnamespace: "6",
            gsrlimit: "30",
            prop: "imageinfo",
            iiprop: "url|extmetadata|size|mime",
            iiurlwidth: "1600",
            format: "json",
          }),
        { headers: UA },
      );
      const json = await res.json();
      for (const p of Object.values(json?.query?.pages ?? {})) {
        const ii = p.imageinfo?.[0];
        if (!ii || !/jpeg|png/.test(ii.mime ?? "")) continue;
        if ((ii.width ?? 0) < 900) continue;
        const md = ii.extmetadata ?? {};
        const strip = (v) => (v ? String(v).replace(/<[^>]*>/g, "").trim() : null);
        const license = strip(md.LicenseShortName?.value) ?? "unknown";
        if (!/^(cc0|public domain|pd-|no restrictions)/i.test(license)) continue;
        if (ARCHIVAL.test(p.title)) continue;
        out.push({
          downloadUrl: ii.thumburl ?? ii.url,
          credit: {
            title: p.title.replace(/^File:/, ""),
            creator: strip(md.Artist?.value),
            license,
            licenseUrl: strip(md.LicenseUrl?.value),
            source: "Wikimedia Commons",
            page: ii.descriptionurl ?? null,
            attributionRequired: false,
          },
        });
      }
    } catch {
      /* try the next variant */
    }
  }
  return out;
}

async function pickCommons(spec) {
  const url =
    "https://commons.wikimedia.org/w/api.php?" +
    new URLSearchParams({
      action: "query",
      titles: `File:${spec.title}`,
      prop: "imageinfo",
      iiprop: "url|extmetadata|size",
      iiurlwidth: "1600",
      format: "json",
    });
  const res = await fetch(url, { headers: UA });
  const json = await res.json();
  const page = Object.values(json?.query?.pages ?? {})[0];
  const ii = page?.imageinfo?.[0];
  if (!ii) throw new Error(`commons file not found: ${spec.title}`);
  const md = ii.extmetadata ?? {};
  const strip = (v) => (v ? String(v).replace(/<[^>]*>/g, "").trim() : null);
  const license = strip(md.LicenseShortName?.value) ?? "unknown";
  return {
    downloadUrl: ii.thumburl ?? ii.url,
    credit: {
      title: spec.title,
      creator: strip(md.Artist?.value),
      license,
      licenseUrl: strip(md.LicenseUrl?.value),
      source: "Wikimedia Commons",
      page: ii.descriptionurl ?? null,
      attributionRequired: !/^(cc0|public domain|pd-|no restrictions)/i.test(license),
    },
  };
}

let ok = 0;
const failures = [];

for (const spec of SPECS) {
  const outPath = path.join(OUT_DIR, spec.out);
  if (spec.skip || (existsSync(outPath) && !spec.force)) {
    console.log(`⏭  keep   ${spec.out}`);
    ok++;
    continue;
  }

  // An exact Commons file, else a ranked candidate list we fall through.
  let candidates;
  if (spec.source === "commons" && spec.title) {
    candidates = [await pickCommons(spec).catch(() => null)].filter(Boolean);
  } else {
    candidates = [...(await candidatesOpenverse(spec)), ...(await candidatesCommonsSearch(spec))];
  }

  let done = false;
  let lastErr = "no candidates";
  for (const cand of candidates.slice(0, 12)) {
    try {
      const img = await fetch(cand.downloadUrl, { headers: { ...UA, Referer: "https://openverse.org/" } });
      if (!img.ok) throw new Error(`download ${img.status}`);
      const buf = Buffer.from(await img.arrayBuffer());

      // Normalise: crop to a consistent banner ratio, strip EXIF, re-encode.
      const out = await sharp(buf)
        .rotate()
        .resize({ width: 1600, height: 1100, fit: "cover", position: "attention" })
        .jpeg({ quality: 82, mozjpeg: true })
        .toBuffer();
      await writeFile(outPath, out);

      manifest[spec.out] = { ...cand.credit, alt: spec.alt, usedFor: spec.usedFor };
      ok++;
      done = true;
      const flag = cand.credit.attributionRequired ? "⚠️ ATTRIB" : "✅ free  ";
      console.log(
        `${flag} ${spec.out.padEnd(42)} ${cand.credit.license.padEnd(16)} ${String(cand.credit.title ?? "").slice(0, 40)}`,
      );
      break;
    } catch (e) {
      lastErr = e.message;
    }
  }
  if (!done) {
    failures.push(`${spec.out}: ${lastErr} (${candidates.length} candidates tried)`);
    console.log(`❌ FAIL   ${spec.out.padEnd(42)} ${lastErr}`);
  }
}

await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
console.log(`\n${ok}/${SPECS.length} sourced. Manifest → ${MANIFEST}`);
if (failures.length) {
  console.log("\nFailures:");
  for (const f of failures) console.log("  " + f);
}
