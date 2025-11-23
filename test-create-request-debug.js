const http = require('http');
const https = require('https');

function httpFetch(url, opts, body) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const u = new URL(url);
    const options = {
      method: opts.method || 'GET',
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      headers: opts.headers || {}
    };
    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', (e) => reject(e));
    if (body) req.write(body);
    req.end();
  });
}

(async () => {
  try {
    const base = 'http://localhost:3001';
    // Login
    const login = await httpFetch(base + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' } }, JSON.stringify({ email: 'user1@example.com', password: 'Password123!' }));
    console.log('login status', login.status);
    console.log('login body', login.body);
    let token = null;
    try { token = JSON.parse(login.body).token } catch(e) {}
    if (!token) { console.error('No token'); process.exit(2); }
    console.log('token:', token);
    // decode payload
    const parts = token.split('.');
    if (parts.length !== 3) { console.error('Invalid token format'); process.exit(3); }
    const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g,'+').replace(/_/g,'/'),'base64').toString());
    console.log('decoded payload', payload);

    // create request
    const create = await httpFetch(base + '/api/requests', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token } }, JSON.stringify({ title: 'Debug Request', description: 'debug', category: 'General', department: 'Electricity' }));
    console.log('create status', create.status);
    console.log('create body', create.body);
    process.exit(0);
  } catch (err) {
    console.error('error', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
