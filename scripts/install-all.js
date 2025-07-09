#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

console.log('========================================');
console.log('   Installing Messenger Simulator');
console.log('========================================');
console.log('');

const isWindows = os.platform() === 'win32';
const npmCommand = isWindows ? 'npm.cmd' : 'npm';

// Function to run npm install in a directory
function installDependencies(directory, name) {
    return new Promise((resolve, reject) => {
        console.log(`📦 Installing ${name} dependencies...`);
        
        const fullPath = path.resolve(directory);
        
        // Check if package.json exists
        const packageJsonPath = path.join(fullPath, 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
            console.log(`   ⚠️  No package.json found in ${directory}, skipping...`);
            resolve();
            return;
        }
        
        const installProcess = spawn(npmCommand, ['install'], {
            cwd: fullPath,
            stdio: ['inherit', 'pipe', 'pipe'],
            shell: isWindows
        });
        
        let output = '';
        let errorOutput = '';
        
        installProcess.stdout.on('data', (data) => {
            output += data.toString();
            // Show progress for long-running installs
            if (data.toString().includes('added') || data.toString().includes('updated')) {
                process.stdout.write('.');
            }
        });
        
        installProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
            // npm warnings are sent to stderr but are not errors
            if (data.toString().includes('WARN')) {
                process.stdout.write('!');
            }
        });
        
        installProcess.on('close', (code) => {
            console.log(''); // New line after progress dots
            
            if (code === 0) {
                console.log(`   ✅ ${name} dependencies installed successfully`);
                
                // Show package count
                try {
                    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                    const depCount = Object.keys(packageJson.dependencies || {}).length;
                    const devDepCount = Object.keys(packageJson.devDependencies || {}).length;
                    console.log(`   📊 Installed ${depCount} dependencies, ${devDepCount} dev dependencies`);
                } catch (e) {
                    // Ignore error reading package.json
                }
                
                resolve();
            } else {
                console.log(`   ❌ Failed to install ${name} dependencies`);
                console.log(`   Error code: ${code}`);
                if (errorOutput) {
                    console.log(`   Error output: ${errorOutput.slice(0, 200)}...`);
                }
                reject(new Error(`Failed to install ${name} dependencies`));
            }
        });
        
        installProcess.on('error', (error) => {
            console.log(`   ❌ Error starting npm install for ${name}: ${error.message}`);
            reject(error);
        });
    });
}

// Main installation function
async function installAll() {
    const startTime = Date.now();
    
    try {
        console.log('🔍 Checking Node.js and npm versions...');
        
        // Check Node.js version
        const nodeVersion = process.version;
        console.log(`   Node.js: ${nodeVersion}`);
        
        // Check npm version
        const npmVersionProcess = spawn(npmCommand, ['--version'], {
            stdio: ['inherit', 'pipe', 'pipe'],
            shell: isWindows
        });
        
        let npmVersion = '';
        npmVersionProcess.stdout.on('data', (data) => {
            npmVersion += data.toString().trim();
        });
        
        await new Promise((resolve) => {
            npmVersionProcess.on('close', () => {
                console.log(`   npm: v${npmVersion}`);
                resolve();
            });
        });
        
        console.log('');
        
        // Install dependencies in order
        const installations = [
            { dir: '.', name: 'Root' },
            { dir: 'server', name: 'Server' },
            { dir: 'client', name: 'Client' },
            { dir: 'electron', name: 'Electron' }
        ];
        
        for (const installation of installations) {
            await installDependencies(installation.dir, installation.name);
            console.log('');
        }
        
        const endTime = Date.now();
        const duration = Math.round((endTime - startTime) / 1000);
        
        console.log('========================================');
        console.log('   ✅ All dependencies installed!');
        console.log('========================================');
        console.log('');
        console.log(`⏱️  Total installation time: ${duration} seconds`);
        console.log('');
        console.log('🚀 You can now start the application with:');
        console.log('   npm start');
        console.log('');
        console.log('📚 Or read the documentation:');
        console.log('   docs/SETUP.md');
        console.log('   docs/USER_GUIDE.md');
        console.log('');
        
    } catch (error) {
        console.log('');
        console.log('========================================');
        console.log('   ❌ Installation failed!');
        console.log('========================================');
        console.log('');
        console.log(`Error: ${error.message}`);
        console.log('');
        console.log('💡 Try the following:');
        console.log('   1. Check your internet connection');
        console.log('   2. Clear npm cache: npm cache clean --force');
        console.log('   3. Delete node_modules and try again: npm run clean');
        console.log('   4. Check Node.js version (requires >= 18.0.0)');
        console.log('');
        process.exit(1);
    }
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n\n⚠️  Installation interrupted by user');
    console.log('You may need to run "npm run install:all" again');
    process.exit(1);
});

process.on('SIGTERM', () => {
    console.log('\n\n⚠️  Installation terminated');
    process.exit(1);
});

// Start installation
installAll();
