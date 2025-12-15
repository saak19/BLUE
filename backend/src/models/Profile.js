const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    title: { type: String, default: '' },
    bio: { type: String, default: '' },
    avatar: { type: String, default: '' },
    timezone: { type: String, default: 'UTC' },
    responseTime: { type: String, default: 'Within 24 hours' }
});

module.exports = mongoose.model('Profile', profileSchema);
