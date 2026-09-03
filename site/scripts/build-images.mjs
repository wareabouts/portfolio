/**
 * Turn ../assets/originals (754 MB of archive-quality files) into web derivatives.
 *
 * The originals stay out of the deployed site: they're the archive, and GitHub Pages
 * has no business serving an 8333px JPEG. The content column is 806px wide, so 1600px
 * covers a 2x display comfortably.
 *
 * Animated GIFs become animated WebP (usually a large saving); if that fails for any
 * reason the original file is copied through so the animation is never silently lost.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '../..')
const SRC = path.join(ROOT, 'assets/originals')
const OUT = path.join(HERE, '../public/media')
const MANIFEST = path.join(ROOT, 'assets/manifest.json')

const WIDTHS = [400, 800, 1600]
const COVER = 600
const QUALITY = 80
// Animated frames multiply file size, so they get tighter limits than stills.
const ANIM_INLINE_W = 700
const ANIM_QUALITY = 65
// Grid covers autoplay, so their cost is paid on the landing page. They render at ~193px
// CSS, so 360px still covers a 2x display while keeping the whole grid affordable.
const ANIM_COVER = 360
const ANIM_COVER_QUALITY = 45
const CONCURRENCY = 6

const force = process.argv.includes('--force')

/** `rwc:x0x y0x w x h x out` or `carw:ar x ar x w` -> a sharp extract region. */
function parseCrop(crop, w, h) {
  if (!crop) return null
  const [kind, dims] = crop.split(':')
  const n = dims.split('x').map(Number)
  if (kind === 'rwc' && n.length === 5) {
    const [left, top, cw, ch] = n
    if (cw > 0 && ch > 0 && left + cw <= w && top + ch <= h) return { left, top, width: cw, height: ch }
    return null
  }
  // car/carw encode an aspect ratio -- centre-crop to it.
  if ((kind === 'car' || kind === 'carw') && n.length >= 2 && n[0] > 0 && n[1] > 0) {
    const ar = n[0] / n[1]
    let cw = w, ch = Math.round(w / ar)
    if (ch > h) { ch = h; cw = Math.round(h * ar) }
    return { left: Math.round((w - cw) / 2), top: Math.round((h - ch) / 2), width: cw, height: ch }
  }
  return null
}

/**
 * Build every derivative for one asset. `srcPath` overrides the archive location, which
 * is how import-draft.mjs builds from a file that will never be copied into originals.
 */
export async function processAsset(a, stats, srcPath) {
  const src = srcPath ?? path.join(SRC, `${a.uuid}.${a.ext}`)
  if (!fs.existsSync(src)) { stats.missing.push(a.uuid); return }

  const meta = await sharp(src, { animated: true }).metadata()
  const w = meta.width || a.download?.width || 0
  const h = (meta.pageHeight || meta.height || a.download?.height || 0)
  const animated = (meta.pages || 1) > 1
  const out = []

  if (animated) {
    const inlineW = Math.min(w, ANIM_INLINE_W)
    const dest = path.join(OUT, `${a.uuid}.webp`)
    let hasAnimCover = false
    try {
      if (force || !fs.existsSync(dest)) {
        await sharp(src, { animated: true })
          .resize({ width: inlineW, withoutEnlargement: true })
          .webp({ quality: ANIM_QUALITY, effort: 4 })
          .toFile(dest)
      }
      // The home grid shows 43 covers at once; animated ones there cost ~5 MB total.
      // So emit a static first-frame poster for the grid plus a separate animated
      // rendition the UI swaps in on hover. (No .extract() on animated input: sharp
      // lays frames out as a filmstrip, so a manual crop would slice them apart.)
      if (a.roles?.includes('cover')) {
        const poster = path.join(OUT, `${a.uuid}-cover.webp`)
        if (force || !fs.existsSync(poster)) {
          await sharp(src) // no `animated` -> first frame only
            .resize(COVER, COVER, { fit: 'cover', position: 'centre' })
            .webp({ quality: QUALITY, effort: 4 })
            .toFile(poster)
        }
        const anim = path.join(OUT, `${a.uuid}-cover-anim.webp`)
        if (force || !fs.existsSync(anim)) {
          await sharp(src, { animated: true })
            .resize(ANIM_COVER, ANIM_COVER, { fit: 'cover', position: 'centre' })
            .webp({ quality: ANIM_COVER_QUALITY, effort: 6 })
            .toFile(anim)
        }
        stats.covers++
        hasAnimCover = true
      }
    } catch {
      // Never lose an animation to a converter quirk -- ship the original instead.
      fs.copyFileSync(src, path.join(OUT, `${a.uuid}.${a.ext}`))
      stats.copiedAnimated.push(a.uuid)
      return { uuid: a.uuid, animated: true, fallback: `${a.uuid}.${a.ext}`, w, h }
    }
    stats.animated++
    return { uuid: a.uuid, animated: true, w, h, widths: [inlineW], hasAnimCover }
  }

  for (const target of WIDTHS) {
    if (target > w && target !== WIDTHS[0]) continue // don't upscale
    const width = Math.min(target, w)
    const dest = path.join(OUT, `${a.uuid}-${target}.webp`)
    if (force || !fs.existsSync(dest)) {
      await sharp(src).resize({ width, withoutEnlargement: true })
        .webp({ quality: QUALITY, effort: 4 }).toFile(dest)
    }
    out.push(target)
  }

  // Square cover crop, honouring the editorial framing recorded during extraction.
  if (a.roles?.includes('cover')) {
    const dest = path.join(OUT, `${a.uuid}-cover.webp`)
    if (force || !fs.existsSync(dest)) {
      const region = parseCrop(a.cover_crop, w, h)
      let pipe = sharp(src)
      if (region) pipe = pipe.extract(region)
      await pipe.resize(COVER, COVER, { fit: 'cover', position: 'centre' })
        .webp({ quality: QUALITY, effort: 4 }).toFile(dest)
    }
    stats.covers++
  }

  stats.still++
  return { uuid: a.uuid, animated: false, w, h, widths: out }
}

/** True when assets/originals holds Git LFS pointer stubs rather than real images. */
function originalsAvailable(assets) {
  const probe = assets.slice(0, 5)
  for (const a of probe) {
    const p = path.join(SRC, `${a.uuid}.${a.ext}`)
    if (!fs.existsSync(p)) return false
    // LFS pointers are ~130-byte text files starting with a version line.
    const head = fs.readFileSync(p).subarray(0, 40).toString('latin1')
    if (head.startsWith('version https://git-lfs')) return false
  }
  return true
}

/**
 * Rebuild media.json purely from what exists in public/media.
 *
 * CI checks out without LFS and builds from the committed derivatives, so this has to
 * work with no originals present. It also self-heals if a derivative is deleted.
 */
function indexExisting(assets) {
  const byUuid = new Map(assets.map((a) => [a.uuid, a]))
  const found = new Map()

  for (const f of fs.readdirSync(OUT)) {
    const m = /^([0-9a-f-]{36})(?:-(cover|cover-anim|\d+))?\.(\w+)$/.exec(f)
    if (!m) continue
    const [, uuid, kind, ext] = m
    const a = byUuid.get(uuid)
    const rec = found.get(uuid) ?? {
      uuid,
      animated: false,
      w: a?.download?.width ?? a?.intrinsic_width ?? 0,
      h: a?.download?.height ?? a?.intrinsic_height ?? 0,
      widths: [],
    }
    if (ext !== 'webp') rec.fallback = f
    else if (kind === 'cover-anim') { rec.hasAnimCover = true; rec.animated = true }
    else if (kind === 'cover') { /* poster; no width entry */ }
    else if (kind) rec.widths.push(Number(kind))
    else rec.animated = true // bare <uuid>.webp is the animated inline rendition
    found.set(uuid, rec)
  }

  for (const rec of found.values()) {
    // A bare `<uuid>.webp` carries no width in its name; it's always produced at this
    // size, so reproduce it rather than leaving the field empty.
    if (rec.animated && !rec.widths.length) rec.widths = [Math.min(rec.w, ANIM_INLINE_W)]
    rec.widths.sort((x, y) => x - y)
  }
  return [...found.values()]
}

// Alex's own favicon / touch icon / social image, carried over from the original site
// so the rebuild keeps his branding rather than a placeholder.
const CHROME = {
  '7879825e-e400-430a-89d5-f8d1f039c791': { out: 'favicon.png', size: 64 },
  '70d66cda-2bb6-45c6-8262-a2bfb78def5e': { out: 'apple-touch-icon.png', size: 180 },
  // JPEG, not PNG: it's a photo, and PNG made it a 1 MB social preview.
  'd9ce7d9a-2ac3-4cd8-ad8e-5355561569a9': { out: 'og-image.jpg', width: 1200, jpeg: true },
}

async function buildChrome(assets) {
  const pub = path.join(HERE, '../public')
  for (const [uuid, spec] of Object.entries(CHROME)) {
    const a = assets.find((x) => x.uuid === uuid)
    if (!a) continue
    const src = path.join(SRC, `${a.uuid}.${a.ext}`)
    const dest = path.join(pub, spec.out)
    if (!fs.existsSync(src) || (fs.existsSync(dest) && !force)) continue
    const sized = spec.size
      ? sharp(src).resize(spec.size, spec.size, { fit: 'cover', position: 'centre' })
      : sharp(src).resize({ width: spec.width, withoutEnlargement: true })
    await (spec.jpeg ? sized.jpeg({ quality: 85 }) : sized.png()).toFile(dest)
    console.log(`  chrome -> public/${spec.out}`)
  }
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'))
  const assets = manifest.assets

  if (!originalsAvailable(assets)) {
    const existing = indexExisting(assets)
    console.log('originals not materialised (Git LFS pointers or absent)')
    console.log(`using ${existing.length} committed derivatives in public/media`)
    if (!existing.length) {
      console.error('ERROR: no derivatives found and no originals to build from.')
      process.exit(1)
    }
    fs.mkdirSync(path.join(HERE, '../src/generated'), { recursive: true })
    fs.writeFileSync(path.join(HERE, '../src/generated/media.json'),
      JSON.stringify(Object.fromEntries(existing.map((r) => [r.uuid, r]))))
    return
  }

  await buildChrome(assets)

  const stats = { still: 0, animated: 0, covers: 0, missing: [], copiedAnimated: [] }
  const results = []

  let i = 0
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (i < assets.length) {
      const a = assets[i++]
      try {
        const r = await processAsset(a, stats)
        if (r) results.push(r)
      } catch (e) {
        console.error(`  FAIL ${a.uuid}.${a.ext}: ${e.message}`)
        stats.missing.push(a.uuid)
      }
      if (results.length % 100 === 0 && results.length) process.stdout.write(`  ${results.length}/${assets.length}\r`)
    }
  })
  await Promise.all(workers)

  // New work commits derivatives only (ROADMAP.md), so an asset with no original here
  // is served from what is already in public/media, the same way CI serves everything.
  const built = new Set(results.map((r) => r.uuid))
  const fromDerivatives = indexExisting(assets).filter((r) => !built.has(r.uuid))
  results.push(...fromDerivatives)
  const served = new Set(fromDerivatives.map((r) => r.uuid))
  stats.missing = stats.missing.filter((u) => !served.has(u))
  if (fromDerivatives.length) console.log(`derivatives-only assets: ${fromDerivatives.length}`)

  const files = fs.readdirSync(OUT)
  const bytes = files.reduce((s, f) => s + fs.statSync(path.join(OUT, f)).size, 0)
  const srcBytes = fs.readdirSync(SRC).reduce((s, f) => s + fs.statSync(path.join(SRC, f)).size, 0)

  console.log(`\nderivatives: ${files.length} files, ${(bytes / 1e6).toFixed(0)} MB`)
  console.log(`originals  : ${(srcBytes / 1e6).toFixed(0)} MB  ->  ${(100 * bytes / srcBytes).toFixed(0)}% of source`)
  console.log(`still=${stats.still} animated=${stats.animated} covers=${stats.covers}`)
  if (stats.copiedAnimated.length) console.log(`copied through (webp failed): ${stats.copiedAnimated.length}`)
  if (stats.missing.length) console.log(`MISSING/FAILED: ${stats.missing.length} -> ${stats.missing.slice(0, 5)}`)

  // Record what actually exists so the app builds correct srcsets.
  fs.writeFileSync(path.join(HERE, '../src/generated/media.json'),
    JSON.stringify(Object.fromEntries(results.map((r) => [r.uuid, r]))))
}

// Only run the full build when invoked directly; import-draft.mjs imports processAsset.
// Compared case-insensitively on Windows, where the drive letter's case varies by caller.
const norm = (p) => (process.platform === 'win32' ? path.resolve(p).toLowerCase() : path.resolve(p))
if (process.argv[1] && norm(process.argv[1]) === norm(fileURLToPath(import.meta.url))) main()
