const mongoose = require('mongoose');

const callHistorySchema = new mongoose.Schema({
    callId: { type: String, required: true, unique: true },
    participants: {
        caller: { type: String, required: true }, // Visitor Name or Host User ID
        callee: { type: String, required: true }  // Host User ID or Visitor Name
    },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    duration: { type: Number }, // in seconds
    status: { type: String, enum: ['completed', 'missed', 'rejected', 'failed'], default: 'completed' },
    visitorEmail: { type: String }, // Optional, if captured
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // The host account associated
}, { timestamps: true });

module.exports = mongoose.model('CallHistory', callHistorySchema);
