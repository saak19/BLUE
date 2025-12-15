🔵 Blue - Real-Time Presence & Communication Platform
A modern, full-stack platform that enables hosts to create customizable instant call cards, embed them on any website, and connect with visitors in real-time through calls, messages, and appointment bookings. Similar to Cal.com and Calendly, but with live presence indicators and instant calling capabilities.
🌟 Key Features

Instant Call Cards - Create beautiful, customizable profile cards with live online/offline status
Real-Time Presence - WebSocket-based live status updates (Online, Offline, Busy)
Embed Anywhere - Generate shareable embed codes to place your card on any website
WebRTC Audio Calls - Direct peer-to-peer audio calling with microphone access
Connection Requests - Visitors can send connection requests or messages to hosts
Appointment Booking - Integrated scheduling system for bookings
Call History - Track all incoming/outgoing calls with duration and timestamps
Responsive Design - Mobile-friendly interface with Tailwind CSS

📋 Three Core Features for Visitors
When visiting a host's embedded call card, visitors can:

📞 Call Now - Initiate an instant audio call
✉️ Send Request - Send a connection request or message
📅 Book Appointment - Schedule a call for later (coming soon)

🏗️ Architecture
Tech Stack
Backend:

Node.js + Express
MongoDB with Mongoose
WebSocket (ws) for real-time communication
JWT for authentication
WebRTC signaling via WebSocket

Frontend:

React 18 with Hooks
React Router for navigation
Tailwind CSS for styling
Axios for API calls
Lucide React for icons

Embed System:

Vanilla JavaScript (no dependencies)
Lightweight (< 50KB)
Works on any website

📁 Project Structure
blue/
├── backend/                 # Node.js/Express API server
│   ├── src/
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API endpoints
│   │   ├── websocket/      # WebSocket server & signaling
│   │   ├── middleware/     # Auth & validation
│   │   ├── controllers/    # Business logic
│   │   └── config/         # Database, JWT, CORS
│   ├── .env.example
│   └── package.json
│
├── frontend/                # React dashboard
│   ├── src/
│   │   ├── pages/          # Main pages (Dashboard, InstantCall, etc.)
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom hooks (useWebSocket, useWebRTC, useAuth)
│   │   ├── services/       # API & authentication services
│   │   ├── styles/         # Global CSS
│   │   └── App.jsx         # Route configuration
│   ├── .env.example
│   └── package.json
│
├── embed/                   # Embed widget for external websites
│   ├── embed.js            # Main embed script
│   ├── embed-widget.html   # Card template
│   ├── embed-styles.css    # Card styling
│   └── package.json
│
└── shared/                  # Shared utilities
    ├── utils.js
    ├── constants.js
    └── schemas.js
🚀 Getting Started
Prerequisites

Node.js v16+ and npm
MongoDB (local or Atlas)
Git

Backend Setup
bashcd blue/backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials:
# DATABASE_URL=mongodb://localhost:27017/blue
# JWT_SECRET=your_secret_key_here
# PORT=3001
# WS_PORT=8080
# CORS_ORIGIN=http://localhost:5173

# Start backend server
npm run dev
Backend runs on:

REST API: http://localhost:3001
WebSocket: ws://localhost:3001
MongoDB: mongodb://localhost:27017/blue

Frontend Setup
bashcd blue/frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env:
# VITE_API_URL=http://localhost:3001
# VITE_WS_URL=ws://localhost:3001

# Start dev server
npm run dev
Frontend runs on: http://localhost:5173
Embed System
bashcd blue/embed

# Serve embed files (for testing)
# Users can embed the card by including:
# <script src="http://localhost/embed.js"></script>
📚 API Documentation
Core Endpoints
Authentication:

POST /auth/signup - Create new account
POST /auth/login - User login
POST /auth/refresh - Refresh JWT token

Profiles:

GET /api/profiles/me - Get logged-in user's profile
POST /api/profiles/me - Create/update profile
GET /api/public/hosts/:userId - Get public host profile (no auth)

Instant Call:

POST /api/instant-call - Save call card configuration
GET /api/instant-call/me - Get current user's call card
GET /api/public/instant-call/:userId - Get public call card

Availability:

GET /api/availability/me - Get user's availability
POST /api/availability - Add time slot
GET /api/availability/:hostId/slots - Get host's available slots

Bookings:

POST /api/bookings - Create booking
GET /api/bookings/me - Get user's bookings
PUT /api/bookings/:id/status - Update booking status

Requests:

POST /api/requests - Send connection request
GET /api/requests/me - Get incoming requests
PUT /api/requests/:id/status - Accept/reject request

🔌 WebSocket Protocol
Message Types:
javascript// Host Authentication
{ type: 'auth', token: 'jwt_token' }

// Visitor Subscription
{ type: 'subscribe', hostId: 'host_user_id' }

// Status Updates
{ type: 'status_update', status: 'online|offline|busy' }

// Call Signaling
{ type: 'call-request', hostId, visitorName, visitorEmail }
{ type: 'incoming-call', visitor, callId }
{ type: 'call-accepted', callId }
{ type: 'call-declined', callId }
{ type: 'call-end', callId }

// WebRTC Signaling
{ type: 'webrtc-offer', offer }
{ type: 'webrtc-answer', answer }
{ type: 'ice-candidate', candidate }

// Heartbeat
{ type: 'ping' }
🔐 Authentication
Blue uses JWT (JSON Web Tokens) for authentication:

User signs up/logs in
Backend returns JWT token (expires in 7 days)
Frontend stores token in localStorage
All API requests include Authorization: Bearer <token> header
Token auto-refreshes via POST /auth/refresh

🎨 Customization
Hosts can customize their call card:

Display Name - Profile name
Bio - Short description
Status - Online/Offline/Busy
Profile Image - Avatar (uploaded as base64)
Text Color - Custom text color
Background Color - Card background
Button Color - "Call Now" button color
Button Text Color - Button text color

All styling is saved to MongoDB and synced in real-time.
📞 How It Works: Call Flow

Host Configuration

Host signs up → Creates profile → Configures instant call card
Copies embed code and shares it on their website


Visitor Initiates Call

Visitor sees card on host's website with live status
Clicks "Call Now" button
Enters their name
WebSocket sends call-request to backend


Host Receives Notification

Host's dashboard shows incoming call notification
Ringing sound plays
Host can Answer or Decline


Audio Call Establishes

WebRTC peer connection initiated
SDP offer/answer exchanged via WebSocket
ICE candidates gathered
Audio streams connected
Both can talk in real-time


Call Ends

Either party clicks "End Call"
Connection closed gracefully
Call logged with duration and timestamp



🧪 Testing
Test Account
For quick testing, create accounts with:

Email: test@example.com
Password: password123

Testing Calls Locally

Open two browser windows:

Window 1 (Host): http://localhost:5173/dashboard
Window 2 (Visitor): http://localhost:5173/call/host-user-id


Host configures instant call card on dashboard
Visitor clicks "Call Now" on the card
Host receives incoming call notification
Host clicks "Answer" to establish audio call

🐛 Troubleshooting
WebSocket Connection Failed:

Verify backend is running: npm run dev in backend folder
Check port 3001 is not in use: netstat -ano | findstr :3001
Verify VITE_WS_URL in frontend .env is correct

Microphone Access Denied:

Grant microphone permission when browser prompts
Check browser settings → Privacy → allow microphone access

MongoDB Connection Error:

Ensure MongoDB is running: mongod command
Check DATABASE_URL in .env is correct
Verify username/password if using Atlas

API 404 Errors:

Verify API endpoint path is correct
Check backend routes are imported in main.js
Restart backend after route changes

📦 Deployment
Backend (Production)
bash# Build/prepare
npm install --production

# Start with PM2 or Node
node src/main.js

# Environment variables
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/blue
JWT_SECRET=secure_random_string
PORT=3001
CORS_ORIGIN=https://yourdomain.com
Frontend (Production)
bash# Build
npm run build

# Output in dist/ folder
# Deploy to Vercel, Netlify, or any static host

# Update .env for production
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com
Embed (CDN)
Host embed.js on a CDN (CloudFront, Cloudflare, etc.):
html<script src="https://cdn.yourdomain.com/embed.js"></script>
📈 Roadmap

 Video calls (WebRTC video)
 Screen sharing
 Call recording
 Automated call transcription
 SMS/Email notifications
 Advanced analytics
 Team/organization support
 Custom branding for embeds
 API rate limiting & quotas
 Mobile app (React Native)

🤝 Contributing

Clone repository: git clone https://github.com/saak19/BLUE.git
Create feature branch: git checkout -b feature/amazing-feature
Commit changes: git commit -m 'Add amazing feature'
Push to branch: git push origin feature/amazing-feature
Open Pull Request

📝 License
This project is licensed under the MIT License - see LICENSE file for details.
💬 Support
For issues, questions, or suggestions:

Open a GitHub issue: https://github.com/saak19/BLUE/issues
Email: support@blue.local

🙏 Acknowledgments

React & Vue communities
Tailwind CSS for styling
WebRTC for peer-to-peer communication
MongoDB for database
All open-source contributors


Made with ❤️ by the Blue Team
Current Version: 1.0.0-beta
Last Updated: December 2025
