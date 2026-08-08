import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

/**
 * Base path.
 *
 * A GitHub Pages *project* site is served from /<repo>/, so assets need that prefix.
 * Once a custom domain is attached (public/CNAME present) it's served from the root
 * instead. Detecting the CNAME means the switch to alexfiel.com needs no code change.
 * VITE_BASE overrides both when needed.
 */
function resolveBase(): string {
  if (process.env.VITE_BASE) return process.env.VITE_BASE
  if (fs.existsSync(path.resolve(import.meta.dirname, 'public/CNAME'))) return '/'
  if (process.env.GITHUB_REPOSITORY) {
    const repo = process.env.GITHUB_REPOSITORY.split('/')[1]
    // user/org sites (<name>.github.io) are already served from the root
    return repo.endsWith('.github.io') ? '/' : `/${repo}/`
  }
  return '/'
}

export default defineConfig({
  base: resolveBase(),
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
  },
})
