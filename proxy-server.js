/**
 * Port Forwarder: 3000 → 3002
 * Forwards requests from port 3000 to Next.js dev server on 3002
 */

const http = require('http');

const PORT = 3000;
const TARGET_PORT = 3002;

const server = http.createServer((req, res) => {
  const options = {
    hostname: 'localhost',
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers,
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error(`Error proxying to port ${TARGET_PORT}:`, err.message);
    res.writeHead(503);
    res.end('Service Unavailable');
  });

  req.pipe(proxyReq);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Port Forwarder: localhost:${PORT} → localhost:${TARGET_PORT}`);
});
