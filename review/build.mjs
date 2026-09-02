/**
 * Turn review/rewrites.mjs into review/proposals.json and review/dist/copy-desk.html.
 *
 * Every suggestion is anchored to an exact line in a content file. Anchors are matched
 * with curly quotes folded to straight ones, and the ACTUAL file line is what gets stored
 * as `old`, so apply.mjs can do exact replacement. A missing or ambiguous anchor fails the
 * build: a stale suggestion must never land on the wrong paragraph.
 *
 * Suggestion ids are a hash of (slug, old, new). Regenerating with unchanged text keeps
 * ids stable so decisions survive a rebuild; revising a suggestion's wording gives it a
 * fresh id and clears any decision made about the old wording.
 */

import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { STYLE_GUIDE, TITLES, HEADINGS, TYPOS, STRUCTURE, PROSE } from './rewrites.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '..')
const CONTENT = path.join(ROOT, 'content')
const OUT = path.join(HERE, 'dist')
const LIVE = 'https://alexfiel.com'

// Curly quotes folded to straight, by code point so this file stays plain ASCII.
const fold = (s) => s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
const id = (...parts) => createHash('sha1').update(parts.join(' ')).digest('hex').slice(0, 10)
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** A substring fix as a regex, with word boundaries only where a word character sits. */
function fixRe(from, flags = '') {
  const lead = /^\w/.test(from) ? '\\b' : ''
  const tail = /\w$/.test(from) ? '\\b' : ''
  return new RegExp(lead + escapeRe(fold(from)) + tail, flags)
}

/** The caption text of a `::figure{... caption="..."}` line, or undefined. */
const captionOf = (line) => /\bcaption="((?:[^"\\]|\\.)*)"/.exec(line)?.[1]

function loadPage(slug) {
  const f = fs.existsSync(path.join(CONTENT, 'projects', `${slug}.md`))
    ? path.join(CONTENT, 'projects', `${slug}.md`)
    : path.join(CONTENT, 'pages', `${slug}.md`)
  const raw = fs.readFileSync(f, 'utf8')
  const title = /^title:\s*"?(.*?)"?\s*$/m.exec(raw)?.[1] ?? slug
  return { slug, file: f, title, lines: raw.split(/\r?\n/) }
}

/** Exactly one matching line, or an error naming the page and the anchor. */
function findLine(page, test, what) {
  const hits = page.lines.filter((l) => test(l))
  if (hits.length !== 1) {
    const how = hits.length === 0 ? 'not found' : `ambiguous (${hits.length} lines)`
    throw new Error(`${page.slug}: anchor ${how}: ${what}`)
  }
  return hits[0]
}

const slugs = [...fs.readdirSync(path.join(CONTENT, 'projects')).map((f) => f.replace(/\.md$/, '')), 'about']
const pages = new Map(slugs.map((s) => [s, loadPage(s)]))
const bySlug = new Map()
const errors = []
const claimed = new Set() // "slug line": lines already owned by a whole-line suggestion

function suggest(slug, s) {
  if (!bySlug.has(slug)) bySlug.set(slug, [])
  bySlug.get(slug).push({ id: id(slug, s.old, s.new), ...s })
}

// ---- whole-paragraph rewrites claim their lines first ------------------------------------
for (const p of PROSE) {
  const page = pages.get(p.slug)
  try {
    const line = findLine(page, (l) => fold(l) === fold(p.old), p.old.slice(0, 60))
    claimed.add(`${p.slug} ${line}`)
    const kind = p.new === '' ? 'delete' : line.startsWith('#') ? 'heading' : 'paragraph'
    suggest(p.slug, { kind, old: line, new: p.new, why: p.why })
  } catch (e) { errors.push(e.message) }
}

// ---- structure ---------------------------------------------------------------------------
for (const s of STRUCTURE) {
  const page = pages.get(s.slug)
  try {
    if (s.split) {
      const line = findLine(page, (l) => fold(l).startsWith(fold(s.startsWith)), s.startsWith.slice(0, 50))
      const rest = line.slice(s.startsWith.length).trim()
      claimed.add(`${s.slug} ${line}`)
      suggest(s.slug, { kind: 'structure', old: line, new: `${s.split.heading}\n\n${s.split.topic}\n\n${rest}`, why: s.why })
    } else {
      const line = findLine(page, (l) => l.trim() === s.old, s.old)
      claimed.add(`${s.slug} ${line}`)
      suggest(s.slug, { kind: 'structure', old: line, new: s.new, why: s.why })
    }
  } catch (e) { errors.push(e.message) }
}

// ---- titles -------------------------------------------------------------------------------
for (const [slug, to] of Object.entries(TITLES)) {
  const page = pages.get(slug)
  if (!page) { errors.push(`${slug}: no such page (TITLES)`); continue }
  if (page.title === to) continue
  suggest(slug, { kind: 'title', old: page.title, new: to, why: slug === 'borzoi-vacuum' ? 'casing rule, and a typo' : 'casing rule' })
}

// ---- `##` headings by rule; explicit list for `###` and oddities -----------------------
const RESULTS_ALIASES = new Set(['result', 'outcome'])
for (const page of pages.values()) {
  for (const line of page.lines) {
    if (!line.startsWith('## ') || claimed.has(`${page.slug} ${line}`)) continue
    const text = line.slice(3).trim()
    let want = text.toLowerCase().replace(/:$/, '')
    if (RESULTS_ALIASES.has(want)) want = 'results'
    if (want === text) continue
    if (page.lines.filter((l) => l === line).length !== 1) { errors.push(`${page.slug}: heading "${text}" repeats; skipped`); continue }
    const why = RESULTS_ALIASES.has(text.toLowerCase()) ? 'house label is "results"'
      : /:$/.test(text) ? 'lowercase, no trailing colon' : 'lowercase section label'
    suggest(page.slug, { kind: 'heading', old: line, new: `## ${want}`, why })
  }
}
for (const h of HEADINGS) {
  const page = pages.get(h.slug)
  try {
    const line = findLine(page, (l) => fold(l) === fold(h.from), h.from)
    suggest(h.slug, { kind: 'heading', old: line, new: h.to, why: h.why })
  } catch (e) { errors.push(e.message) }
}

// ---- typos: substring fixes, grouped per line so a paragraph gets one suggestion --------
// A fix may sit inside an image caption (a `::figure{... caption="..."}` line); the whole
// directive line is what gets replaced, but the page shows only the caption text.
const typoByLine = new Map()
for (const t of TYPOS) {
  const page = pages.get(t.slug)
  const test = fixRe(t.from) // no `g` flag: a plain test with no lastIndex state
  try {
    const line = findLine(page, (l) => test.test(fold(l)) && (!l.startsWith(':') || captionOf(l) !== undefined), t.from)
    if (claimed.has(`${t.slug} ${line}`)) continue // a rewrite already covers it
    const key = `${t.slug} ${line}`
    if (!typoByLine.has(key)) typoByLine.set(key, { slug: t.slug, line, fixes: [] })
    typoByLine.get(key).fixes.push(t)
  } catch (e) { errors.push(e.message) }
}
for (const { slug, line, fixes } of typoByLine.values()) {
  let out = line
  for (const f of fixes) out = out.replace(fixRe(f.from, 'g'), f.to)
  const why = [...new Set(fixes.map((f) => f.why))].join(', ')
  const kind = line.startsWith(':') ? 'caption' : line.startsWith('#') ? 'heading' : 'paragraph'
  const s = { kind, old: line, new: out, why }
  if (kind === 'caption') s.display = { old: captionOf(line), new: captionOf(out) }
  suggest(slug, s)
}

if (errors.length) {
  console.error(`\n${errors.length} anchor problem(s):`)
  errors.forEach((e) => console.error('  ' + e))
  process.exit(1)
}

// ---- assemble in home-grid order; titles first, then document order --------------------
const taxonomy = JSON.parse(fs.readFileSync(path.join(CONTENT, 'taxonomy.json'), 'utf8'))
const order = [...taxonomy.project_order, 'about']
const outPages = order.filter((s) => bySlug.has(s)).map((slug) => {
  const page = pages.get(slug)
  const pos = (s) => (s.kind === 'title' ? -1 : page.lines.indexOf(s.old))
  const suggestions = bySlug.get(slug).sort((a, b) => pos(a) - pos(b))
  return { slug, title: page.title, url: `${LIVE}/${slug}`, suggestions }
})

const proposals = {
  generated: new Date().toISOString(),
  round: 1,
  styleGuide: STYLE_GUIDE,
  pages: outPages,
  total: outPages.reduce((n, p) => n + p.suggestions.length, 0),
}

fs.mkdirSync(OUT, { recursive: true })
fs.writeFileSync(path.join(HERE, 'proposals.json'), JSON.stringify(proposals, null, 1))

const template = fs.readFileSync(path.join(HERE, 'copy-desk.html'), 'utf8')
if (!template.includes('/*__PROPOSALS__*/')) throw new Error('copy-desk.html is missing the /*__PROPOSALS__*/ marker')
const json = JSON.stringify(proposals).replace(/</g, '\\u003c')
fs.writeFileSync(path.join(OUT, 'copy-desk.html'), template.replace('/*__PROPOSALS__*/', json))

const byKind = {}
for (const p of outPages) for (const s of p.suggestions) byKind[s.kind] = (byKind[s.kind] || 0) + 1
console.log(`${proposals.total} suggestions across ${outPages.length} pages`)
console.log('  ' + Object.entries(byKind).map(([k, v]) => `${k}=${v}`).join('  '))
console.log('-> review/proposals.json, review/dist/copy-desk.html')
