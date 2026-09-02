/**
 * Apply accepted suggestions to content/.
 *
 *   node review/apply.mjs review/decisions/2026-09-01.json
 *
 * The decisions file is what the copy-desk page stored, read back from the artifact's
 * database: one entry per suggestion id with status "accepted", "rejected" or
 * "commented". Only accepted ids are applied. Every anchor must still exist exactly once
 * in its file, or the run aborts before writing anything.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '..')
const CONTENT = path.join(ROOT, 'content')

const decisionsPath = process.argv[2]
if (!decisionsPath) {
  console.error('usage: node review/apply.mjs <decisions.json>')
  process.exit(2)
}

const proposals = JSON.parse(fs.readFileSync(path.join(HERE, 'proposals.json'), 'utf8'))
const raw = JSON.parse(fs.readFileSync(decisionsPath, 'utf8'))

// Accept the shapes we might get: {id: body}, [{id, ...body}], or a read_db listing.
const decisions = new Map()
const entries = Array.isArray(raw) ? raw
  : Array.isArray(raw.documents) ? raw.documents
  : Array.isArray(raw.docs) ? raw.docs
  : Object.entries(raw).map(([id, v]) => ({ id, ...v }))
for (const d of entries) {
  const did = d.id ?? d.doc_id ?? d.docId
  const body = d.data ?? d
  if (did && body && body.status) decisions.set(did, body)
}

const fileFor = (slug) => {
  const p = path.join(CONTENT, 'projects', `${slug}.md`)
  return fs.existsSync(p) ? p : path.join(CONTENT, 'pages', `${slug}.md`)
}
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

let rejected = 0, commented = 0, undecided = 0
const plan = new Map() // file -> suggestions to apply
for (const page of proposals.pages) {
  for (const s of page.suggestions) {
    const d = decisions.get(s.id)
    if (!d) { undecided++; continue }
    if (d.status === 'rejected') { rejected++; continue }
    if (d.status !== 'accepted') { commented++; continue }
    const f = fileFor(page.slug)
    if (!plan.has(f)) plan.set(f, [])
    plan.get(f).push({ ...s, slug: page.slug })
  }
}

// Verify every anchor before touching any file.
const problems = []
for (const [f, items] of plan) {
  const text = fs.readFileSync(f, 'utf8')
  const lines = text.split(/\r?\n/)
  for (const s of items) {
    if (s.kind === 'title') {
      if (!new RegExp(`^title:\\s*"?${escapeRe(s.old)}"?\\s*$`, 'm').test(text)) problems.push(`${s.slug}: title "${s.old}" not found`)
      continue
    }
    const n = lines.filter((l) => l === s.old).length
    if (n !== 1) problems.push(`${s.slug}: line ${n === 0 ? 'missing' : 'ambiguous'}: ${s.old.slice(0, 70)}`)
  }
}
if (problems.length) {
  console.error(`aborting: ${problems.length} anchor problem(s), nothing written`)
  problems.forEach((p) => console.error('  ' + p))
  process.exit(1)
}

let applied = 0
for (const [f, items] of plan) {
  let text = fs.readFileSync(f, 'utf8')
  const eol = text.includes('\r\n') ? '\r\n' : '\n'
  for (const s of items) {
    if (s.kind === 'title') {
      text = text.replace(/^(title:\s*)"?(.*?)"?\s*$/m, (_, k) => `${k}"${s.new.replace(/"/g, '\\"')}"`)
    } else {
      const lines = text.split(eol)
      const i = lines.indexOf(s.old)
      if (s.new === '') {
        lines.splice(i, 1)
        if (lines[i] === '' && (i === 0 || lines[i - 1] === '')) lines.splice(i, 1) // collapse the doubled blank
      } else {
        lines.splice(i, 1, ...s.new.split('\n'))
      }
      text = lines.join(eol)
    }
    applied++
  }
  fs.writeFileSync(f, text)
  console.log(`  ${path.relative(ROOT, f).replace(/\\/g, '/')}: ${items.length} change(s)`)
}

console.log(`\napplied ${applied}  rejected ${rejected}  commented-only ${commented}  undecided ${undecided}  (of ${proposals.total})`)
if (undecided || commented) console.log('undecided and commented-only suggestions were left as they are')
