const Profile = require('../models/Profile');
const User = require('../models/User');

exports.getProfile = async (req, res) => {
    try {
        // Current user profile
        let profile = await Profile.findOne({ userId: req.user.userId }).populate('userId', 'name email');
        if (!profile) {
            // Return empty or 404? 
            // Often better to create one or return null. 
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.json(profile);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { title, bio, avatar, timezone, responseTime } = req.body;

        // Upsert profile
        let profile = await Profile.findOne({ userId: req.user.userId });
        if (profile) {
            profile.title = title || profile.title;
            profile.bio = bio || profile.bio;
            profile.avatar = avatar || profile.avatar;
            profile.timezone = timezone || profile.timezone;
            profile.responseTime = responseTime || profile.responseTime;
            await profile.save();
        } else {
            profile = new Profile({
                userId: req.user.userId,
                title, bio, avatar, timezone, responseTime
            });
            await profile.save();
        }

        res.json(profile);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getPublicHostProfile = async (req, res) => {
    try {
        const { hostId } = req.params;
        // hostId might be userId
        const profile = await Profile.findOne({ userId: hostId }).populate('userId', 'name email');
        if (!profile) return res.status(404).json({ message: 'Host not found' });

        // Filter sensitive info if needed
        res.json(profile);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
