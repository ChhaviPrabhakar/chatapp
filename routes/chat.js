const express = require('express');
const router = express.Router();

const chatController = require('../controllers/chat');
const userAuth = require('../middleware/auth');

router.post('/message', userAuth.authenticate, chatController.message);
router.get('/get-chat', userAuth.authenticate, chatController.getChat);

module.exports = router;