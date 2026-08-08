/**
 * Full production build, in order:
 *   content (md -> json) -> images (originals -> webp) -> client -> ssr -> prerender
 *
 * Image derivatives are cached on disk, so repeat builds skip straight past them.
 */

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SITE = path.resolve(HERE, '..')

function resolveBase() {
  if (process.env.VITE_BASE) return process.env.VITE_BASE
  if (fs.existsSync(path.join(SITE, 'public/CNAME'))) return '/'
  if (process.env.GITHUB_REPOSITORY) {
    const repo = process.env.GITHUB_REPOSITORY.split('/')[1]
    return repo.endsWith('.github.io') ? '/' : `/${repo}/`
  }
  return '/'
}

const base = resolveBase()
const env = { ...process.env, RESOLVED_BASE: base, VITE_BASE: base }

const run = (label, args) => {
  console.log(`\n=== ${label} ===`)
  execFileSync(process.execPath, args, { cwd: SITE, stdio: 'inherit', env })
}

const vite = path.join(SITE, 'node_modules/vite/bin/vite.js')

/** The rescued videos live in assets/video (normal git); the site serves them from public. */
function stageVideos() {
  const from = path.resolve(SITE, '../assets/video')
  const to = path.join(SITE, 'public/video')
  if (!fs.existsSync(from)) return
  fs.mkdirSync(to, { recursive: true })
  let n = 0
  for (const f of fs.readdirSync(from)) {
    if (!f.endsWith('.mp4')) continue
    const dest = path.join(to, f)
    const src = path.join(from, f)
    if (!fs.existsSync(dest) || fs.statSync(dest).size !== fs.statSync(src).size) {
      fs.copyFileSync(src, dest)
    }
    n++
  }
  console.log(`\n=== video ===\nstaged ${n} videos -> public/video`)
}

console.log(`base path: ${base}`)
stageVideos()
run('content', [path.join(HERE, 'build-content.mjs')])
run('images', [path.join(HERE, 'build-images.mjs')])
run('client', [vite, 'build'])
run('ssr', [vite, 'build', '--ssr', 'src/entry-server.tsx', '--outDir', 'dist-ssr'])
run('prerender', [path.join(HERE, 'prerender.mjs')])

console.log('\nbuild complete -> site/dist')
