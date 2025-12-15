const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validation');
const { requestSchema } = require('../../../shared/schemas');

router.post('/', validate(requestSchema), requestController.createRequest);
router.get('/me', authMiddleware, requestController.getRequestsMe);
router.put('/:id/status', authMiddleware, requestController.updateRequestStatus);

module.exports = router;
