const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Hello');
}).listen(5001, '0.0.0.0', () => {
  console.log('Test server running on port 5001');
});
