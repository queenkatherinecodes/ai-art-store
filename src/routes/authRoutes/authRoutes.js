const express = require('express');
const router = express.Router();
const authController = require('../../controllers/authController/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/authenticate', authController.authenticate);
router.get('/authenticate/admin', authController.authenticateAdmin);

module.exports = router;