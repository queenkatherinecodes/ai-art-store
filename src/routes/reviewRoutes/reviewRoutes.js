const express = require('express');
const router = express.Router();
const reviewController = require('../../controllers/reviewController/reviewController');

router.get('/review', reviewController.getReview);

module.exports = router;