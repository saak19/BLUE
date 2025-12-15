const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    visitorName: { type: String, required: true },
    visitorEmail: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, default: 'pending', enum: ['pending', 'accepted', 'rejected'] },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', requestSchema);
