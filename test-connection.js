const http = require('http');

const testUrl = 'http://localhost:3001/health';

console.log('Testing connection to backend at ' + testUrl);

http.get(testUrl, (res) => {
    console.log('Connection successful! Status:', res.statusCode);
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log('Response:', data);
        process.exit(0);
    });
}).on('error', (error) => {
    console.error('Connection failed:', error.message);
    process.exit(1);
});

// Timeout after 5 seconds
setTimeout(() => {
    console.error('Connection timeout');
    process.exit(1);
}, 5000);
