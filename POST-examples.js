// POST Request Examples for Multi-Category API
// Use these examples in Postman, curl, or any HTTP client

console.log('=== MULTI-CATEGORY API - POST REQUEST EXAMPLES ===\n');

// ====================
// 1. POSTMAN EXAMPLES
// ====================

console.log('1. POSTMAN EXAMPLES:');
console.log('===================');

console.log('\n📍 CREATE PRODUCT WITH MULTIPLE CATEGORIES:');
console.log('Method: POST');
console.log('URL: http://localhost:5000/products');
console.log('Headers: Content-Type: application/json');
console.log('Body (JSON):');
console.log(`{
  "name": "Heritage Gold Necklace Set",
  "price": 15000,
  "original_price": 18000,
  "discount_percentage": 17,
  "description": "Exquisite gold necklace set perfect for weddings and special occasions",
  "categories": ["Necklaces", "Gold Jewelry", "Wedding Collection", "Premium"],
  "image": "assets/necklace-gold-1.jpg",
  "stock": 5,
  "features": [
    "22K Gold Plated",
    "Handcrafted Design",
    "Traditional Pattern",
    "Comes with Matching Earrings"
  ],
  "care_instructions": [
    "Store in velvet pouch",
    "Clean with soft cloth",
    "Avoid water contact"
  ],
  "rating": 4.8,
  "reviews_count": 24
}`);

console.log('\n📍 CREATE PRODUCT WITH SINGLE CATEGORY (Legacy Support):');
console.log('Method: POST');
console.log('URL: http://localhost:5000/products');
console.log('Headers: Content-Type: application/json');
console.log('Body (JSON):');
console.log(`{
  "name": "Silver Bangles Pair",
  "price": 3500,
  "description": "Beautiful silver bangles for daily wear",
  "category": "Bangles",
  "image": "assets/bangles-silver-1.jpg",
  "stock": 10
}`);

// ====================
// 2. CURL EXAMPLES
// ====================

console.log('\n\n2. CURL EXAMPLES (Windows PowerShell):');
console.log('====================================');

console.log('\n📍 CREATE MULTI-CATEGORY PRODUCT:');
console.log(`curl -X POST "http://localhost:5000/products" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Diamond Earrings Collection",
    "price": 25000,
    "original_price": 30000,
    "discount_percentage": 17,
    "description": "Stunning diamond earrings for special occasions",
    "categories": ["Earrings", "Diamond Jewelry", "Party Wear", "Luxury"],
    "image": "assets/earrings-diamond-1.jpg",
    "stock": 3,
    "features": ["Real Diamonds", "Sterling Silver Base", "Gift Box Included"],
    "rating": 4.9,
    "reviews_count": 12
  }'`);

console.log('\n📍 UPDATE EXISTING PRODUCT WITH MULTIPLE CATEGORIES:');
console.log('Method: PUT');
console.log('URL: http://localhost:5000/products/{PRODUCT_ID}');
console.log(`curl -X PUT "http://localhost:5000/products/YOUR_PRODUCT_ID_HERE" \\
  -H "Content-Type: application/json" \\
  -d '{
    "categories": ["Necklaces", "Traditional", "Wedding Collection", "Gold Jewelry"]
  }'`);

// ====================
// 3. JAVASCRIPT FETCH EXAMPLES
// ====================

console.log('\n\n3. JAVASCRIPT FETCH EXAMPLES:');
console.log('=============================');

console.log('\n📍 Create Product with Multiple Categories:');
console.log(`
async function createMultiCategoryProduct() {
  try {
    const response = await fetch('http://localhost:5000/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: "Traditional Tikli Set",
        price: 1200,
        original_price: 1500,
        discount_percentage: 20,
        description: "Beautiful traditional tikli for hair decoration",
        categories: ["Tikli", "Traditional", "Hair Accessories", "Wedding"],
        image: "assets/tikli-traditional-1.jpg",
        stock: 15,
        features: ["Handmade", "Traditional Design", "Lightweight"],
        rating: 4.7,
        reviews_count: 8
      })
    });
    
    if (response.ok) {
      const product = await response.json();
      console.log('✅ Product created:', product);
      return product;
    } else {
      const error = await response.json();
      console.log('❌ Error:', error);
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
}

// Call the function
createMultiCategoryProduct();
`);

console.log('\n📍 Filter Products by Category:');
console.log(`
// Get all products in "Necklaces" category (includes multi-category products)
fetch('http://localhost:5000/products?category=Necklaces')
  .then(response => response.json())
  .then(products => console.log('Necklaces:', products));

// Get all products in "Gold Jewelry" category
fetch('http://localhost:5000/products?category=Gold%20Jewelry')
  .then(response => response.json())
  .then(products => console.log('Gold Jewelry:', products));

// Get all products (no duplicates)
fetch('http://localhost:5000/products')
  .then(response => response.json())
  .then(products => console.log('All Products:', products));

// Get all available categories
fetch('http://localhost:5000/categories')
  .then(response => response.json())
  .then(categories => console.log('Categories:', categories));
`);

// ====================
// 4. READY-TO-USE EXAMPLES
// ====================

console.log('\n\n4. READY-TO-USE PRODUCT DATA:');
console.log('============================');

const sampleProducts = [
  {
    name: "Royal Bridal Necklace",
    price: 45000,
    original_price: 55000,
    discount_percentage: 18,
    description: "Exquisite bridal necklace with intricate gold work",
    categories: ["Necklaces", "Bridal", "Gold Jewelry", "Premium", "Wedding Collection"],
    image: "assets/necklace-bridal-1.jpg",
    stock: 2,
    features: ["22K Gold", "Handcrafted", "Traditional Design", "Bridal Special"],
    care_instructions: ["Handle with care", "Store separately", "Professional cleaning recommended"],
    rating: 5.0,
    reviews_count: 6
  },
  {
    name: "Elegant Silver Bangles",
    price: 2800,
    original_price: 3200,
    discount_percentage: 13,
    description: "Set of 4 elegant silver bangles",
    categories: ["Bangles", "Silver Jewelry", "Daily Wear", "Set"],
    image: "assets/bangles-silver-set.jpg",
    stock: 8,
    features: ["Pure Silver", "Set of 4", "Comfortable Fit"],
    rating: 4.6,
    reviews_count: 18
  },
  {
    name: "Pearl Drop Earrings",
    price: 1800,
    description: "Classic pearl drop earrings for any occasion",
    categories: ["Earrings", "Pearl Jewelry", "Casual Wear", "Office Wear"],
    image: "assets/earrings-pearl-drop.jpg",
    stock: 12,
    features: ["Natural Pearls", "Sterling Silver Hooks", "Lightweight"],
    rating: 4.4,
    reviews_count: 22
  }
];

console.log('\nSample Products for Testing:');
sampleProducts.forEach((product, index) => {
  console.log(`\n${index + 1}. ${product.name}:`);
  console.log(`   Categories: ${product.categories.join(', ')}`);
  console.log(`   Price: ₹${product.price}`);
  console.log(`   Stock: ${product.stock}`);
});

// ====================
// 5. TESTING COMMANDS
// ====================

console.log('\n\n5. QUICK TESTING COMMANDS:');
console.log('=========================');

console.log('\n📍 PowerShell Commands (Windows):');
console.log(`
# Test 1: Create a multi-category product
$body = @{
  name = "Test Multi-Category Product"
  price = 5000
  categories = @("Necklaces", "Gold Jewelry", "Traditional")
  stock = 5
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/products" -Method POST -Body $body -ContentType "application/json"

# Test 2: Get products by category
Invoke-RestMethod -Uri "http://localhost:5000/products?category=Necklaces" -Method GET

# Test 3: Get all categories
Invoke-RestMethod -Uri "http://localhost:5000/categories" -Method GET
`);

console.log('\n📍 Key API Endpoints:');
console.log('POST   /products              - Create new product');
console.log('GET    /products              - Get all products (no duplicates)');
console.log('GET    /products?category=X   - Get products by category');
console.log('GET    /categories            - Get all available categories');
console.log('PUT    /products/{id}         - Update product');
console.log('GET    /products/{id}         - Get single product');

console.log('\n✅ MULTI-CATEGORY FEATURES:');
console.log('• Products can belong to multiple categories');
console.log('• Filtering by category shows products from all relevant categories');
console.log('• "All Products" view shows each product only once');
console.log('• Backward compatibility with single category field');
console.log('• First category in array becomes primary category');

console.log('\n🚀 Ready to test! Start with the Postman examples above.');

module.exports = { sampleProducts };
