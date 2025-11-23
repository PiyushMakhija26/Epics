#!/usr/bin/env node

const { spawn } = require('child_process');
const fetch = require('node-fetch');
const path = require('path');

console.log('='.repeat(60));
console.log('CivicServe Stack Launcher');
console.log('='.repeat(60));

// Paths
const backendPath = 'c:\\Users\\piyu4\\OneDrive\\Desktop\\Epics\\backend';
const frontendPath = 'c:\\Users\\piyu4\\OneDrive\\Desktop\\Epics\\frontend';

let backendReady = false;
let frontendReady = false;

// Start Backend
console.log('\n[1] Starting Backend Server...');
const backend = spawn('cmd', ['/c', 'npm run dev'], {
  cwd: backendPath,
  stdio: 'inherit',
  detached: true,
});

// Start Frontend
setTimeout(() => {
  console.log('\n[2] Starting Frontend Server...');
  const frontend = spawn('cmd', ['/c', 'npm run dev'], {
    cwd: frontendPath,
    stdio: 'inherit',
    detached: true,
  });
}, 3000);

// Poll for servers
setTimeout(async () => {
  console.log('\n[3] Polling servers...\n');
  let attempts = 0;
  const maxAttempts = 30;
  
  while (attempts < maxAttempts) {
    try {
      const backRes = await fetch('http://localhost:3001/health');
      if (backRes.ok) {
        console.log('✓ Backend ready at http://localhost:3001');
        backendReady = true;
      }
    } catch (e) {}
    
    try {
      const frontRes = await fetch('http://localhost:3000');
      if (frontRes.ok || frontRes.status === 404) {
        console.log('✓ Frontend ready at http://localhost:3000');
        frontendReady = true;
      }
    } catch (e) {}
    
    if (backendReady && frontendReady) {
      console.log('\n' + '='.repeat(60));
      console.log('✓ Both servers are running!');
      console.log('='.repeat(60));
      console.log('\nAccess the application at: http://localhost:3000');
      break;
    }
    
    attempts++;
    await new Promise(r => setTimeout(r, 1000));
  }
}, 6000);
