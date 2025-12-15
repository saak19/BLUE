const mongoose = require('mongoose');
const { BOOKING_STATUS } = require('../../../shared/constants'); // If shared is accessible, else hardcode or symlink. 
// Note: In a real monorepo we'd use workspaces. Here I'll assume relative path from backend/src/models to shared/constants isn't standard require-able without build step or symlink.
// For simplicity in this environment, I will hardcode the status logic or attempt require if I fix path.
// The user structure is parallel: blue/backend, blue/shared. 
// require('../../../shared/constants') -> models/src/backend/blue/../../shared -> backend/shared? No.
// blue/backend/src/models -> ../../../shared = blue/shared. Yes.

// However, Node.js doesn't like requiring files outside root unless constructed carefully.
// I will duplicate constants or use string literals for safety to avoid module resolution errors during initial setup, but try require.

const bookingSchema = new mongoose.Schema({
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    visitorName: { type: String, required: true },
    visitorEmail: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, default: 'pending', enum: ['pending', 'confirmed', 'cancelled', 'completed'] },
    confirmationToken: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
