const express = require('express');
const router = express.Router();
const chatController = require('../controllers/deepseekController');

// Definer endpoints
router.post('/chat', chatController.handleChat);

module.exports = router;