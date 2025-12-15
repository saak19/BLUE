const mongoose = require('mongoose');

const instantCallSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    name: { type: String, required: true },
    bio: String,
    status: {
        type: String,
        enum: ['online', 'busy', 'offline'],
        default: 'online'
    },
    profileImage: String, // Base64 string
    settings: {
        textColor: String,
        backgroundColor: String,
        buttonColor: String,
        buttonTextColor: String
    }
}, { timestamps: true });

module.exports = mongoose.model('InstantCall', instantCallSchema);
