const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validation');
const { bookingSchema } = require('../../../shared/schemas');

router.post('/', validate(bookingSchema), bookingController.createBooking); // Public? Or visitor protected? Usually public or visitor token.
router.get('/me', authMiddleware, bookingController.getBookingsMe);
router.get('/:id', authMiddleware, bookingController.getBookingById);
router.put('/:id/status', authMiddleware, bookingController.updateBookingStatus);

module.exports = router;
