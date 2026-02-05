/**
 * Static File Server for CivicServe Frontend
 * Serves Next.js build with correct file structure
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer(async (req, res) => {
  let pathname = decodeURIComponent(new URL(req.url, `http://localhost:${PORT}`).pathname);

  // Proxy /api requests to backend
  if (pathname.startsWith('/api/')) {
    const backendUrl = `http://localhost:3001${req.url}`;
    const options = {
      method: req.method,
      headers: { ...req.headers },
    };
    delete options.headers['host'];

    const proxyReq = http.request(backendUrl, options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', () => {
      res.writeHead(503);
      res.end('Backend unavailable');
    });

    req.pipe(proxyReq);
    return;
  }

  // Try to serve files in this order:
  // 1. Static files (.js, .css, images)
  // 2. Page HTML files
  // 3. Default to index.html

  let filePath = pathname === '/' ? 'index.html' : pathname.substring(1);
  let fullPath = null;

  // Try .next/static (for chunks, media)
  if (pathname.startsWith('/_next/')) {
    fullPath = path.join(__dirname, 'frontend/.next/static', pathname.substring(7));
  } else {
    // Try frontend/public first
    fullPath = path.join(__dirname, 'frontend/public', filePath);
    if (!fs.existsSync(fullPath)) {
      // Try .next/server/app (for HTML pages)
      fullPath = path.join(__dirname, 'frontend/.next/server/app', filePath + '.html');
      if (!fs.existsSync(fullPath)) {
        // Default to index
        fullPath = path.join(__dirname, 'frontend/.next/server/app/index.html');
      }
    }
  }

  const ext = path.extname(fullPath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.map': 'application/json',
  };

  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(fullPath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found: ' + fullPath);
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend Server listening on http://localhost:${PORT}`);
  console.log(`Backend API: http://localhost:3001`);
  console.log('Ready to serve...');
});
