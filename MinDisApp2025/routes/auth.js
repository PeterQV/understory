// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); 

// Definer endpoints
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);
router.get('/user', authController.getCurrentUser);

// Debug routes (valgfrie)
router.get('/debug/users', authController.getAllUsers);
router.post('/hash-passwords', authController.hashAllPasswords);

module.exports = router;