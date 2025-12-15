const mongoose = require('mongoose');

const hostPresenceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    status: { type: String, default: 'offline', enum: ['online', 'offline'] },
    lastActiveTime: { type: Date, default: Date.now },
    wsConnectionId: { type: String }
});

module.exports = mongoose.model('HostPresence', hostPresenceSchema);
