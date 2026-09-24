import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = new URL('./dist/', import.meta.url).pathname.slice(1);
const types = { '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml' };

createServer(async (request, response) => {
  try {
    const requested = request.url === '/' ? 'index.html' : request.url.split('?')[0].slice(1);
    const file = normalize(join(root, requested));
    if (!file.startsWith(normalize(root))) throw new Error('Invalid path');
    const body = await readFile(file);
    response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end('Not found');
  }
}).listen(4173, '127.0.0.1', () => console.log('Local: http://127.0.0.1:4173'));
