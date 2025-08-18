// Direct database test for discount fields
require('dotenv').config();
const mongoose = require('mongoose');

async function testDiscountFields() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://sadhu1616:NYhYajU4Qm7eFioB@cluster.xqikjxq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster';
    const dbName = process.env.DB_NAME || 'heritage-bengal';
    
    await mongoose.connect(mongoUri, { dbName });
    console.log('Connected to MongoDB');
    
    // Define schema exactly like server
    const productSchema = new mongoose.Schema({
        name: { type: String, required: true },
        price: { type: Number, required: true },
        original_price: { type: Number, required: false },
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
        timestamps: true
    });
    
    const Product = mongoose.model('TestProduct', productSchema, 'Products');
    
    // Create test product with discount
    const testProduct = new Product({
      name: "Direct DB Test with Discount",
      price: 1999,
      original_price: 4000,
      discount_percentage: 50,
      category: "Test",
      stock: 5,
      description: "Testing discount fields directly in DB"
    });
    
    console.log('Product before save:', JSON.stringify(testProduct.toObject(), null, 2));
    
    const saved = await testProduct.save();
    console.log('Product after save:', JSON.stringify(saved.toObject(), null, 2));
    
    // Verify it was saved correctly
    const fetched = await Product.findById(saved._id);
    console.log('Product fetched from DB:', JSON.stringify(fetched.toObject(), null, 2));
    
    process.exit(0);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testDiscountFields();
