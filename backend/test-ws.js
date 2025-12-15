const WebSocket = require('ws');

const port = 3002;
const wss = new WebSocket.Server({ port });

wss.on('connection', (ws) => {
    console.log('TEST: Client connected to test server');
    ws.send('Hello from test server');
});

console.log(`TEST: WebSocket server running on port ${port}`);
