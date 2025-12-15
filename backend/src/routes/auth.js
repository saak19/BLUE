const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middleware/validation');
const { signupSchema, loginSchema } = require('../../../shared/schemas');
// Assuming symlink or simple relative if shared is copied/available. 
// If generic object approach:
// const { signupSchema, loginSchema } = require('../schemas'); 
// BUT, I wrote shared/schemas.js to use Joi. 
// I need safely import them. 
// I will attempt `require('../../../shared/schemas')` as I am confident path is reachable in file system.

router.post('/signup', validate(signupSchema), authController.signup);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', require('../middleware/auth.middleware'), authController.getMe);

module.exports = router;
