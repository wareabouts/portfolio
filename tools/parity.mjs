/**
 * Compare the rebuilt site against the original Adobe Portfolio HTML in raw/.
 *
 * Checks the things a visitor would notice: is the copy all there, did every image and
 * embed survive, are the captions intact. Run after `npm --prefix site run build`.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const RAW = path.join(ROOT, 'raw')
const DIST = path.join(ROOT, 'site/dist')

const strip = (html) =>
  html.replace(/<script[\s\S]*?<\/script>/g, ' ')
      .replace(/<style[\s\S]*?<\/style>/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      // React escapes apostrophes/quotes as hex entities (&#x27;), Adobe used decimal.
      .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
      .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
      .replace(/&rsquo;|&lsquo;/g, "'").replace(/&quot;|&ldquo;|&rdquo;/g, '"')
      .replace(/&[a-z]+;/g, ' ')
      .replace(/\s+/g, ' ')

// Curly apostrophes must fold to ASCII or "CNC’d" splits into two tokens and looks lost.
// Bare numerals are dropped too: Markdown ordered lists render their markers as list
// styling rather than text, so they can never match.
const words = (s) =>
  (s.toLowerCase().replace(/[‘’]/g, "'").match(/[a-z][a-z0-9']*/g) || [])

/** Original copy: the project modules only, excluding lightbox <script> templates. */
function originalText(slug) {
  const html = fs.readFileSync(path.join(RAW, `${slug}.html`), 'utf8')
  const marker = html.indexOf('js-project-modules')
  if (marker < 0) return ''
  // Start *after* the opening tag, or the remainder of its class attribute is read
  // as body copy ("js project modules content ...").
  const start = html.indexOf('>', marker) + 1
  // Cut at the footer's opening tag, not at the class name inside it.
  const end = html.indexOf('<footer', start)
  return strip(html.slice(start, end > 0 ? end : undefined))
}

function builtText(slug) {
  const f = path.join(DIST, slug, 'index.html')
  if (!fs.existsSync(f)) return null
  const html = fs.readFileSync(f, 'utf8')
  const m = html.match(/<main class="main">([\s\S]*?)<\/main>/)
  // Captions live in alt="" as well as figcaption; include attribute text so a caption
  // rendered only as alt text still counts as present.
  const body = m ? m[1] : html
  const alts = [...body.matchAll(/\balt="([^"]*)"/g)].map((x) => x[1]).join(' ')
  return strip(body) + ' ' + strip(alts)
}

function countMedia(slug) {
  const raw = fs.readFileSync(path.join(RAW, `${slug}.html`), 'utf8')
  const built = fs.readFileSync(path.join(DIST, slug, 'index.html'), 'utf8')
  const uniq = (s, re) => new Set([...s.matchAll(re)].map((m) => m[1]))
  return {
    rawImgs: uniq(raw, /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})_r/g).size,
    builtImgs: uniq(built, /media\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/g).size,
    rawEmbeds: (raw.match(/youtube(?:-nocookie)?\.com\/embed|player\.vimeo\.com\/video|www-ccv\.adobe\.io/g) || []).length,
    builtEmbeds: (built.match(/youtube-nocookie\.com\/embed|player\.vimeo\.com\/video|<video /g) || []).length,
  }
}

const slugs = fs.readdirSync(path.join(ROOT, 'content/projects'))
  .filter((f) => f.endsWith('.md')).map((f) => path.basename(f, '.md'))
  .concat(['about'])

const rows = []
for (const slug of slugs) {
  const built = builtText(slug)
  if (built === null) { rows.push({ slug, err: 'no built page' }); continue }
  const o = new Set(words(originalText(slug)))
  const b = new Set(words(built))
  const missing = [...o].filter((w) => !b.has(w))
  const media = countMedia(slug)
  rows.push({
    slug,
    coverage: o.size ? 1 - missing.length / o.size : 1,
    missingWords: missing,
    ...media,
  })
}

let problems = 0
console.log('slug'.padEnd(42), 'copy'.padEnd(7), 'imgs', '  embeds')
for (const r of rows.sort((a, b) => (a.coverage ?? 0) - (b.coverage ?? 0))) {
  if (r.err) { console.log(`${r.slug.padEnd(42)} ${r.err}`); problems++; continue }
  const imgOk = r.builtImgs >= r.rawImgs
  const embedOk = r.builtEmbeds >= r.rawEmbeds
  const copyOk = r.coverage > 0.995
  if (!imgOk || !embedOk || !copyOk) {
    problems++
    console.log(
      `${r.slug.padEnd(42)} ${(r.coverage * 100).toFixed(1).padStart(5)}%  ` +
      `${String(r.builtImgs).padStart(3)}/${String(r.rawImgs).padEnd(3)} ` +
      `${String(r.builtEmbeds).padStart(3)}/${String(r.rawEmbeds).padEnd(3)}` +
      (r.missingWords.length ? `  missing: ${r.missingWords.slice(0, 8).join(' ')}` : ''),
    )
  }
}

const avg = rows.filter((r) => !r.err).reduce((s, r) => s + r.coverage, 0) / rows.length
console.log(`\n${rows.length} pages checked, average copy coverage ${(avg * 100).toFixed(2)}%`)
console.log(problems ? `${problems} page(s) flagged above` : 'all pages match on copy, images and embeds')
