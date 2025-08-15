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
    stock: Number,
    features: [String],
    care_instructions: [String],
    rating: { type: Number, default: 4.8 },
    reviews_count: { type: Number, default: 0 }
});

const Product = mongoose.model('Product', productSchema, 'Products');

async function updateExistingProducts() {
    try {
        await mongoose.connect(mongoUri, { dbName });
        console.log('Connected to MongoDB');
        
        // Get all existing products
        const products = await Product.find({});
        console.log(`Found ${products.length} products to update`);
        
        // Update each product with enhanced fields
        for (const product of products) {
            const updateData = {
                rating: 4.8,
                reviews_count: Math.floor(Math.random() * 50) + 10
            };
            
            // Add category-specific features
            const category = product.category?.toLowerCase() || '';
            
            if (category.includes('necklace')) {
                updateData.features = [
                    'Handcrafted traditional Bengali necklace design',
                    'Premium quality gold plating',
                    'Adjustable chain length',
                    'Perfect for festive occasions'
                ];
                updateData.care_instructions = [
                    'Store in a jewelry box to prevent tangling',
                    'Clean with a soft cloth after each use',
                    'Avoid exposure to moisture and chemicals',
                    'Handle chain gently to maintain durability'
                ];
            } else if (category.includes('earrings')) {
                updateData.features = [
                    'Traditional Bengali earring craftsmanship',
                    'Lightweight and comfortable wear',
                    'Secure hook closure',
                    'Elegant design for all occasions'
                ];
                updateData.care_instructions = [
                    'Clean earring hooks regularly',
                    'Store in individual compartments',
                    'Avoid sleeping while wearing',
                    'Polish gently with a soft cloth'
                ];
            } else if (category.includes('bangle')) {
                updateData.features = [
                    'Traditional Bengali bangle artistry',
                    'Comfortable fit design',
                    'Durable gold plating',
                    'Perfect for daily and festive wear'
                ];
                updateData.care_instructions = [
                    'Remove before washing hands',
                    'Store in a dry place',
                    'Clean with a soft, dry cloth',
                    'Avoid impact to prevent dents'
                ];
            } else if (category.includes('komor')) {
                updateData.features = [
                    'Traditional Bengali waist chain design',
                    'Adjustable length for perfect fit',
                    'Intricate handcrafted details',
                    'Perfect for traditional attire'
                ];
                updateData.care_instructions = [
                    'Store flat to prevent tangling',
                    'Clean gently with a soft cloth',
                    'Avoid tight storage that may cause kinks',
                    'Handle delicate links with care'
                ];
            } else if (category.includes('tikli')) {
                updateData.features = [
                    'Traditional Bengali hair accessory',
                    'Lightweight design',
                    'Easy to wear and remove',
                    'Perfect for cultural events'
                ];
                updateData.care_instructions = [
                    'Store in a small pouch to prevent loss',
                    'Clean with a soft brush if needed',
                    'Avoid pulling hair when removing',
                    'Keep away from hair products'
                ];
            } else if (category.includes('khopar')) {
                updateData.features = [
                    'Traditional Bengali bridal hair jewelry',
                    'Intricate heritage design',
                    'Premium craftsmanship',
                    'Perfect for weddings and ceremonies'
                ];
                updateData.care_instructions = [
                    'Handle with extreme care due to delicate design',
                    'Store in original packaging',
                    'Professional cleaning recommended',
                    'Avoid contact with hair sprays'
                ];
            } else {
                updateData.features = [
                    'Handcrafted with traditional Bengali techniques',
                    'Premium quality materials',
                    'Authentic heritage design',
                    'Suitable for special occasions'
                ];
                updateData.care_instructions = [
                    'Store in a dry place away from moisture',
                    'Clean with a soft, dry cloth',
                    'Avoid contact with perfumes and chemicals',
                    'Handle with care to maintain the finish'
                ];
            }
            
            await Product.findByIdAndUpdate(product._id, updateData);
            console.log(`Updated: ${product.name} (${product.category})`);
        }
        
        console.log('\nAll products updated successfully!');
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        
    } catch (error) {
        console.error('Error updating products:', error);
    }
}

updateExistingProducts();
