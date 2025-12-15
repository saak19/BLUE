const CallHistory = require('../models/CallHistory');

exports.logCall = async (req, res) => {
    try {
        const { callId, participants, startTime, endTime, status, hostId } = req.body;

        const duration = endTime ? (new Date(endTime) - new Date(startTime)) / 1000 : 0;

        const newCall = new CallHistory({
            callId,
            participants,
            startTime,
            endTime,
            duration,
            status,
            hostId
        });

        await newCall.save();
        res.status(201).json({ message: 'Call logged successfully', call: newCall });
    } catch (error) {
        console.error('Error logging call:', error);
        res.status(500).json({ message: 'Failed to log call' });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const userId = req.user.userId;
        // Fetch calls where the user is the host
        const history = await CallHistory.find({ hostId: userId }).sort({ createdAt: -1 }).limit(50);
        res.status(200).json(history);
    } catch (error) {
        console.error('Error fetching call history:', error);
        res.status(500).json({ message: 'Failed to fetch history' });
    }
};
