/**
 * Compile ../content/**.md into a single typed JSON module the app imports.
 *
 * Markdown is the authoring surface (best format for prose); the app never parses it at
 * runtime. Edit a .md file, re-run the build, and the page regenerates.
 *
 * Non-prose blocks use remark-style directives:
 *   ::figure{asset="uuid" caption="..."}      leaf
 *   :::gallery ... ::item{...} ... :::        container
 *   ::::columns ... :::column ... ::: ... :::: nested container
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import { marked } from 'marked'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '../..')
const CONTENT = path.join(ROOT, 'content')
const OUT = path.join(HERE, '../src/generated')

const LEAF = new Set(['figure', 'item', 'embed', 'video', 'button', 'form'])

/** Parse `{a="b" c="d"}` into an object. Values may contain escaped quotes. */
function parseAttrs(raw) {
  const attrs = {}
  if (!raw) return attrs
  const re = /(\w+)="((?:[^"\\]|\\.)*)"/g
  let m
  while ((m = re.exec(raw))) attrs[m[1]] = m[2].replace(/\\(.)/g, '$1')
  return attrs
}

const DIRECTIVE = /^(:{2,})([a-z]+)(\{.*\})?\s*$/
const CLOSER = /^(:{2,})\s*$/

/**
 * Line-based parser. Prose accumulates until a directive interrupts it.
 * Containers recurse, keyed on colon width so nesting is unambiguous.
 */
function parseBlocks(lines, i = 0, closeAt = null) {
  const blocks = []
  let prose = []

  const flush = () => {
    const text = prose.join('\n').trim()
    prose = []
    if (!text) return
    const html = marked.parse(text, { async: false, breaks: false, gfm: true })
    blocks.push({ type: 'prose', html: html.trim() })
  }

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    const close = CLOSER.exec(trimmed)
    if (close && closeAt !== null && close[1].length === closeAt) {
      flush()
      return [blocks, i + 1]
    }
    if (close) { i++; continue } // stray closer, ignore

    const d = DIRECTIVE.exec(trimmed)
    if (!d) {
      // A heading is prose, but we lift it out so the app can style/anchor it.
      if (/^##\s+/.test(trimmed)) {
        flush()
        blocks.push({ type: 'heading', text: trimmed.replace(/^##\s+/, '').trim() })
        i++
        continue
      }
      prose.push(line)
      i++
      continue
    }

    flush()
    const [, colons, name, rawAttrs] = d
    const attrs = parseAttrs(rawAttrs)

    if (LEAF.has(name)) {
      blocks.push(leaf(name, attrs))
      i++
      continue
    }

    // container: recurse until a closer of the same width
    const [children, next] = parseBlocks(lines, i + 1, colons.length)
    i = next
    if (name === 'gallery') {
      blocks.push({ type: 'gallery', items: children.filter((c) => c.type === 'item')
        .map(({ asset, caption, invert }) => ({
          asset,
          ...(caption ? { caption } : {}),
          ...(invert ? { invert } : {}),
        })) })
    } else if (name === 'columns') {
      blocks.push({ type: 'columns', columns: children.filter((c) => c.type === 'column')
        .map((c) => c.blocks) })
    } else if (name === 'column') {
      blocks.push({ type: 'column', blocks: children })
    } else {
      blocks.push(...children)
    }
  }

  flush()
  return [blocks, i]
}

function leaf(name, a) {
  switch (name) {
    case 'figure':
      return {
        type: 'figure',
        asset: a.asset,
        ...(a.caption ? { caption: a.caption } : {}),
        ...(a.invert ? { invert: a.invert } : {}),
      }
    case 'item':
      return {
        type: 'item',
        asset: a.asset,
        ...(a.caption ? { caption: a.caption } : {}),
        ...(a.invert ? { invert: a.invert } : {}),
      }
    case 'embed':
      return a.provider === 'iframe'
        ? { type: 'embed', provider: 'iframe', src: a.src }
        : { type: 'embed', provider: a.provider, id: a.id }
    case 'video':
      return { type: 'video', src: a.src }
    case 'button':
      return { type: 'button', href: a.href, label: a.label }
    case 'form':
      return { type: 'form', fields: (a.fields || '').split(',').map((s) => s.trim()).filter(Boolean) }
    default:
      return { type: 'prose', html: '' }
  }
}

function readDir(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => {
    const raw = fs.readFileSync(path.join(dir, f), 'utf8')
    const { data, content } = matter(raw)
    const [blocks] = parseBlocks(content.split(/\r?\n/))
    return { ...data, slug: data.slug || path.basename(f, '.md'), blocks }
  })
}

function main() {
  const taxonomy = JSON.parse(fs.readFileSync(path.join(CONTENT, 'taxonomy.json'), 'utf8'))
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/manifest.json'), 'utf8'))

  const projects = readDir(path.join(CONTENT, 'projects'))
  const pages = readDir(path.join(CONTENT, 'pages'))

  // Order projects the way the original home grid did; anything new lands at the end.
  const order = taxonomy.project_order
  projects.sort((a, b) => {
    const ia = order.indexOf(a.slug), ib = order.indexOf(b.slug)
    return (ia < 0 ? 1e9 : ia) - (ib < 0 ? 1e9 : ib)
  })

  // Only ship the asset fields the app actually needs.
  const assets = {}
  for (const a of manifest.assets) {
    const d = a.download || {}
    assets[a.uuid] = {
      ext: a.ext,
      w: d.width ?? a.intrinsic_width ?? null,
      h: d.height ?? a.intrinsic_height ?? null,
      animated: (d.frames ?? 1) > 1,
      ...(a.alt ? { alt: a.alt } : {}),
    }
  }

  fs.mkdirSync(OUT, { recursive: true })
  const payload = { projects, pages, taxonomy, assets }
  fs.writeFileSync(path.join(OUT, 'content.json'), JSON.stringify(payload))

  // Count recursively -- blocks nested inside columns are easy to under-report.
  const counts = {}
  const tally = (bs) => bs.forEach((b) => {
    counts[b.type] = (counts[b.type] || 0) + 1
    if (b.type === 'columns') b.columns.forEach(tally)
  })
  ;[...projects, ...pages].forEach((p) => tally(p.blocks))
  console.log(`content: ${projects.length} projects, ${pages.length} pages, ${Object.keys(assets).length} assets`)
  console.log('blocks :', Object.entries(counts).map(([k, v]) => `${k}=${v}`).join(' '))

  const missing = []
  for (const p of [...projects, ...pages]) {
    const walk = (bs) => bs.forEach((b) => {
      if (b.type === 'figure' && !assets[b.asset]) missing.push(`${p.slug}:${b.asset}`)
      if (b.type === 'gallery') b.items.forEach((i) => !assets[i.asset] && missing.push(`${p.slug}:${i.asset}`))
      if (b.type === 'columns') b.columns.forEach(walk)
    })
    walk(p.blocks)
  }
  if (missing.length) {
    console.error(`\nERROR: ${missing.length} asset refs missing from manifest:`)
    missing.slice(0, 10).forEach((m) => console.error('  ' + m))
    process.exit(1)
  }
}

main()
