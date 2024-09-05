const productController = require('./productController');
const persistenceService = require('../../services/persistenceService/persist');
const imageGenerationService = require('../../services/imageGenerationService/imageGenerationService');

jest.mock('../../services/persistenceService/persist');
jest.mock('../../services/imageGenerationService/imageGenerationService');

describe('Product Controller', () => {
    let mockRequest;
    let mockResponse;
    let mockNext;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            json: jest.fn(),
            status: jest.fn(() => mockResponse),
            send: jest.fn(),
        };
        mockNext = jest.fn();
    });

    describe('getAllProducts', () => {
        it('should return all products', async () => {
            // Arrange
            const mockProducts = [{ id: '1', title: 'Product 1' }, { id: '2', title: 'Product 2' }];
            persistenceService.getAllProducts.mockResolvedValue(mockProducts);

            // Act
            await productController.getAllProducts(mockRequest, mockResponse);

            // Assert
            expect(persistenceService.getAllProducts).toHaveBeenCalled();
            expect(mockResponse.json).toHaveBeenCalledWith(mockProducts);
        });

        it('should handle errors', async () => {
            // Arrange
            const error = new Error('really concerning error');
            persistenceService.getAllProducts.mockRejectedValue(error);

            // Act
            await productController.getAllProducts(mockRequest, mockResponse);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error fetching products',
                error: error.message
            });
        });
    });

    describe('searchProducts', () => {
        it('should return searched products', async () => {
            // Arrange
            const mockProducts = [{ id: '1', title: 'Matching Product' }];
            mockRequest.query = { query: 'match' };
            persistenceService.searchProducts.mockResolvedValue(mockProducts);

            // Act
            await productController.searchProducts(mockRequest, mockResponse);

            // Assert
            expect(persistenceService.searchProducts).toHaveBeenCalledWith('match');
            expect(mockResponse.json).toHaveBeenCalledWith(mockProducts);
        });

        it('should handle errors', async () => {
            // Arrange
            const error = new Error('Search error');
            mockRequest.query = { query: 'match' };
            persistenceService.searchProducts.mockRejectedValue(error);

            // Act
            await productController.searchProducts(mockRequest, mockResponse);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error searching products',
                error: error.message
            });
        });
    });

    describe('getProduct', () => {
        it('should return a specific product', async () => {
            // Arrange
            const mockProduct = { id: '1', title: 'Product 1' };
            mockRequest.params = { id: '1' };
            persistenceService.getProduct.mockResolvedValue(mockProduct);

            // Act
            await productController.getProduct(mockRequest, mockResponse);

            // Assert
            expect(persistenceService.getProduct).toHaveBeenCalledWith('1');
            expect(mockResponse.json).toHaveBeenCalledWith(mockProduct);
        });

        it('should return 404 if product not found', async () => {
            // Arrange
            mockRequest.params = { id: '999' };
            persistenceService.getProduct.mockResolvedValue(null);

            // Act
            await productController.getProduct(mockRequest, mockResponse);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Product not found' });
        });

        it('should handle errors', async () => {
            // Arrange
            const error = new Error('Fetch error');
            mockRequest.params = { id: '1' };
            persistenceService.getProduct.mockRejectedValue(error);

            // Act
            await productController.getProduct(mockRequest, mockResponse);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error fetching product',
                error: error.message
            });
        });
    });

    describe('createProduct', () => {
        it('should create a new product', async () => {
            // Arrange
            const mockProduct = { id: '1', title: 'New Product' };
            mockRequest.body = { prompt: 'new product' };
            imageGenerationService.generateImage.mockResolvedValue({ product: mockProduct });

            // Act
            await productController.createProduct(mockRequest, mockResponse);

            // Assert
            expect(imageGenerationService.generateImage).toHaveBeenCalledWith('new product');
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(mockProduct);
        });

        it('should handle duplicate product error', async () => {
            // Arrange
            const error = new Error('A product with this name already exists');
            mockRequest.body = { prompt: 'existing product' };
            imageGenerationService.generateImage.mockRejectedValue(error);

            // Act
            await productController.createProduct(mockRequest, mockResponse);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(409);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: error.message });
        });

        it('should handle other errors', async () => {
            // Arrange
            const error = new Error('Creation error');
            mockRequest.body = { prompt: 'new product' };
            imageGenerationService.generateImage.mockRejectedValue(error);

            // Act
            await productController.createProduct(mockRequest, mockResponse);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error creating product',
                error: error.message
            });
        });
    });

    describe('deleteProduct', () => {
        it('should delete a product', async () => {
            // Arrange
            mockRequest.params = { id: '1' };
            persistenceService.deleteProduct.mockResolvedValue();

            // Act
            await productController.deleteProduct(mockRequest, mockResponse);

            // Assert
            expect(persistenceService.deleteProduct).toHaveBeenCalledWith('1');
            expect(mockResponse.status).toHaveBeenCalledWith(204);
            expect(mockResponse.send).toHaveBeenCalled();
        });

        it('should handle errors', async () => {
            // Arrange
            const error = new Error('Deletion error');
            mockRequest.params = { id: '1' };
            persistenceService.deleteProduct.mockRejectedValue(error);

            // Act
            await productController.deleteProduct(mockRequest, mockResponse);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error deleting product',
                error: error.message
            });
        });
    });
});