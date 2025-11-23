#!/usr/bin/env node
/**
 * Smoke Test Runner - Manages backend server and runs smoke tests
 */
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BACKEND_DIR = 'c:\\Users\\piyu4\\OneDrive\\Desktop\\Epics\\backend';
const ROOT_DIR = 'c:\\Users\\piyu4\\OneDrive\\Desktop\\Epics';
const BACKEND_URL = 'http://localhost:3001';
const HEALTH_CHECK_TIMEOUT = 15000;
const STARTUP_WAIT = 8000;

let backendProcess = null;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

async function killExistingNodeProcesses() {
  log('Killing existing node processes...');
  return new Promise((resolve) => {
    const kill = spawn('taskkill', ['/IM', 'node.exe', '/F', '/T'], {
      stdio: 'pipe'
    });
    kill.on('close', () => {
      resolve();
    });
  });
}

async function startBackend() {
  log('Starting backend server...');
  return new Promise((resolve, reject) => {
    backendProcess = spawn('npm.cmd', ['run', 'dev'], {
      cwd: BACKEND_DIR,
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: false
    });

    let startupOutput = '';
    let isRunning = false;

    backendProcess.stdout.on('data', (data) => {
      startupOutput += data.toString();
      if (startupOutput.includes('running on port')) {
        isRunning = true;
        log('Backend server started successfully');
      }
    });

    backendProcess.stderr.on('data', (data) => {
      log('[STDERR] ' + data.toString());
    });

    backendProcess.on('error', (error) => {
      log('Failed to start backend: ' + error.message);
      reject(error);
    });

    backendProcess.on('close', (code) => {
      if (!isRunning) {
        reject(new Error(`Backend process exited with code ${code}`));
      }
    });

    // Wait a bit for output to come through
    setTimeout(() => {
      if (isRunning) {
        resolve();
      } else {
        resolve(); // Allow startup to continue even if we haven't seen the message
      }
    }, STARTUP_WAIT);
  });
}

async function healthCheck() {
  log('Checking backend health...');
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const attemptCheck = () => {
      http.get(BACKEND_URL + '/health', (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          log('Backend health check passed');
          resolve();
        });
      }).on('error', (error) => {
        const elapsed = Date.now() - startTime;
        if (elapsed > HEALTH_CHECK_TIMEOUT) {
          reject(new Error(`Health check timeout after ${elapsed}ms: ${error.message}`));
        } else {
          setTimeout(attemptCheck, 500);
        }
      });
    };

    attemptCheck();
  });
}

async function runSmokeTests() {
  log('Running smoke tests...');
  return new Promise((resolve, reject) => {
    const smokeTests = spawn('node', ['scripts/smoke_node.js'], {
      cwd: ROOT_DIR,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let output = '';
    smokeTests.stdout.on('data', (data) => {
      output += data.toString();
      process.stdout.write(data);
    });

    smokeTests.stderr.on('data', (data) => {
      process.stderr.write(data);
    });

    smokeTests.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Smoke tests failed with code ${code}`));
      }
    });
  });
}

async function stopBackend() {
  log('Stopping backend server...');
  if (backendProcess) {
    backendProcess.kill();
    await sleep(1000);
  }
}

async function main() {
  try {
    await killExistingNodeProcesses();
    await sleep(2000);
    await startBackend();
    await sleep(3000);
    await healthCheck();
    await runSmokeTests();
    log('All tests completed successfully');
  } catch (error) {
    log('Error: ' + error.message);
    process.exit(1);
  } finally {
    await stopBackend();
  }
}

main().catch(error => {
  log('Fatal error: ' + error.message);
  process.exit(1);
});
