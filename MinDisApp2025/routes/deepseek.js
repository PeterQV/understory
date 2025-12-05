const express = require('express');
const router = express.Router();
const chatController = require('../controllers/deepseekcontroller');


// Definer endpoints
router.post('/chat', chatController.handleChat);

module.exports = router;