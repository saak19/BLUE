const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validation');
const { profileSchema } = require('../../../shared/schemas');

// Private routes
router.get('/me', authMiddleware, profileController.getProfile);
router.post('/me', authMiddleware, validate(profileSchema), profileController.updateProfile);
router.put('/me', authMiddleware, validate(profileSchema), profileController.updateProfile);

module.exports = router;
