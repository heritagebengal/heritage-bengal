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

// Enhanced sample products with different categories
const enhancedProducts = [
    // Necklaces
    {
        name: 'Royal Bengali Necklace',
        price: 4999,
        description: 'Exquisite traditional Bengali necklace with intricate gold plating and traditional motifs.',
        category: 'Necklace',
        image: 'assets/necklace.jpg',
        stock: 8
    },
    {
        name: 'Heritage Gold Chain',
        price: 2999,
        description: 'Classic gold-plated chain perfect for everyday elegance.',
        category: 'Necklace',
        image: 'assets/chain.jpg',
        stock: 12
    },
    
    // Earrings
    {
        name: 'Traditional Jhumka',
        price: 1899,
        description: 'Beautiful traditional jhumka earrings with pearl detailing.',
        category: 'Earrings',
        image: 'assets/earrings.jpg',
        stock: 15
    },
    {
        name: 'Bengali Chandelier Earrings',
        price: 2499,
        description: 'Elegant chandelier earrings inspired by Bengali heritage.',
        category: 'Earrings',
        image: 'assets/chandelier-earrings.jpg',
        stock: 6
    },
    
    // Bangles
    {
        name: 'Traditional Kada Bangle',
        price: 1999,
        description: 'Heavy traditional kada bangle with Bengali inscriptions.',
        category: 'Bangle',
        image: 'assets/bangle.jpg',
        stock: 10
    },
    {
        name: 'Delicate Pearl Bangles Set',
        price: 3499,
        description: 'Set of 4 delicate bangles with pearl and gold work.',
        category: 'Bangle',
        image: 'assets/pearl-bangles.jpg',
        stock: 4
    },
    
    // Komor Bondhoni
    {
        name: 'Bridal Komor Bondhoni',
        price: 8999,
        description: 'Traditional Bengali bridal waist chain with intricate designs.',
        category: 'Komor Bondhoni',
        image: 'assets/komor-bondhoni.jpg',
        stock: 3
    },
    {
        name: 'Simple Komor Chain',
        price: 3999,
        description: 'Elegant everyday komor bondhoni for modern Bengali women.',
        category: 'Komor Bondhoni',
        image: 'assets/simple-komor.jpg',
        stock: 7
    },
    
    // Tikli
    {
        name: 'Traditional Gajra Tikli',
        price: 899,
        description: 'Beautiful hair accessory tikli with gajra design.',
        category: 'Tikli',
        image: 'assets/tikli.jpg',
        stock: 20
    },
    {
        name: 'Royal Ruby Tikli',
        price: 1299,
        description: 'Elegant tikli with ruby stones for special occasions.',
        category: 'Tikli',
        image: 'assets/ruby-tikli.jpg',
        stock: 8
    },
    
    // Khopar Saaj
    {
        name: 'Bridal Khopar Saaj Set',
        price: 12999,
        description: 'Complete bridal hair jewelry set with traditional Bengali designs.',
        category: 'Khopar Saaj',
        image: 'assets/khopar-saaj.jpg',
        stock: 2
    },
    {
        name: 'Simple Khopar Ornament',
        price: 4999,
        description: 'Elegant khopar saaj for everyday traditional wear.',
        category: 'Khopar Saaj',
        image: 'assets/simple-khopar.jpg',
        stock: 5
    }
];

async function addEnhancedProducts() {
    try {
        await mongoose.connect(mongoUri, { dbName });
        console.log('Connected to MongoDB');
        
        // Clear existing products
        await Product.deleteMany({});
        console.log('Cleared existing products');
        
        // Add enhanced products
        const addedProducts = await Product.insertMany(enhancedProducts);
        console.log('Added enhanced products:', addedProducts.length);
        
        // Display added products by category
        const categories = [...new Set(enhancedProducts.map(p => p.category))];
        categories.forEach(category => {
            console.log(`\n${category}:`);
            enhancedProducts
                .filter(p => p.category === category)
                .forEach(product => {
                    console.log(`  - ${product.name}: ₹${product.price}`);
                });
        });
        
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
        
    } catch (error) {
        console.error('Error:', error);
    }
}

addEnhancedProducts();
