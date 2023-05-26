const express = require('express');
const router = express.Router();

const userController = require('../controllers/user');

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.use('/forgotpassword', userController.forgotPswd);
router.get('/resetpassword/:id', userController.resetPswd);
router.get('/updatepassword/:updateId', userController.updatepassword);

module.exports = router;