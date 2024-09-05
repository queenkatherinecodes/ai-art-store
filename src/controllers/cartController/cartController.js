const persistenceService = require('../../services/persistenceService/persist');

exports.addToCart = async (req, res) => {
    const { userId, productId, quantity } = req.body;
    try {
        if (!userId || !productId || !quantity) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const updatedCart = await persistenceService.addToCart(userId, productId, quantity);
        const username = await persistenceService.getUsernameById(userId);
        await persistenceService.logActivity(username, 'add-to-cart');
        res.json(updatedCart);
    } catch (error) {
        res.status(500).json({ message: 'Error adding item to cart', error: error.message });
    }
};

exports.removeFromCart = async (req, res) => {
    const { userId, productId } = req.body;
    try {
        if (!userId || !productId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const updatedCart = await persistenceService.removeFromCart(userId, productId);
        const username = await persistenceService.getUsernameById(userId);
        await persistenceService.logActivity(username, 'remove-from-cart');
        res.json(updatedCart);
    } catch (error) {
        res.status(500).json({ message: 'Error removing item from cart', error: error.message });
    }
};

exports.getCart = async (req, res) => {
    const { userId } = req.params;
    try {
        const cart = await persistenceService.getCart(userId);
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cart', error: error.message });
    }
};

exports.checkout = async (req, res) => {
    const { userId } = req.body;
    try {
        if (!userId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const username = await persistenceService.getUsernameById(userId);
        const cart = await persistenceService.getCart(userId);
        // If the cart is empty, return an error
        if (!cart || cart.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }
        // Process the checkout (save the purchase)
        const purchase = await persistenceService.processCheckout(username, cart);
        // Clear the user's cart after successful checkout
        await persistenceService.clearCart(userId);
        await persistenceService.logActivity(username, 'checkout');
        // Return the purchase details
        res.json(purchase);
    } catch (error) {
        res.status(500).json({ message: 'Error during checkout', error: error.message });
    }
};

module.exports = exports;