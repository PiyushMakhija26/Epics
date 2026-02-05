#!/usr/bin/env node

/**
 * CivicServe Full Stack Runner
 * Starts backend and frontend concurrently with proper logging and shutdown handling
 */

const { spawn } = require('child_process');
const path = require('path');

const rootDir = __dirname;
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

console.log('\n🚀 Starting CivicServe...\n');

// Start Backend
const backend = spawn('npm', ['run', 'dev'], {
  cwd: backendDir,
  stdio: 'inherit',
  shell: true,
});

// Wait a bit, then start Frontend
setTimeout(() => {
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: frontendDir,
    stdio: 'inherit',
    shell: true,
  });

  frontend.on('exit', (code) => {
    console.log(`\nFrontend exited with code ${code}`);
    process.exit(0);
  });
}, 3000);

backend.on('exit', (code) => {
  console.log(`\nBackend exited with code ${code}`);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nShutting down...');
  backend.kill('SIGTERM');
  process.exit(0);
});
