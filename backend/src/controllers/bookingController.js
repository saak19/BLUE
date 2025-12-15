const Booking = require('../models/Booking');

exports.createBooking = async (req, res) => {
    try {
        const { hostId, visitorName, visitorEmail, startTime, endTime } = req.body;

        const booking = new Booking({
            hostId,
            visitorName,
            visitorEmail,
            startTime,
            endTime
        });

        await booking.save();
        res.status(201).json(booking);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getBookingsMe = async (req, res) => {
    try {
        // Return bookings where I am the host
        const bookings = await Booking.find({ hostId: req.user.userId }).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: req.params.id, hostId: req.user.userId });
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        res.json(booking);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findOneAndUpdate(
            { _id: req.params.id, hostId: req.user.userId },
            { status },
            { new: true }
        );
        res.json(booking);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
