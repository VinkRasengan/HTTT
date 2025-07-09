#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

console.log('Waiting for server and client to start...');

// Wait 8 seconds for server and client to be ready
setTimeout(() => {
    console.log('Starting Electron app...');
    
    const electronDir = path.join(__dirname, '..', 'electron');
    const isWindows = os.platform() === 'win32';
    
    // Change to electron directory and start
    const command = isWindows ? 'npm.cmd' : 'npm';
    const args = ['start'];
    
    const electronProcess = spawn(command, args, {
        cwd: electronDir,
        stdio: 'inherit',
        shell: isWindows
    });
    
    electronProcess.on('error', (error) => {
        console.error('Failed to start Electron:', error.message);
        process.exit(1);
    });
    
    electronProcess.on('close', (code) => {
        if (code !== 0) {
            console.log(`Electron process exited with code ${code}`);
        }
        process.exit(code);
    });
    
    // Handle process termination
    process.on('SIGINT', () => {
        console.log('Stopping Electron...');
        electronProcess.kill('SIGINT');
    });
    
    process.on('SIGTERM', () => {
        console.log('Terminating Electron...');
        electronProcess.kill('SIGTERM');
    });
    
}, 8000); // 8 second delay
