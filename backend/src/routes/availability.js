const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availabilityController');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validation');
const { availabilitySchema } = require('../../../shared/schemas');

router.post('/', authMiddleware, validate(availabilitySchema), availabilityController.createAvailability);
router.get('/me', authMiddleware, availabilityController.getAvailabilityMe);
router.delete('/:id', authMiddleware, availabilityController.deleteAvailability);
router.get('/:hostId/slots', availabilityController.getHostSlots);

module.exports = router;
