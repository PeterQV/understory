// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); 
const requireAuth = require('../middleware/middleware');  // middlware oprettet

// Definer endpoints
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);
router.get('/user', authController.getCurrentUser);


router.get('/users',requireAuth, authController.getAllUsers); // middlware oprettet
router.post('/hash-passwords', authController.hashAllPasswords);

module.exports = router;