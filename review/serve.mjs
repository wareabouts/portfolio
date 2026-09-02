/**
 * Serve review/dist locally for checking the copy desk before publishing.
 *
 *   node review/serve.mjs   ->  http://localhost:4180/copy-desk.html
 *
 * The published artifact runs behind a claude.ai session the local browser pane does
 * not have, so this is how the page gets exercised. Without `window.claude` the page
 * falls back to device storage, which is the one path this cannot test.
 */

import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const DIST = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist')
const PORT = Number(process.env.PORT) || 4180
const TYPES = { '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.js': 'text/javascript' }

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x')
  const file = path.join(DIST, url.pathname === '/' ? 'copy-desk.html' : url.pathname)
  if (!file.startsWith(DIST) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404); res.end('not found'); return
  }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' })
  fs.createReadStream(file).pipe(res)
}).listen(PORT, () => console.log(`copy desk at http://localhost:${PORT}/copy-desk.html`))
