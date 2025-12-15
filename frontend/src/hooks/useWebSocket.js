import { useEffect, useRef, useState, useCallback } from 'react';

const useWebSocket = (url = 'ws://localhost:3001', params = {}) => {
    // Handle both { hostId: ... } object and direct userId string
    const options = typeof params === 'string' ? { hostId: params } : params;

    const [status, setStatus] = useState('disconnected'); // 'connecting', 'connected', 'disconnected'
    const [lastMessage, setLastMessage] = useState(null);
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    const { token, hostId } = options;

    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        setStatus('connecting');
        console.log(`Attempting WS connection to ${url}`);

        try {
            const ws = new WebSocket(url);
            wsRef.current = ws;

            // Detailed Debugging listener
            ws.addEventListener('error', (event) => {
                console.error('WS Error details (EventListener):');
                // console.error('  - Code:', event.code); 
                // console.error('  - Message:', event.message); 
                // console.error('  - Type:', event.type);
            });

            ws.onopen = () => {
                setStatus('connected');
                console.log('WS Opened');

                // Handshake: Send Auth or Subscribe immediately
                if (token) {
                    console.log('Sending Auth Token');
                    ws.send(JSON.stringify({ type: 'auth', token }));
                } else if (hostId) {
                    console.log(`Sending Subscribe for Host: ${hostId}`);
                    ws.send(JSON.stringify({ type: 'subscribe', hostId }));
                }

                // Clear any reconnect timeout
                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                    reconnectTimeoutRef.current = null;
                }

                // Heartbeat
                const pingInterval = setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ type: 'ping' }));
                    }
                }, 30000);

                ws.onclose = () => clearInterval(pingInterval);
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    setLastMessage(data);
                } catch (e) {
                    console.error('Failed to parse WS message', e);
                }
            };

            ws.onclose = (event) => {
                setStatus('disconnected');
                console.log('WS Closed');
                wsRef.current = null;
                // Attempt reconnect in 5s
                reconnectTimeoutRef.current = setTimeout(connect, 5000);
            };

            ws.onerror = (error) => {
                console.error('WS Error (onerror handler):', error);
            };
        } catch (err) {
            console.error('WS Connection creation failed:', err);
            setStatus('disconnected');
            reconnectTimeoutRef.current = setTimeout(connect, 5000);
        }

    }, [url, token, hostId]);

    const sendMessage = useCallback((message) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
        } else {
            console.warn('WS not connected, cannot send message');
        }
    }, []);

    useEffect(() => {
        connect();
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [connect]);

    return { status, lastMessage, sendMessage };
};

export default useWebSocket;
