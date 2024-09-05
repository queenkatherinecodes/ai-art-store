const persistenceService = require('../../services/persistenceService/persist');
const imageGenerationService = require('../../services/imageGenerationService/imageGenerationService');

exports.getAllProducts = async (req, res) => {
    try {
        const products = await persistenceService.getAllProducts();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
};

exports.searchProducts = async (req, res) => {
    const { query } = req.query;
    try {
        const products = await persistenceService.searchProducts(query);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error searching products', error: error.message });
    }
};

exports.getProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await persistenceService.getProduct(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error: error.message });
    }
};

exports.createProduct = async (req, res) => {
    const { prompt } = req.body;
    try {
        const result = await imageGenerationService.generateImage(prompt);
        res.status(201).json(result.product);
    } catch (error) {
        if (error.message.includes('A product with this name already exists')) {
            res.status(409).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Error creating product', error: error.message });
        }
    }
};

exports.deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        await persistenceService.deleteProduct(id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
};

module.exports = exports;