// Update existing product with discount fields
require('dotenv').config();
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema, 'Products');

async function updateProductWithDiscount() {
  try {
    // Use the same connection as the server
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://sadhu1616:NYhYajU4Qm7eFioB@cluster.xqikjxq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster';
    const dbName = process.env.DB_NAME || 'heritage-bengal';
    
    await mongoose.connect(mongoUri, { dbName });
    console.log('Connected to MongoDB Atlas');
    
    // Update the Heritage Gold Necklace product
    const updatedProduct = await Product.findOneAndUpdate(
      { name: 'Heritage Gold Necklace - Discounted' },
      { 
        $set: { 
          original_price: 20000, 
          discount_percentage: 25 
        } 
      },
      { new: true }
    );
    
    if (updatedProduct) {
      console.log('Successfully updated product with discount pricing!');
      console.log('Product name:', updatedProduct.name);
      console.log('Original price:', updatedProduct.original_price);
      console.log('Discount percentage:', updatedProduct.discount_percentage);
      console.log('Final price:', updatedProduct.price);
    } else {
      console.log('Product not found');
      
      // Let's see what products actually exist
      const allProducts = await Product.find({});
      console.log(`Found ${allProducts.length} products:`);
      allProducts.forEach(p => console.log(`- ${p.name}`));
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateProductWithDiscount();
