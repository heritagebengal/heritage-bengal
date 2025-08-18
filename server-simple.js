// Simple working server for Heritage Bengal with discount pricing
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

// MongoDB connection
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://sadhu1616:NYhYajU4Qm7eFioB@cluster.xqikjxq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster';
const dbName = process.env.DB_NAME || 'heritage-bengal';

mongoose.connect(mongoUri, { dbName })
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Product schema with discount fields
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    original_price: { type: Number, required: false }, // Explicitly define discount fields
    discount_percentage: { type: Number, required: false },
    description: String,
    category: String,
    image: {
        type: mongoose.Schema.Types.Mixed,
        default: 'assets/placeholder.svg'
    },
    stock: { type: Number, default: 0 },
    features: { type: [String], default: [] },
    care_instructions: { type: [String], default: [] },
    rating: { type: Number, default: 4.8 },
    reviews_count: { type: Number, default: 0 }
}, { 
    strict: false,
    timestamps: true // Add timestamps for debugging
});

const Product = mongoose.model('Product', productSchema, 'Products');

// Routes
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (err) {
        console.error('Error fetching product:', err);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

app.post('/products', async (req, res) => {
    try {
        console.log('=== PRODUCT CREATION DEBUG ===');
        console.log('Received raw body:', JSON.stringify(req.body, null, 2));
        
        // Extract and log discount fields specifically
        const { original_price, discount_percentage, name, price } = req.body;
        console.log('Discount fields check:');
        console.log('- original_price:', original_price, typeof original_price);
        console.log('- discount_percentage:', discount_percentage, typeof discount_percentage);
        console.log('- price:', price, typeof price);
        
        // Create product with all fields
        const productData = {
            ...req.body,
            // Ensure discount fields are properly set
            original_price: original_price ? Number(original_price) : undefined,
            discount_percentage: discount_percentage ? Number(discount_percentage) : undefined
        };
        
        console.log('Product data before save:', JSON.stringify(productData, null, 2));
        
        const product = new Product(productData);
        console.log('Product instance before save:', JSON.stringify(product.toObject(), null, 2));
        
        const savedProduct = await product.save();
        console.log('Product after save:', JSON.stringify(savedProduct.toObject(), null, 2));
        console.log('=== END DEBUG ===');
        
        res.status(201).json(savedProduct);
    } catch (err) {
        console.error('Error adding product:', err);
        res.status(400).json({ error: 'Failed to add product', details: err.message });
    }
});

// Serve static HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/products.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'products.html'));
});

app.get('/product-details.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'product-details.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Heritage Bengal Server running on port ${PORT}`);
    console.log(`Access the application at http://localhost:${PORT}`);
});

module.exports = app;
