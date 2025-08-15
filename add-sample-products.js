const mongoose = require('mongoose');

const mongoUri = 'mongodb+srv://sadhu1616:NYhYajU4Qm7eFioB@cluster.xqikjxq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster';
const dbName = 'Hertiage_Bengal_Jewellery';

// Product schema
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    description: String,
    category: String,
    image: String,
    stock: Number
});

const Product = mongoose.model('Product', productSchema, 'Products');

// Sample products data
const sampleProducts = [
    {
        name: 'Gold Plated Necklace',
        price: 2499,
        description: 'A stunning gold plated necklace inspired by Bengal artistry.',
        category: 'Necklace',
        image: 'assets/necklace.jpg',
        stock: 10
    },
    {
        name: 'Traditional Earrings',
        price: 1299,
        description: 'Elegant earrings with a touch of tradition.',
        category: 'Earrings',
        image: 'assets/earrings.jpg',
        stock: 15
    },
    {
        name: 'Elegant Bangle',
        price: 1999,
        description: 'Beautiful bangle crafted for special occasions.',
        category: 'Bangle',
        image: 'assets/bangle.jpg',
        stock: 8
    }
];

async function addSampleProducts() {
    try {
        await mongoose.connect(mongoUri, { dbName });
        console.log('Connected to MongoDB');
        
        // Clear existing products (optional)
        await Product.deleteMany({});
        console.log('Cleared existing products');
        
        // Add sample products
        const addedProducts = await Product.insertMany(sampleProducts);
        console.log('Added sample products:', addedProducts.length);
        
        // Display added products
        addedProducts.forEach(product => {
            console.log(`- ${product.name}: ₹${product.price}`);
        });
        
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        
    } catch (error) {
        console.error('Error:', error);
    }
}

addSampleProducts();
