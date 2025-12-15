const Request = require('../models/Request');

exports.createRequest = async (req, res) => {
    try {
        const { hostId, visitorName, visitorEmail, message } = req.body;

        const request = new Request({
            hostId,
            visitorName,
            visitorEmail,
            message
        });

        await request.save();

        // Here we should trigger WebSocket notification to host!
        // But we need access to 'wss' or broadcast method.
        // For now, assume client polling or sophisticated event bus. 
        // Ideally, we'd import an event emitter or utilize the wss instance if attached to global/app.

        res.status(201).json(request);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getRequestsMe = async (req, res) => {
    try {
        const requests = await Request.find({ hostId: req.user.userId }).sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateRequestStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const request = await Request.findOneAndUpdate(
            { _id: req.params.id, hostId: req.user.userId },
            { status },
            { new: true }
        );
        res.json(request);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
