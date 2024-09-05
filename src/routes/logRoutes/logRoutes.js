const express = require('express');
const router = express.Router();
const logController = require('../../controllers/logController/logController');

router.post('/send', logController.log);

module.exports = router;