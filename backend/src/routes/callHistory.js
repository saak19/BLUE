const express = require('express');
const router = express.Router();
const callHistoryController = require('../controllers/callHistoryController');
const authMiddleware = require('../middleware/auth.middleware');

// Public route to log calls (visitors can trigger this on end, or host)
// Ideally secured, but for now open or handled by host only?
// If visitor ends call, they need to log it. 
// We'll trust the input for now, or ensure only authenticated host can log history?
// Better: Log calls via WebSocket events on the server side to be secure?
// For this task, user asked for POST endpoint. Let's make it open but require hostId.
router.post('/log', callHistoryController.logCall);

// Protected route for dashboard
router.get('/', authMiddleware, callHistoryController.getHistory);

module.exports = router;
