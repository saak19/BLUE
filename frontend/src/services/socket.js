class SocketService {
    constructor() {
        this.ws = null;
        this.listeners = {};
    }

    connect(token, hostId = null) {
        // Protocol: ws://localhost:8080 or process.env.REACT_APP_WS_URL
        const wsUrl = 'ws://localhost:8080';
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            console.log('WS Connected');
            if (token) {
                this.ws.send(JSON.stringify({ type: 'auth', token }));
            } else if (hostId) {
                this.ws.send(JSON.stringify({ type: 'subscribe', hostId }));
            }
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (this.listeners[data.type]) {
                    this.listeners[data.type].forEach(cb => cb(data));
                }
            } catch (e) {
                console.error('WS Message Error', e);
            }
        };

        this.ws.onclose = () => {
            console.log('WS Disconnected');
            // Reconnect logic could be here
        };
    }

    on(type, callback) {
        if (!this.listeners[type]) {
            this.listeners[type] = [];
        }
        this.listeners[type].push(callback);
    }

    off(type, callback) {
        if (!this.listeners[type]) return;
        this.listeners[type] = this.listeners[type].filter(cb => cb !== callback);
    }

    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}

export const socketService = new SocketService();
