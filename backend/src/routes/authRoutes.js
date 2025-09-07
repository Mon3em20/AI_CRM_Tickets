const express = require('express');
const authController = require('../controllers/authController');
const authentication = require('../middleware/authentication');
const router = express.Router();


// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Protected routes
router.get('/me', authentication, authController.me);
router.put('/me', authentication, authController.updateProfile);

module.exports = router;
