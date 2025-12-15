const InstantCall = require('../models/InstantCall');
const HostPresence = require('../models/HostPresence');

exports.saveSettings = async (req, res) => {
    try {
        console.log('Save Settings Request Received');
        // console.log('User:', req.user);

        const { name, bio, status, profileImage, settings } = req.body;

        // Sanity check
        if (!req.user || !req.user.userId) {
            console.error('User not authenticated properly in controller');
            return res.status(401).json({ message: 'User ID missing' });
        }

        const userId = req.user.userId;
        console.log(`Processing settings for user: ${userId}`);

        let instantCall = await InstantCall.findOne({ userId });

        if (instantCall) {
            console.log('Updating existing settings');
            instantCall.name = name;
            instantCall.bio = bio;
            instantCall.status = status;
            if (profileImage) instantCall.profileImage = profileImage;
            instantCall.settings = settings;
            await instantCall.save();
        } else {
            console.log('Creating new settings');
            instantCall = new InstantCall({
                userId,
                name,
                bio,
                status,
                profileImage,
                settings
            });
            await instantCall.save();
        }

        // Fix: Also ensure HostPresence exists so WebSocket can find it
        console.log('Ensuring HostPresence record exists...');
        await HostPresence.findOneAndUpdate(
            { userId },
            { status: 'offline' },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        console.log('Settings saved successfully');
        res.status(200).json({ message: 'Configuration saved successfully', data: instantCall });
    } catch (error) {
        console.error('SERVER ERROR in saveSettings:', error);
        res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
    }
};

exports.getSettings = async (req, res) => {
    try {
        const userId = req.user.userId;
        const instantCall = await InstantCall.findOne({ userId });

        if (!instantCall) {
            return res.status(404).json({ message: 'Settings not found' });
        }

        res.status(200).json(instantCall);
    } catch (error) {
        console.error('Error fetching instant call settings:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const userId = req.user.userId;

        if (!['online', 'offline', 'busy'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const instantCall = await InstantCall.findOneAndUpdate(
            { userId },
            { status },
            { new: true }
        );

        if (!instantCall) {
            return res.status(404).json({ message: 'Configuration not found' });
        }

        res.status(200).json({ message: 'Status updated', data: instantCall });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteSettings = async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await InstantCall.findOneAndDelete({ userId });

        if (!result) {
            return res.status(404).json({ message: 'Configuration not found' });
        }

        res.status(200).json({ message: 'Configuration deleted successfully' });
    } catch (error) {
        console.error('Error deleting configuration:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getPublicSettings = async (req, res) => {
    try {
        const { userId } = req.params;
        const instantCall = await InstantCall.findOne({ userId });

        if (!instantCall) {
            return res.status(404).json({ message: 'Instant Call configuration not found' });
        }

        res.status(200).json(instantCall);
    } catch (error) {
        console.error('Error fetching public settings:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

