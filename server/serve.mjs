// Production-build preview, including legacy redirects and the enquiry endpoint.
import { createServer } from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, sep, extname } from 'node:path';
import { serveEnquiry } from './http-enquiries.mjs';
const root = await realpath(fileURLToPath(new URL('../dist/', import.meta.url)));
const redirects = new Map(
  (await readFile(resolve(root, '_redirects'), 'utf8'))
    .split('\n')
    .filter((line) => line.startsWith('/'))
    .map((line) => line.trim().split(/\s+/)),
);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.geojson': 'application/geo+json',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
};
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/api/enquiries') {
      await serveEnquiry(req, res);
      return;
    }
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(405, { Allow: 'GET, HEAD' });
      res.end();
      return;
    }
    const pathname = decodeURIComponent(url.pathname);
    if (redirects.has(pathname)) {
      res.writeHead(301, { Location: redirects.get(pathname) + url.search });
      res.end();
      return;
    }
    if (pathname.split('/').some((part) => part.startsWith('.')) || pathname === '/_redirects') {
      res.writeHead(404);
      res.end();
      return;
    }
    let file = await realpath(resolve(root, '.' + pathname));
    if (!(file === root || file.startsWith(root + sep))) {
      res.writeHead(404);
      res.end();
      return;
    }
    if ((await stat(file)).isDirectory()) {
      if (!pathname.endsWith('/')) {
        res.writeHead(301, { Location: pathname + '/' + url.search });
        res.end();
        return;
      }
      file = resolve(file, 'index.html');
    }
    const data = await readFile(file);
    res.writeHead(200, {
      'Content-Type': types[extname(file)] || 'application/octet-stream',
      'Content-Length': data.length,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-cache',
    });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch {
    if (!res.headersSent) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      try {
        res.end(await readFile(resolve(root, '404.html')));
        return;
      } catch {}
    }
    res.end();
  }
});
server.requestTimeout = 20000;
server.headersTimeout = 10000;
const port = Number(process.env.PORT || 48767),
  host = process.env.HOST || '127.0.0.1';
server.listen(port, host, () => console.log(`Dipai preview: http://${host}:${port}`));
