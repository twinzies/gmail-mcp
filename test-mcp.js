#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('Testing Gmail MCP Server...');

// Start the MCP server
const server = spawn('node', ['dist/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
let errorOutput = '';

server.stdout.on('data', (data) => {
    output += data.toString();
    console.log('STDOUT:', data.toString());
});

server.stderr.on('data', (data) => {
    errorOutput += data.toString();
    console.log('STDERR:', data.toString());
});

// Test MCP initialization request
const initRequest = JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: {
            name: "test-client",
            version: "1.0.0"
        }
    }
}) + '\n';

console.log('Sending initialization request...');
server.stdin.write(initRequest);

// Test list tools request
setTimeout(() => {
    const listToolsRequest = JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/list",
        params: {}
    }) + '\n';
    
    console.log('Sending list tools request...');
    server.stdin.write(listToolsRequest);
}, 1000);

// Clean up after 5 seconds
setTimeout(() => {
    console.log('Test completed. Cleaning up...');
    server.kill();
}, 5000);

server.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
    console.log('Total output length:', output.length);
    console.log('Total error output length:', errorOutput.length);
});