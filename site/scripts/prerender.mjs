/**
 * Bake every route into static HTML.
 *
 * GitHub Pages serves files, not routes, so a plain SPA would 404 on /openai-case until
 * the 404.html fallback kicked in — bad for search engines and link previews. Rendering
 * each route to its own index.html means real markup on first paint; the client then
 * hydrates it.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SITE = path.resolve(HERE, '..')
const DIST = path.join(SITE, 'dist')
const SSR = path.join(SITE, 'dist-ssr/entry-server.js')

const SITE_NAME = 'Alex Fiel - Creative Technologist'
const DESC = 'Projects by Alex Fiel, a Creative Technologist based in Seattle.'

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

async function main() {
  const content = JSON.parse(fs.readFileSync(path.join(SITE, 'src/generated/content.json'), 'utf8'))
  const template = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')
  const { render } = await import(pathToFileURL(SSR).href)

  const base = (process.env.RESOLVED_BASE || '/').replace(/\/?$/, '/')

  const routes = [
    { url: '/', title: SITE_NAME, desc: DESC },
    ...content.pages.map((p) => ({
      url: `/${p.slug}`, title: `${SITE_NAME} - ${p.title}`, desc: DESC,
    })),
    ...Object.keys(content.taxonomy.categories).map((c) => ({
      url: `/${c}`,
      title: `${SITE_NAME} - ${content.taxonomy.nav.find((n) => n.slug === c)?.label ?? c}`,
      desc: `${c.replace(/-/g, ' ')} projects by Alex Fiel.`,
    })),
    ...content.projects.map((p) => ({
      url: `/${p.slug}`,
      title: `${SITE_NAME} - ${p.title}`,
      desc: firstProse(p) || DESC,
      image: p.cover ? `${base}media/${p.cover}-cover.webp` : undefined,
    })),
  ]

  let written = 0
  const failures = []

  for (const r of routes) {
    let html
    try {
      html = render(r.url, base)
    } catch (e) {
      failures.push(`${r.url}: ${e.message}`)
      continue
    }

    let page = template
      .replace('<!--app-html-->', html)
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(r.title)}</title>`)
      .replace(
        /(<meta\s+name="description"\s+content=")[\s\S]*?(")/,
        `$1${esc(r.desc)}$2`,
      )
      .replace(/(<meta\s+property="og:title"\s+content=")[\s\S]*?(")/, `$1${esc(r.title)}$2`)
      .replace(/(<meta\s+property="og:description"\s+content=")[\s\S]*?(")/, `$1${esc(r.desc)}$2`)

    if (r.image) {
      page = page.replace('</head>', `  <meta property="og:image" content="${esc(r.image)}" />\n  </head>`)
    }

    const dir = r.url === '/' ? DIST : path.join(DIST, r.url)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, 'index.html'), page)
    written++
  }

  // Unknown paths: GitHub Pages serves 404.html, and the SPA router takes it from there.
  const shell = template.replace('<!--app-html-->', '')
  fs.writeFileSync(path.join(DIST, '404.html'), shell)
  // Stop Pages running the output through Jekyll.
  fs.writeFileSync(path.join(DIST, '.nojekyll'), '')

  console.log(`prerendered ${written}/${routes.length} routes -> dist/`)
  if (failures.length) {
    console.error(`\nFAILED (${failures.length}):`)
    failures.forEach((f) => console.error('  ' + f))
    process.exit(1)
  }
}

/** First ~160 chars of a project's prose, for the meta description. */
function firstProse(doc) {
  const find = (blocks) => {
    for (const b of blocks) {
      if (b.type === 'prose') {
        const text = b.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
        if (text.length > 40) return text
      }
      if (b.type === 'columns') {
        for (const col of b.columns) {
          const r = find(col)
          if (r) return r
        }
      }
    }
    return null
  }
  const text = find(doc.blocks)
  if (!text) return null
  return text.length > 160 ? text.slice(0, 157).trimEnd() + '…' : text
}

main()
