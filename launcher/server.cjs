const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')
const { exec } = require('node:child_process')

const root = path.join(__dirname, '..', 'app')
const port = 17345

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
  const relativePath = urlPath === '/' ? 'index.html' : urlPath.replace(/^\//, '')
  const filePath = path.normalize(path.join(root, relativePath))

  if (!filePath.startsWith(root)) {
    res.writeHead(403)
    res.end('Forbidden')
    return
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404)
      res.end('Not Found')
      return
    }

    const ext = path.extname(filePath).toLowerCase()
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' })
    res.end(data)
  })
})

server.listen(port, '127.0.0.1', () => {
  exec(`start "" "http://127.0.0.1:${port}/"`)
})
