const { log } = require('./logController');
const persistenceService = require('../../services/persistenceService/persist');

// Mock the persistenceService
jest.mock('../../services/persistenceService/persist');

describe('Log Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 if user is missing', async () => {
        // Arrange
        req.body = { activity: 'test activity' };

        // Act
        await log(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'User and activity are required.' });
    });

    it('should return 400 if activity is missing', async () => {
        // Arrange
        req.body = { user: 'testuser' };

        // Act
        await log(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'User and activity are required.' });
    });

    it('should return 200 and success message if logging is successful', async () => {
        // Arrange
        req.body = { user: 'testuser', activity: 'test activity' };
        persistenceService.logActivity.mockResolvedValue(true);
        
        // Act
        await log(req, res);

        // Assert
        expect(persistenceService.logActivity).toHaveBeenCalledWith('testuser', 'test activity');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'Success logging activity' });
    });

    it('should handle case when logActivity returns falsy value', async () => {
        // Arrange
        req.body = { user: 'testuser', activity: 'test activity' };
        persistenceService.logActivity.mockResolvedValue(false);

        // Act
        await log(req, res);

        // Assert
        expect(persistenceService.logActivity).toHaveBeenCalledWith('testuser', 'test activity');
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });
});