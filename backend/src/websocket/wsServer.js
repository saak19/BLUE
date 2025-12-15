const WebSocket = require('ws');
/* 
  Since HostPresence model implementation is crucial for persistence,
  we will use it here. 
  We also need to handle broadcasting status to any connected clients 
  interested in a specific host (e.g. the Embed widget).
*/
const jwt = require('jsonwebtoken');
const HostPresence = require('../models/HostPresence');

const initializeWebSocket = (server) => {
    console.log('initializeWebSocket called with server:', !!server);
    const wss = new WebSocket.Server({
        server,
        clientTracking: true,
        perMessageDeflate: false
    });
    console.log('WSS created, waiting for connections...');
    console.log('WebSocket initialized on same server');

    wss.on('error', (error) => {
        console.error('WSS Server Error:', error);
    });

    wss.on('connection', async (ws, req) => {
        console.log('WebSocket client connected');

        ws.on('error', (error) => {
            console.error('Client WS Connection Error:', error);
        });


        // console.log('New WebSocket connection');
        // Check for authentication if it's a HOST connecting.
        // Visitors (Embed) might connect anonymously or with a temporary ID? 
        // The prompt says "establish WebSocket connection for real-time status".
        // For Host: They connect to update their status.
        // For Visitor: They connect to listen to a Host's status.

        // Simple protocol:
        // Client sends: { type: 'auth', token: '...' } -> registers as Host
        // Client sends: { type: 'subscribe', hostId: '...' } -> registers as Visitor watching Host

        ws.isAlive = true;
        ws.on('pong', () => { ws.isAlive = true; });

        ws.on('message', async (message) => {
            try {
                const data = JSON.parse(message);
                console.log(`WS Received: ${data.type}`);

                if (data.type === 'auth') {
                    // Host authenticating
                    try {
                        const decoded = jwt.verify(data.token, process.env.JWT_SECRET);
                        ws.userId = decoded.userId;
                        ws.role = 'host';

                        // Update DB
                        await HostPresence.findOneAndUpdate(
                            { userId: decoded.userId },
                            { status: 'online', lastActiveTime: new Date(), wsConnectionId: 'active' },
                            { upsert: true, new: true }
                        );

                        // Broadcast to subscribers
                        broadcastStatus(wss, decoded.userId, 'online');

                    } catch (err) {
                        ws.send(JSON.stringify({ type: 'error', message: 'Invalid token' }));
                    }
                } else if (data.type === 'subscribe') {
                    // Visitor subscribing to a host
                    console.log('Subscribe request for hostId:', data.hostId);

                    if (!data.hostId) {
                        console.error('Subscribe error: Missing hostId');
                        ws.send(JSON.stringify({ type: 'error', message: 'Missing hostId' }));
                        return;
                    }

                    ws.subscribedHostId = data.hostId;
                    ws.role = 'visitor';

                    try {
                        // Send current status immediately
                        const presence = await HostPresence.findOne({ userId: data.hostId });
                        console.log('Host presence found:', presence ? 'Yes' : 'No');
                        const status = presence ? presence.status : 'offline';
                        console.log('Sending status to visitor:', status);
                        ws.send(JSON.stringify({ type: 'status_update', status }));
                    } catch (err) {
                        console.error('Subscribe error (Database):', err);
                        // Don't close connection, just send offline
                        ws.send(JSON.stringify({ type: 'status_update', status: 'offline' }));
                    }
                } else if (data.type === 'ping') {
                    // update last active if host
                    if (ws.role === 'host' && ws.userId) {
                        await HostPresence.findOneAndUpdate(
                            { userId: ws.userId },
                            { lastActiveTime: new Date() }
                        );
                    }
                } else if (data.type === 'call-request') {
                    // Visitor requesting a call
                    const { hostId, visitorName, visitorEmail } = data;

                    // console.log(`Call request from ${visitorName} to ${hostId}`);

                    // Find the host's websocket
                    let hostWs = null;
                    wss.clients.forEach(client => {
                        if (client.userId === hostId && client.role === 'host' && client.readyState === WebSocket.OPEN) {
                            hostWs = client;
                        }
                    });

                    if (hostWs) {
                        const callId = Date.now().toString(36) + Math.random().toString(36).substr(2);
                        ws.currentCallId = callId;
                        hostWs.currentCallId = callId;

                        // Map callId to participants for easier lookup if needed, 
                        // but storing on ws object is simple for now. 
                        // Ideally use a manager, but for this scope it is fine.

                        // We need to map callId to visitor socket so when host answers we know who to tell
                        // Since we don't have a global call manager object in this snippet, let's look up by iterating or attaching to hostWs
                        hostWs.pendingCallVisitorWs = ws;

                        hostWs.send(JSON.stringify({
                            type: 'incoming-call',
                            visitor: { name: visitorName, email: visitorEmail },
                            callId
                        }));
                    } else {
                        ws.send(JSON.stringify({ type: 'call-error', message: 'Host is offline or unavailable' }));
                    }
                } else if (data.type === 'call-answer') {
                    // Host answering
                    const { callId } = data;
                    // The visitor socket is stored in pendingCallVisitorWs
                    if (ws.pendingCallVisitorWs && ws.pendingCallVisitorWs.readyState === WebSocket.OPEN) {
                        ws.pendingCallVisitorWs.send(JSON.stringify({ type: 'call-accepted', callId }));

                        // Clean up pending ref, now they are in a call
                        ws.pendingCallVisitorWs.currentCallId = callId;
                        ws.pendingCallVisitorWs.peerWs = ws;
                        ws.peerWs = ws.pendingCallVisitorWs;
                        ws.pendingCallVisitorWs = null;
                    }
                } else if (data.type === 'call-decline') {
                    // Host declining
                    const { callId } = data;
                    if (ws.pendingCallVisitorWs && ws.pendingCallVisitorWs.readyState === WebSocket.OPEN) {
                        ws.pendingCallVisitorWs.send(JSON.stringify({ type: 'call-declined', callId }));
                        ws.pendingCallVisitorWs = null;
                    }
                } else if (data.type === 'call-end') {
                    // Either side ending
                    const peer = ws.peerWs || ws.pendingCallVisitorWs; // If ended before answer, it might be pending
                    if (peer && peer.readyState === WebSocket.OPEN) {
                        peer.send(JSON.stringify({ type: 'call-ended' }));
                        peer.peerWs = null;
                        peer.currentCallId = null;
                    }
                    ws.peerWs = null;
                    ws.currentCallId = null;
                    ws.pendingCallVisitorWs = null;
                } else if (['webrtc-offer', 'webrtc-answer', 'ice-candidate'].includes(data.type)) {
                    // Relay WebRTC signaling messages
                    // The peerWs should be established during call-accepted
                    // note: for initial offer, call might not be accepted yet? 
                    // No, flow is: call-request -> call-accepted -> webrtc negotiation.
                    // So peerWs should be set.

                    const peer = ws.peerWs;
                    if (peer && peer.readyState === WebSocket.OPEN) {
                        console.log(`Relaying ${data.type} to peer`);
                        peer.send(JSON.stringify(data));
                    } else {
                        console.warn(`Cannot relay ${data.type}: Peer not connected or not found`);
                    }
                }
            } catch (e) {
                console.error('WS Error:', e);
            }
        });

        ws.on('close', async () => {
            if (ws.role === 'host' && ws.userId) {
                // Mark offline after a nuance delay or immediately? Immediately for now.
                await HostPresence.findOneAndUpdate(
                    { userId: ws.userId },
                    { status: 'offline', lastActiveTime: new Date() }
                );
                broadcastStatus(wss, ws.userId, 'offline');
            }
        });
    });

    // Heartbeat to clean up dead connections
    const interval = setInterval(() => {
        wss.clients.forEach((ws) => {
            if (ws.isAlive === false) return ws.terminate();
            ws.isAlive = false;
            ws.ping();
        });
    }, 30000);

    wss.on('close', () => clearInterval(interval));

    return wss;
};

const broadcastStatus = (wss, hostId, status) => {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && client.subscribedHostId === hostId) {
            client.send(JSON.stringify({ type: 'status_update', status }));
        }
    });
};

console.log('wsServer.js module loaded and exported');
module.exports = initializeWebSocket;
