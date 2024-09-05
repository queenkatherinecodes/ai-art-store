const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'public', 'data');
const IMAGES_DIR = path.join(__dirname, '..', '..', 'public', 'images');

// Ensure data directory exists
fs.mkdir(DATA_DIR, { recursive: true }).catch(console.error);

async function readJSONFile(filename) {
    try {
        const data = await fs.readFile(path.join(DATA_DIR, filename), 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return null;  // File doesn't exist
        }
        throw error;
    }
}

async function writeJSONFile(filename, data) {
    await fs.writeFile(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
}

exports.createUser = async (username, password) => {
    const users = await readJSONFile('users.json') || {};
    if (users[username]) {
        throw new Error('Username already exists');
    }

    const newUser = {
        id: Date.now().toString(), // Simple ID generation
        username,
        password // In a real application, you should hash this password
    };

    users[username] = newUser;
    await writeJSONFile('users.json', users);

    const carts = await readJSONFile('carts.json') || {};
    carts[newUser.id] = [];
    await writeJSONFile('carts.json', carts);
    return newUser;
};

exports.getUser = async (username) => {
    const users = await readJSONFile('users.json') || {};
    return users[username];
};

exports.getUsernameById = async (userId) => {
    const users = await readJSONFile('users.json') || {};
    for (const username in users) {
        if (users[username].id === userId) {
            return users[username].username;
        }
    }
    throw new Error('User not found');
};

exports.logActivity = async (user, activity) => {
    const timestamp = new Date().toISOString();
    const date = new Date(timestamp).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    const logEntry = `${date},${user},${activity}\n`;
    await fs.appendFile(path.join(DATA_DIR, 'activity.log'), logEntry);
};

// Initialize with admin user if not exists
exports.initializeUsers = async () => {
    const users = await readJSONFile('users.json') || {};
    if (!users.admin) {
        users.admin = { id: 'admin', username: 'admin', password: 'admin' };
        await writeJSONFile('users.json', users);
    }
};

// Persistence for the Products Module

exports.getAllProducts = async () => {
    const files = await fs.readdir(IMAGES_DIR);
    return files.map(filename => ({
        id: path.parse(filename).name,
        title: path.parse(filename).name.replace(/_/g, ' '),
        imageUrl: `/images/${filename}`
    }));
};

exports.searchProducts = async (query) => {
    const products = await this.getAllProducts();
    return products.filter(product =>
        product.title.toLowerCase().includes(query.toLowerCase())
    );
};

exports.getProduct = async (id) => {
    const products = await this.getAllProducts();
    return products.find(product => product.id === id);
};

exports.deleteProduct = async (id) => {
    const filepath = path.join(IMAGES_DIR, `${id}.png`);
    try {
        await fs.unlink(filepath);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            throw error;
        }
        // If file doesn't exist, we consider the delete operation successful
    }
};

// Cart
exports.getCart = async (userId) => {
    const carts = await readJSONFile('carts.json') || {};
    return carts[userId] || [];
};

exports.addToCart = async (userId, productId, quantity) => {
    const carts = await readJSONFile('carts.json') || {};
    const userCart = carts[userId] || [];

    const existingItemIndex = userCart.findIndex(item => item.productId === productId);
    if (existingItemIndex > -1) {
        userCart[existingItemIndex].quantity += quantity;
    } else {
        userCart.push({ productId, quantity });
    }

    carts[userId] = userCart;
    await writeJSONFile('carts.json', carts);
    return userCart;
};

exports.removeFromCart = async (userId, productId) => {
    const carts = await readJSONFile('carts.json') || {};
    const userCart = carts[userId] || [];

    const updatedCart = userCart.filter(item => item.productId !== productId);

    carts[userId] = updatedCart;
    await writeJSONFile('carts.json', carts);
    return updatedCart;
};

exports.processCheckout = async (username, cart) => {
    const purchases = await readJSONFile('purchases.json') || {};
    const userPurchases = purchases[username] || [];

    const newPurchase = {
        id: Date.now().toString(), // Simple ID generation for the purchase
        items: cart,
        date: new Date().toISOString(),
    };

    userPurchases.push(newPurchase);
    purchases[username] = userPurchases;

    await writeJSONFile('purchases.json', purchases);
    return newPurchase;
};

// Clear the user's cart after checkout
exports.clearCart = async (userId) => {
    const carts = await readJSONFile('carts.json') || {};
    carts[userId] = [];
    await writeJSONFile('carts.json', carts);
};
module.exports = exports;