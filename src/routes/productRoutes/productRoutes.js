const express = require('express');
const router = express.Router();
const productController = require('../../controllers/productController/productController');

router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/:id', productController.getProduct);
router.post('/', productController.createProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;