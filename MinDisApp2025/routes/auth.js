const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); 

// Definer endpoints
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);
router.get('/user', authController.getCurrentUser);

module.exports = router;