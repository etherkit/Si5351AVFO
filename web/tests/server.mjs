import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

export function startServer() {
  const server = http.createServer((request, response) => {
    const url = new URL(request.url, 'http://localhost');
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === '/') {
      pathname = '/index.html';
    }
    const filePath = path.normalize(path.join(webRoot, pathname));
    if (!filePath.startsWith(webRoot)) {
      response.writeHead(403);
      response.end('Forbidden');
      return;
    }
    fs.readFile(filePath, (error, data) => {
      if (error) {
        response.writeHead(404);
        response.end('Not found');
        return;
      }
      response.writeHead(200, {
        'Content-Type': MIME_TYPES[path.extname(filePath)] || 'application/octet-stream'
      });
      response.end(data);
    });
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

export function stopServer(server) {
  return new Promise((resolve) => {
    server.close(() => resolve());
  });
}
