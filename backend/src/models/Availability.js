const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dayOfWeek: { type: String, required: true, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
    startTime: { type: String, required: true }, // Format HH:mm
    endTime: { type: String, required: true },   // Format HH:mm
    isAvailable: { type: Boolean, default: true }
});

// Compound index to prevent duplicate slots for same day/user if needed, but simple list is fine for now
module.exports = mongoose.model('Availability', availabilitySchema);
