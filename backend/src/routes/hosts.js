const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

// Public route to fetch host profile
router.get('/:hostId', profileController.getPublicHostProfile);

module.exports = router;
