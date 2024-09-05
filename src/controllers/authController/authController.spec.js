const authController = require('./authController');
const persistenceService = require('../../services/persistenceService/persist');

jest.mock('../../services/persistenceService/persist', () => ({
    getUser: jest.fn(),
    createUser: jest.fn(),
    logActivity: jest.fn(),
}));

jest.mock('fs', () => ({
    promises: {
        readFile: jest.fn(),
        writeFile: jest.fn(),
        mkdir: jest.fn(),
    },
}));

describe('Auth Controller', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            body: {},
            cookies: {}
        };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
            cookie: jest.fn(),
            clearCookie: jest.fn()
        };
    });

    test('register', async () => {
        // Arrange
        req.body = { username: 'newuser', password: 'password123' };
        persistenceService.getUser.mockResolvedValue(null);
        persistenceService.createUser.mockResolvedValue({ id: 'newuser123', username: 'newuser' });

        // Act
        await authController.register(req, res);

        // Assert
        expect(persistenceService.getUser).toHaveBeenCalledWith('newuser');
        expect(persistenceService.createUser).toHaveBeenCalledWith('newuser', 'password123');
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
            message: 'User registered successfully',
            userId: 'newuser123'
        }));
    });

    test('login', async () => {
        // Arrange
        req.body = { username: 'admin', password: 'admin', rememberMe: false };
        persistenceService.getUser.mockResolvedValue({ id: 'admin', username: 'admin', password: 'admin' });
        persistenceService.logActivity.mockResolvedValue();

        // Act
        await authController.login(req, res);

        // Assert
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ "id": "admin" }));
        expect(res.cookie).toHaveBeenCalled();
        expect(persistenceService.logActivity).toHaveBeenCalled();
    });

    test('logout', async () => {
        // Arrange
        req.cookies.user = JSON.stringify({ id: 'admin', username: 'admin' });
        persistenceService.logActivity.mockResolvedValue();

        // Act
        await authController.logout(req, res);

        // Assert
        expect(res.clearCookie).toHaveBeenCalledWith('user');
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Logged out successfully' }));
        expect(persistenceService.logActivity).toHaveBeenCalled();
    });

    describe('authenticate', () => {
        test('should return authenticated true for valid user', async () => {
            // Arrange
            req.cookies.user = JSON.stringify({ id: 'user123', username: 'testuser' });
            persistenceService.getUser.mockResolvedValue({ id: 'user123', username: 'testuser' });

            // Act
            await authController.authenticate(req, res);

            // Assert
            expect(res.json).toHaveBeenCalledWith({
                authenticated: true,
                user: { id: 'user123', username: 'testuser' }
            });
        });

        test('should return authenticated false for invalid user', async () => {
            // Arrange
            req.cookies.user = JSON.stringify({ id: 'user123', username: 'testuser' });
            persistenceService.getUser.mockResolvedValue(null);

            // Act
            await authController.authenticate(req, res);

            // Assert
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                authenticated: false,
                message: 'Invalid session'
            });
            expect(res.clearCookie).toHaveBeenCalledWith('user');
        });

        test('should return authenticated false when no user cookie present', async () => {
            // Act
            await authController.authenticate(req, res);

            // Assert
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                authenticated: false,
                message: 'Not authenticated'
            });
        });
    });

    describe('authenticateAdmin', () => {
        test('should return authenticated and isAdmin true for admin user', async () => {
            // Arrange
            req.cookies.user = JSON.stringify({ id: 'admin', username: 'admin' });
            persistenceService.getUser.mockResolvedValue({ id: 'admin', username: 'admin' });

            // Act
            await authController.authenticateAdmin(req, res);

            // Assert
            expect(res.json).toHaveBeenCalledWith({
                authenticated: true,
                isAdmin: true,
                user: { id: 'admin', username: 'admin' }
            });
        });

        test('should return authenticated true but isAdmin false for non-admin user', async () => {
            // Arrange
            req.cookies.user = JSON.stringify({ id: 'user123', username: 'testuser' });
            persistenceService.getUser.mockResolvedValue({ id: 'user123', username: 'testuser' });

            // Act
            await authController.authenticateAdmin(req, res);

            // Assert
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                authenticated: true,
                isAdmin: false,
                message: 'Not authorized as admin'
            });
        });

        test('should return authenticated and isAdmin false when no user cookie present', async () => {
            // Act
            await authController.authenticateAdmin(req, res);

            // Assert
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                authenticated: false,
                isAdmin: false,
                message: 'Not authenticated'
            });
        });
    });  
});