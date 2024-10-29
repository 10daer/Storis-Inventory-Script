// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
    app.use(cors());
app.use(express.json());

// Basic route for testing
app.get('/api/test', (req, res) => {
    res.json({ message: 'Product matcher API is running' });
});

// Import the ProductMatcher class
const { ProductMatcher, Product, ProductType, Size } = require('../productMatcher');

// Initialize the product matcher
const matcher = new ProductMatcher();

// Routes
app.post('/api/products', (req, res) => {
    try {
        const productData = req.body;
        const product = new Product(productData);
        matcher.addProduct(product);
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/products', (req, res) => {
    res.json(matcher.products);
});

app.get('/api/products/:id/matches', (req, res) => {
    try {
        const product = matcher.products.find(p => p.id === req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        const matches = matcher.findCompatibleProducts(product);
        res.json(matches);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});