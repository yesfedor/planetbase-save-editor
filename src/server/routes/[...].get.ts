import fs from 'node:fs'
import path from 'node:path'
import { defineEventHandler, getRequestURL, setResponseHeader } from 'h3'

const DIST = [path.join(process.cwd(), 'dist'), path.join(process.cwd(), 'src', 'server', 'public')].find((d) =>
  fs.existsSync(d),
)

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
}

export default defineEventHandler((event) => {
  if (!DIST) return 'Web build not found. Run: npm run build'

  const pathname = decodeURIComponent(getRequestURL(event).pathname)
  const rel = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '')
  const safe = path.normalize(rel).replace(/^(\.\.[/\\])+/, '')

  let file = path.join(DIST, safe)
  if (!file.startsWith(DIST) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    file = path.join(DIST, 'index.html')
  }

  setResponseHeader(event, 'content-type', MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream')
  return fs.readFileSync(file)
})
