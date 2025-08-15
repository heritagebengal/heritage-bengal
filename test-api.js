const axios = require('axios');

const sampleProduct = {
  "name": "Royal Maharani Necklace",
  "price": 7999,
  "description": "Exquisite royal necklace inspired by Maharani jewelry with intricate Bengali motifs and premium gold plating.",
  "category": "Necklace",
  "image": "assets/royal-necklace.jpg",
  "stock": 5,
  "features": [
    "Handcrafted with 18k gold plating",
    "Traditional Bengali royal design",
    "Adjustable chain length (16-20 inches)",
    "Comes with matching earrings",
    "Perfect for weddings and ceremonies"
  ],
  "care_instructions": [
    "Store in a velvet jewelry box",
    "Clean with a soft microfiber cloth",
    "Avoid contact with perfumes and lotions",
    "Keep away from moisture and humidity",
    "Professional cleaning recommended annually"
  ],
  "rating": 4.9,
  "reviews_count": 42
};

async function testProductAPI() {
  try {
    console.log('Testing Product API with sample product...');
    
    const response = await axios.post('http://localhost:5000/products', sampleProduct, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Product added successfully!');
    console.log('Product ID:', response.data._id);
    console.log('Product Name:', response.data.name);
    console.log('Features Count:', response.data.features.length);
    console.log('Care Instructions Count:', response.data.care_instructions.length);
    
    console.log('\n🔗 Test the product details page:');
    console.log(`http://localhost:5000/product-details.html?id=${response.data._id}`);
    
  } catch (error) {
    console.error('❌ Error adding product:', error.response?.data || error.message);
  }
}

testProductAPI();
