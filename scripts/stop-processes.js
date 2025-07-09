#!/usr/bin/env node

const { exec, spawn } = require('child_process');
const os = require('os');
const path = require('path');

console.log('========================================');
console.log('   Stopping Messenger Simulator');
console.log('========================================');
console.log('');

const isWindows = os.platform() === 'win32';
const isMac = os.platform() === 'darwin';
const isLinux = os.platform() === 'linux';

// Function to execute command and return promise
function execCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                resolve({ success: false, error: error.message, stdout, stderr });
            } else {
                resolve({ success: true, stdout, stderr });
            }
        });
    });
}

// Function to kill processes by name
async function killProcessByName(processName, displayName) {
    console.log(`Stopping ${displayName} processes...`);
    
    let command;
    if (isWindows) {
        command = `taskkill /f /im ${processName} /t`;
    } else if (isMac || isLinux) {
        command = `pkill -f ${processName}`;
    }
    
    const result = await execCommand(command);
    if (result.success || result.stdout.includes('SUCCESS')) {
        console.log(`  ✓ ${displayName} processes stopped`);
    } else {
        console.log(`  - No ${displayName} processes found`);
    }
}

// Function to kill processes using specific ports
async function killProcessByPort(port) {
    console.log(`Freeing up port ${port}...`);
    
    let command;
    if (isWindows) {
        // Find PID using port and kill it
        const findCommand = `netstat -ano | findstr :${port}`;
        const result = await execCommand(findCommand);
        
        if (result.success && result.stdout) {
            const lines = result.stdout.split('\n');
            for (const line of lines) {
                const parts = line.trim().split(/\s+/);
                if (parts.length >= 5) {
                    const pid = parts[parts.length - 1];
                    if (pid && pid.match(/^\d+$/)) {
                        await execCommand(`taskkill /f /pid ${pid}`);
                    }
                }
            }
            console.log(`  ✓ Port ${port} freed`);
        } else {
            console.log(`  - No processes found using port ${port}`);
        }
    } else if (isMac || isLinux) {
        command = `lsof -ti:${port} | xargs kill -9`;
        const result = await execCommand(command);
        if (result.success) {
            console.log(`  ✓ Port ${port} freed`);
        } else {
            console.log(`  - No processes found using port ${port}`);
        }
    }
}

// Main function to stop all processes
async function stopAllProcesses() {
    try {
        // Stop Node.js processes
        await killProcessByName('node.exe', 'Node.js');
        
        // Stop Electron processes
        await killProcessByName('electron.exe', 'Electron');
        
        // Stop Messenger Simulator processes
        await killProcessByName('"Messenger Simulator.exe"', 'Messenger Simulator');
        
        // Stop npm processes
        await killProcessByName('npm.exe', 'npm');
        
        // For non-Windows systems
        if (!isWindows) {
            await killProcessByName('node', 'Node.js');
            await killProcessByName('electron', 'Electron');
            await killProcessByName('npm', 'npm');
        }
        
        console.log('');
        console.log('Freeing up application ports...');
        
        // Free up ports 3000 and 3001
        await killProcessByPort(3000);
        await killProcessByPort(3001);
        
        console.log('');
        console.log('========================================');
        console.log('   All processes stopped successfully!');
        console.log('========================================');
        console.log('');
        console.log('You can now safely restart the application.');
        console.log('');
        
    } catch (error) {
        console.error('Error stopping processes:', error.message);
        process.exit(1);
    }
}

// Handle different operating systems
if (isWindows) {
    // On Windows, also try to use the batch script as fallback
    const batchScript = path.join(__dirname, 'stop-processes.bat');
    exec(`"${batchScript}"`, (error, stdout, stderr) => {
        if (error) {
            console.log('Batch script failed, using Node.js method...');
            stopAllProcesses();
        } else {
            console.log(stdout);
        }
    });
} else {
    // On Unix-like systems, use Node.js method
    stopAllProcesses();
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\nStop script interrupted.');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nStop script terminated.');
    process.exit(0);
});
