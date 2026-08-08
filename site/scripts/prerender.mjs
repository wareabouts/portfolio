/**
 * Bake every route into static HTML.
 *
 * GitHub Pages serves files, not routes, so a plain SPA would 404 on /openai-case until
 * the 404.html fallback kicked in -- bad for search engines and link previews. Rendering
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
      // StaticRouter expects a full path including the basename, exactly as the browser
      // would see it. Passing a base-relative path renders an empty tree when the site
      // is served from a subdirectory (e.g. /portfolio/) -- silently, with no error.
      html = render(base.replace(/\/$/, '') + r.url, base)
    } catch (e) {
      failures.push(`${r.url}: ${e.message}`)
      continue
    }

    // An unmatched route renders an empty tree rather than throwing, so assert real
    // output. Without this the build "succeeds" and ships a site with no prerendered
    // content at all.
    if (!html.includes('class="main"') || html.length < 800) {
      failures.push(`${r.url}: rendered ${html.length} bytes with no <main> — route did not match`)
      continue
    }

    // React 19 auto-preloads images with a srcset. renderToString has no <head> to hoist
    // those <link> tags into, so it emits them inline; on the client React puts them in
    // <head> instead, and the differing first child breaks hydration. Move them here so
    // both sides agree -- and the preload hint survives.
    const hoisted = []
    html = html.replace(/<link\b[^>]*>/g, (tag) => {
      hoisted.push(tag)
      return ''
    })

    let page = template
      .replace('<!--app-html-->', html)
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(r.title)}</title>`)
      .replace(
        /(<meta\s+name="description"\s+content=")[\s\S]*?(")/,
        `$1${esc(r.desc)}$2`,
      )
      .replace(/(<meta\s+property="og:title"\s+content=")[\s\S]*?(")/, `$1${esc(r.title)}$2`)
      .replace(/(<meta\s+property="og:description"\s+content=")[\s\S]*?(")/, `$1${esc(r.desc)}$2`)

    // Vite rewrites href/src in index.html for the base path but not meta content, so
    // point og:image at the right absolute URL here (project cover, else the default).
    page = page.replace(
      /(<meta\s+property="og:image"\s+content=")[^"]*(")/,
      `$1${esc(r.image ?? `${base}og-image.jpg`)}$2`,
    )

    if (hoisted.length) {
      page = page.replace('</head>', `  ${hoisted.join('\n    ')}\n  </head>`)
    }

    if (r.url === '/') {
      fs.writeFileSync(path.join(DIST, 'index.html'), page)
    } else {
      // Write both `slug/index.html` and `slug.html`.
      //
      // Static hosts disagree about extensionless paths: some resolve /about to
      // about/index.html, others (including `vite preview`) fall through to the SPA
      // shell -- which serves the *home* page's markup and breaks hydration. Emitting
      // both means /about and /about/ are each served the right HTML directly.
      const dir = path.join(DIST, r.url)
      fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(path.join(dir, 'index.html'), page)
      fs.writeFileSync(path.join(DIST, `${r.url}.html`), page)
    }
    written++
  }

  let redirects = 0
  // Retired URLs get a real page that redirects, rather than falling through to 404.html.
  // A static host can't issue a 301, so this is a meta refresh plus a canonical link so
  // search engines follow it.
  for (const [from, to] of Object.entries(content.taxonomy.redirects ?? {})) {
    const target = `${base.replace(/\/$/, '')}${to}`
    const page = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="refresh" content="0; url=${esc(target)}" />
    <link rel="canonical" href="${esc(target)}" />
    <meta name="robots" content="noindex" />
    <title>Redirecting…</title>
  </head>
  <body>
    <p>This page moved to <a href="${esc(target)}">${esc(target)}</a>.</p>
    <script>location.replace(${JSON.stringify(target)})</script>
  </body>
</html>
`
    const dir = path.join(DIST, from)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, 'index.html'), page)
    fs.writeFileSync(path.join(DIST, `${from}.html`), page)
    redirects++
  }

  // Unknown paths: GitHub Pages serves 404.html, and the SPA router takes it from there.
  const shell = template.replace('<!--app-html-->', '')
  fs.writeFileSync(path.join(DIST, '404.html'), shell)
  // Stop Pages running the output through Jekyll.
  fs.writeFileSync(path.join(DIST, '.nojekyll'), '')

  console.log(`prerendered ${written}/${routes.length} routes (+${redirects} redirects) -> dist/`)
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
