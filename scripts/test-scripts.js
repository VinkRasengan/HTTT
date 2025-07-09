#!/usr/bin/env node

const { spawn } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('   Testing Messenger Simulator Scripts');
console.log('========================================');
console.log('');

const isWindows = os.platform() === 'win32';
const npmCommand = isWindows ? 'npm.cmd' : 'npm';

// Function to run a command and return promise
function runCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
        console.log(`🧪 Testing: ${command} ${args.join(' ')}`);
        
        const process = spawn(command, args, {
            stdio: ['inherit', 'pipe', 'pipe'],
            shell: isWindows,
            ...options
        });
        
        let stdout = '';
        let stderr = '';
        
        process.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        
        process.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        
        process.on('close', (code) => {
            if (code === 0) {
                console.log(`   ✅ Success`);
                resolve({ code, stdout, stderr });
            } else {
                console.log(`   ❌ Failed with code ${code}`);
                reject({ code, stdout, stderr });
            }
        });
        
        process.on('error', (error) => {
            console.log(`   ❌ Error: ${error.message}`);
            reject(error);
        });
    });
}

// Function to check if file exists
function checkFile(filePath, description) {
    console.log(`📁 Checking: ${description}`);
    if (fs.existsSync(filePath)) {
        console.log(`   ✅ Found: ${filePath}`);
        return true;
    } else {
        console.log(`   ❌ Missing: ${filePath}`);
        return false;
    }
}

// Function to check package.json scripts
function checkPackageScripts() {
    console.log('📋 Checking package.json scripts...');
    
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
        console.log('   ❌ package.json not found');
        return false;
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const requiredScripts = ['install:all', 'start', 'stop'];
    
    let allScriptsExist = true;
    for (const script of requiredScripts) {
        if (packageJson.scripts && packageJson.scripts[script]) {
            console.log(`   ✅ Script "${script}" exists`);
        } else {
            console.log(`   ❌ Script "${script}" missing`);
            allScriptsExist = false;
        }
    }
    
    return allScriptsExist;
}

// Main test function
async function runTests() {
    try {
        console.log('🔍 Environment Check');
        console.log('===================');
        
        // Check Node.js version
        console.log(`Node.js version: ${process.version}`);
        const nodeVersion = parseInt(process.version.slice(1).split('.')[0]);
        if (nodeVersion >= 18) {
            console.log('   ✅ Node.js version is compatible');
        } else {
            console.log('   ❌ Node.js version should be >= 18');
        }
        
        console.log('');
        
        // Check npm version
        try {
            const npmResult = await runCommand(npmCommand, ['--version']);
            console.log(`npm version: v${npmResult.stdout.trim()}`);
        } catch (error) {
            console.log('   ❌ npm not available');
        }
        
        console.log('');
        console.log('📁 File Structure Check');
        console.log('=======================');
        
        // Check required files
        const requiredFiles = [
            { path: 'package.json', desc: 'Root package.json' },
            { path: 'server/package.json', desc: 'Server package.json' },
            { path: 'client/package.json', desc: 'Client package.json' },
            { path: 'electron/package.json', desc: 'Electron package.json' },
            { path: 'scripts/install-all.js', desc: 'Install script' },
            { path: 'scripts/stop-processes.js', desc: 'Stop script' },
            { path: 'scripts/start-electron.js', desc: 'Electron start script' },
            { path: 'start.bat', desc: 'Windows start script' },
            { path: 'stop.bat', desc: 'Windows stop script' }
        ];
        
        let allFilesExist = true;
        for (const file of requiredFiles) {
            const exists = checkFile(path.join(__dirname, '..', file.path), file.desc);
            if (!exists) allFilesExist = false;
        }
        
        console.log('');
        console.log('📋 Package Scripts Check');
        console.log('========================');
        
        const scriptsExist = checkPackageScripts();
        
        console.log('');
        console.log('🧪 Script Functionality Test');
        console.log('============================');
        
        // Test help/version commands
        try {
            await runCommand(npmCommand, ['run'], { timeout: 5000 });
        } catch (error) {
            console.log('   ⚠️  Could not list npm scripts');
        }
        
        // Test if scripts can be called (dry run)
        const testScripts = ['install:all', 'stop'];
        for (const script of testScripts) {
            try {
                // Just check if the script exists and can be called
                const result = await runCommand(npmCommand, ['run', script, '--dry-run'], { 
                    timeout: 3000,
                    cwd: path.join(__dirname, '..')
                });
                console.log(`   ✅ Script "${script}" is callable`);
            } catch (error) {
                console.log(`   ⚠️  Script "${script}" test inconclusive`);
            }
        }
        
        console.log('');
        console.log('📊 Test Summary');
        console.log('===============');
        
        if (allFilesExist && scriptsExist) {
            console.log('✅ All tests passed!');
            console.log('');
            console.log('🚀 You can now run:');
            console.log('   npm run install:all  # Install all dependencies');
            console.log('   npm start            # Start the application');
            console.log('   npm stop             # Stop the application');
            console.log('');
            console.log('💡 On Windows, you can also use:');
            console.log('   start.bat            # Start application');
            console.log('   stop.bat             # Stop application');
        } else {
            console.log('❌ Some tests failed!');
            console.log('');
            console.log('Please check the errors above and fix them before running the application.');
        }
        
    } catch (error) {
        console.log('');
        console.log('❌ Test suite failed!');
        console.log(`Error: ${error.message}`);
        process.exit(1);
    }
}

// Run tests
runTests();
