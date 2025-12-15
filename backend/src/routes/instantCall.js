const express = require('express');
const router = express.Router();
const instantCallController = require('../controllers/instantCallController');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/', authMiddleware, instantCallController.saveSettings);
router.get('/me', authMiddleware, instantCallController.getSettings);
router.patch('/status', authMiddleware, instantCallController.updateStatus);
router.delete('/me', authMiddleware, instantCallController.deleteSettings);
router.get('/:userId', instantCallController.getPublicSettings);


module.exports = router;
