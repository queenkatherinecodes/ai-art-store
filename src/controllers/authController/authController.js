const persistenceService = require('../../services/persistenceService/persist');
const config = require('../../config');

exports.register = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const existingUser = await persistenceService.getUser(username);
    if (existingUser) {
        return res.status(409).json({ message: 'Username already exists' });
    }

    try {
        const newUser = await persistenceService.createUser(username, password);
        res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
        await persistenceService.logActivity(newUser.username, 'register');
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
};

exports.login = async (req, res) => {
    const { username, password, rememberMe } = req.body;

    const user = await persistenceService.getUser(username);

    if (user && user.password === password) {
        const expiresIn = rememberMe ? config.REMEMBER_ME_EXPIRY : config.SESSION_EXPIRY;

        res.cookie('user', JSON.stringify({ id: user.id, username: user.username }), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            expires: new Date(Date.now() + expiresIn),
        });
        await persistenceService.logActivity(user.username, 'login');
        res.json({id: user.id});
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
};

exports.logout = async (req, res) => {
    const user = JSON.parse(req.cookies.user || '{}');
    res.clearCookie('user');
    if (user.id) {
        await persistenceService.logActivity(user.username, 'logout');
    }
    res.json({ message: 'Logged out successfully' });
};

exports.authenticate = async (req, res) => {
    const userCookie = req.cookies.user;
    if (!userCookie) {
        return res.status(401).json({ authenticated: false, message: 'Not authenticated' });
    }

    try {
        const user = JSON.parse(userCookie);
        const currUser = await persistenceService.getUser(user.username);
        
        if (currUser && currUser.id === user.id) {
            res.json({ authenticated: true, user: { id: user.id, username: user.username } });
        } else {
            res.clearCookie('user');
            res.status(401).json({ authenticated: false, message: 'Invalid session' });
        }
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ authenticated: false, message: 'Error during authentication' });
    }
};

exports.authenticateAdmin = async (req, res) => {
    const userCookie = req.cookies.user;
    if (!userCookie) {
        return res.status(401).json({ authenticated: false, isAdmin: false, message: 'Not authenticated' });
    }

    try {
        const user = JSON.parse(userCookie);
        const currUser = await persistenceService.getUser(user.username);
        
        if (currUser && currUser.id === user.id && user.username === 'admin') {
            res.json({ authenticated: true, isAdmin: true, user: { id: user.id, username: user.username } });
        } else if (currUser && currUser.id === user.id){
            res.status(403).json({ authenticated: true, isAdmin: false, message: 'Not authorized as admin' });
        }
    } catch (error) {
        console.error('Admin authentication error:', error);
        res.status(500).json({ authenticated: false, isAdmin: false, message: 'Error during authentication' });
    }
};