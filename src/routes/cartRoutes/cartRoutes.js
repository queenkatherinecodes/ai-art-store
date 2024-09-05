const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/cartController/cartController');

router.post('/add', cartController.addToCart);
router.post('/remove', cartController.removeFromCart);
router.post('/checkout', cartController.checkout);
router.get('/:userId', cartController.getCart);

module.exports = router;