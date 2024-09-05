const { getReview } = require('./reviewController');
const reviewGenerationService = require('../../services/reviewGenerationService/reviewGenerationService');

// Mock the reviewGenerationService
jest.mock('../../services/reviewGenerationService/reviewGenerationService');

describe('Review Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {};
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return a generated review when successful', async () => {
        // Arrange
        const mockReview = { text: 'This is a great product!', rating: 5 };
        reviewGenerationService.generateReview.mockResolvedValue(mockReview);

        // Act
        await getReview(req, res);

        // Assert
        expect(reviewGenerationService.generateReview).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith(mockReview);
    });

    it('should handle errors and return a 500 status', async () => {
        // Arrange
        const mockError = new Error('Failed to generate review');
        reviewGenerationService.generateReview.mockRejectedValue(mockError);

        // Act
        await getReview(req, res);

        // Assert
        expect(reviewGenerationService.generateReview).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Failed to generate review' });
    });
});