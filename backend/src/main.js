require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/database');
const initializeWebSocket = require('./websocket/wsServer');
const corsOptions = require('./config/cors');

// Routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profiles');
const hostRoutes = require('./routes/hosts');
const availabilityRoutes = require('./routes/availability');
const bookingRoutes = require('./routes/bookings');
const requestRoutes = require('./routes/requests');
const instantCallRoutes = require('./routes/instantCall');

const app = express();
const server = http.createServer(app);

// Connect DB
connectDB();

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// WebSocket
console.log('Initializing WebSocket...');
initializeWebSocket(server);

// Routes
app.use('/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/public/hosts', hostRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/instant-call', instantCallRoutes);
app.use('/api/public/instant-call', instantCallRoutes);
app.use('/api/calls', require('./routes/callHistory'));


const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`WebSocket ready on port ${PORT}`);
});
