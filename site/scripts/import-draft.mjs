/**
 * Import a draft's photos into the site.
 *
 *   npm --prefix site run import -- <slug> [--cover <file>] [--force]
 *
 * Reads drafts/<slug>/media/, gives each image a UUID, adds it to assets/manifest.json,
 * builds the web derivatives into site/public/media, and writes drafts/<slug>/media.md, a
 * table of file name to asset id that travels with git. If content/projects/<slug>.md exists
 * and has no cover, the cover's id is written into its front matter.
 *
 * Sources are not copied anywhere. New work commits derivatives only (ROADMAP.md), so the
 * import runs on the machine that has the photos and the derivatives are what get pushed.
 * Re-running is safe: files are matched by content hash, so nothing is imported twice.
 *
 * The cover is --cover <file>, else a file named cover.*, else the first image by name.
 */

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { processAsset } from './build-images.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '../..')
const MANIFEST = path.join(ROOT, 'assets/manifest.json')
const IMAGE_EXT = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'tif', 'tiff', 'avif'])

const args = process.argv.slice(2)
const slug = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--cover')
const coverArg = args.includes('--cover') ? args[args.indexOf('--cover') + 1] : null
if (!slug) {
  console.error('usage: npm --prefix site run import -- <slug> [--cover <file>] [--force]')
  process.exit(2)
}

const dir = path.join(ROOT, 'drafts', slug, 'media')
if (!fs.existsSync(dir)) {
  console.error(`no folder at drafts/${slug}/media`)
  process.exit(1)
}

const manifestText = fs.readFileSync(MANIFEST, 'utf8')
const manifest = JSON.parse(manifestText)
const indent = (/^\{\r?\n( +)"/.exec(manifestText) || [, '  '])[1]
const bySha = new Map(
  manifest.assets.filter((a) => a.download?.sha256).map((a) => [a.download.sha256, a]),
)

const files = fs.readdirSync(dir)
  .filter((f) => !f.startsWith('.'))
  .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))
const images = []
const skipped = []
for (const f of files) {
  const ext = path.extname(f).slice(1).toLowerCase()
  ;(IMAGE_EXT.has(ext) ? images : skipped).push(f)
}
if (!images.length) {
  console.error(`no images in drafts/${slug}/media (${skipped.length} other files)`)
  process.exit(1)
}

const coverFile = coverArg ?? images.find((f) => /^cover\./i.test(f)) ?? images[0]
if (!images.includes(coverFile)) {
  console.error(`cover "${coverFile}" is not an image in the folder`)
  process.exit(1)
}

const stats = { still: 0, animated: 0, covers: 0, missing: [], copiedAnimated: [] }
const rows = []
let added = 0

for (const f of images) {
  const src = path.join(dir, f)
  const buf = fs.readFileSync(src)
  const sha256 = crypto.createHash('sha256').update(buf).digest('hex')
  const ext = path.extname(f).slice(1).toLowerCase().replace(/^jpeg$/, 'jpg')
  const isCover = f === coverFile

  let a = bySha.get(sha256)
  if (!a) {
    const meta = await sharp(src, { animated: true }).metadata()
    const w = meta.width ?? 0
    const h = meta.pageHeight ?? meta.height ?? 0
    a = {
      uuid: crypto.randomUUID(),
      ext,
      source: `drafts/${slug}/media/${f}`,
      is_original: true,
      best_width: w,
      intrinsic_width: w,
      intrinsic_height: h,
      alt: null,
      roles: [],
      used_by: [],
      download: {
        status: 'derivatives-only',
        file: null,
        bytes: buf.length,
        sha256,
        width: w,
        height: h,
        frames: meta.pages ?? 1,
      },
    }
    manifest.assets.push(a)
    bySha.set(sha256, a)
    added++
  }
  if (!a.used_by.includes(slug)) a.used_by.push(slug)
  if (isCover && !a.roles.includes('cover')) a.roles.push('cover')

  const r = await processAsset(a, stats, src)
  rows.push({
    file: f,
    uuid: a.uuid,
    size: `${a.download.width}x${a.download.height}`,
    cover: isCover,
    animated: Boolean(r?.animated),
  })
}

fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, indent) + '\n')

// The table that travels with git, so a page can be laid out from another machine.
const coverRow = rows.find((r) => r.cover)
const table = [
  `# media for ${slug}`,
  '',
  `Imported ${new Date().toISOString().slice(0, 10)} by import-draft.mjs. Paste an id into`,
  '`::figure{asset="..."}` or a gallery `::item{asset="..."}`. The cover is set in the',
  "page's front matter.",
  '',
  '| file | id | size | notes |',
  '|---|---|---|---|',
  ...rows.map((r) => `| ${r.file} | ${r.uuid} | ${r.size} | ${[r.cover && 'cover', r.animated && 'animated'].filter(Boolean).join(', ')} |`),
  '',
]
if (skipped.length) {
  table.push(`Not imported (not an image, or a format the build cannot read): ${skipped.join(', ')}.`, '')
}
fs.writeFileSync(path.join(ROOT, 'drafts', slug, 'media.md'), table.join('\n'))

// Set the cover on the page if it has none yet.
const page = path.join(ROOT, 'content/projects', `${slug}.md`)
let coverNote = 'no page yet; add this to its front matter'
if (fs.existsSync(page)) {
  const text = fs.readFileSync(page, 'utf8')
  if (/^cover:/m.test(text)) {
    coverNote = 'page already has a cover, left as is'
  } else {
    const m = /^slug:.*(\r?\n)/m.exec(text)
    if (m) {
      fs.writeFileSync(page, text.replace(m[0], `${m[0]}cover: ${coverRow.uuid}${m[1]}`))
      coverNote = `written into content/projects/${slug}.md`
    }
  }
}

console.log(`imported ${rows.length} image(s), ${added} new, from drafts/${slug}/media`)
console.log(`derivatives: still=${stats.still} animated=${stats.animated} covers=${stats.covers}`)
if (stats.copiedAnimated.length) console.log(`copied through unconverted: ${stats.copiedAnimated.join(', ')}`)
if (skipped.length) console.log(`skipped: ${skipped.join(', ')}`)
console.log(`cover: ${coverFile} -> ${coverRow.uuid} (${coverNote})`)
console.log(`table: drafts/${slug}/media.md`)
console.log('\nnext: commit and push what this produced')
console.log(`  git add assets/manifest.json site/public/media drafts/${slug}/media.md content/projects/${slug}.md`)
