#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('Testing Gmail MCP Server with real tool call...');

// Start the MCP server
const server = spawn('node', ['dist/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
});

let responseCount = 0;

server.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('Server response:', output);
    
    if (responseCount === 0) {
        // Send list labels request after initialization
        setTimeout(() => {
            const listLabelsRequest = JSON.stringify({
                jsonrpc: "2.0",
                id: 3,
                method: "tools/call",
                params: {
                    name: "list_email_labels",
                    arguments: {}
                }
            }) + '\n';
            
            console.log('Sending list email labels request...');
            server.stdin.write(listLabelsRequest);
        }, 500);
    }
    responseCount++;
});

server.stderr.on('data', (data) => {
    console.log('Server error:', data.toString());
});

// Initialize the server
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

console.log('Initializing server...');
server.stdin.write(initRequest);

// Clean up after 10 seconds
setTimeout(() => {
    console.log('Test completed. Cleaning up...');
    server.kill();
}, 10000);

server.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
});