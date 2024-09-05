const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes/authRoutes');
const productRoutes = require('./routes/productRoutes/productRoutes');
const cartRoutes = require('./routes/cartRoutes/cartRoutes');
const logRoutes = require('./routes/logRoutes/logRoutes');
const reviewRoutes = require('./routes/reviewRoutes/reviewRoutes');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// UI
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/log', logRoutes);
app.use('/api/reviews', reviewRoutes);

// Default back to index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;