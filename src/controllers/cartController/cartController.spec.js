const cartController = require('./cartController');
const persistenceService = require('../../services/persistenceService/persist');

jest.mock('../../services/persistenceService/persist', () => ({
    addToCart: jest.fn(),
    removeFromCart: jest.fn(),
    getCart: jest.fn(),
    checkout: jest.fn(),
    logActivity: jest.fn(),
    getUsernameById: jest.fn(),
    processCheckout: jest.fn(),
    clearCart: jest.fn(),
}));

describe('Cart Controller', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            body: {},
            params: {}
        };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };
    });

    test('addToCart - successful addition', async () => {
        req.body = { userId: 'user1', productId: 'product1', quantity: 2 };
        persistenceService.addToCart.mockResolvedValue([{ productId: 'product1', quantity: 2 }]);
        persistenceService.getUsernameById.mockResolvedValue('testKatherine');

        await cartController.addToCart(req, res);

        expect(persistenceService.addToCart).toHaveBeenCalledWith('user1', 'product1', 2);
        expect(persistenceService.logActivity).toHaveBeenCalledWith('testKatherine', 'add-to-cart');
        expect(res.json).toHaveBeenCalledWith([{ productId: 'product1', quantity: 2 }]);
    });

    test('addToCart - missing fields', async () => {
        req.body = { userId: 'user1' };

        await cartController.addToCart(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Missing required fields' });
    });

    test('removeFromCart - successful removal', async () => {
        req.body = { userId: 'user1', productId: 'product1' };
        persistenceService.removeFromCart.mockResolvedValue([]);

        await cartController.removeFromCart(req, res);

        expect(persistenceService.removeFromCart).toHaveBeenCalledWith('user1', 'product1');
        expect(res.json).toHaveBeenCalledWith([]);
    });

    test('removeFromCart - missing fields', async () => {
        req.body = { userId: 'user1' };

        await cartController.removeFromCart(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Missing required fields' });
    });

    test('getCart - successful retrieval', async () => {
        req.params = { userId: 'user1' };
        persistenceService.getCart.mockResolvedValue([{ productId: 'product1', quantity: 2 }]);

        await cartController.getCart(req, res);

        expect(persistenceService.getCart).toHaveBeenCalledWith('user1');
        expect(res.json).toHaveBeenCalledWith([{ productId: 'product1', quantity: 2 }]);
    });

    test('getCart - error handling', async () => {
        req.params = { userId: 'user1' };
        persistenceService.getCart.mockRejectedValue(new Error('Database error'));

        await cartController.getCart(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching cart', error: 'Database error' });
    });

    test('checkout - successful checkout', async () => {
        req.body = { userId: 'user1' };
        persistenceService.getUsernameById.mockResolvedValue('testKatherine');
        persistenceService.getCart.mockResolvedValue([
            { productId: 'product1', quantity: 2 },
            { productId: 'product2', quantity: 1 }
        ]);
        persistenceService.processCheckout.mockResolvedValue({
            success: true,
            purchases: [
                { productId: 'product1', quantity: 2 },
                { productId: 'product2', quantity: 1 }
            ]
        });
        persistenceService.clearCart.mockResolvedValue();
        
        await cartController.checkout(req, res);
        
        expect(persistenceService.getUsernameById).toHaveBeenCalledWith('user1');
        expect(persistenceService.getCart).toHaveBeenCalledWith('user1');
        expect(persistenceService.processCheckout).toHaveBeenCalledWith('testKatherine', [
            { productId: 'product1', quantity: 2 },
            { productId: 'product2', quantity: 1 }
        ]);
        expect(persistenceService.clearCart).toHaveBeenCalledWith('user1');
        expect(persistenceService.logActivity).toHaveBeenCalledWith('testKatherine', 'checkout');
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            purchases: [
                { productId: 'product1', quantity: 2 },
                { productId: 'product2', quantity: 1 }
            ]
        });
    });
    
});
