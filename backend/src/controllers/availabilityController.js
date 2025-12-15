const Availability = require('../models/Availability');

exports.createAvailability = async (req, res) => {
    try {
        const { dayOfWeek, startTime, endTime } = req.body;

        // Check if slot overlaps/exists? Simplification: Just add.
        const availability = new Availability({
            userId: req.user.userId,
            dayOfWeek,
            startTime,
            endTime
        });

        await availability.save();
        res.status(201).json(availability);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAvailabilityMe = async (req, res) => {
    try {
        const availability = await Availability.find({ userId: req.user.userId });
        res.json(availability);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        await Availability.findOneAndDelete({ _id: id, userId: req.user.userId });
        res.json({ message: 'Availability deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getHostSlots = async (req, res) => {
    try {
        const { hostId } = req.params;
        const availability = await Availability.find({ userId: hostId });
        res.json(availability);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
