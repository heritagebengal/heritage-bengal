// HERITAGE BENGAL - COMPLETE CATEGORY REFERENCE & API GUIDE
// ========================================================

console.log('🎯 HERITAGE BENGAL - CATEGORY & API REFERENCE');
console.log('===============================================\n');

// ===========================
// 1. COMPLETE CATEGORY LIST
// ===========================

const HERITAGE_BENGAL_CATEGORIES = {
  // Primary Categories (Main Product Types)
  "Bangle": "Traditional Bengali bangles and bracelets",
  "Necklace": "Necklaces and necklace sets", 
  "Earrings": "Traditional and modern earrings",
  "Tikli": "Hair accessories and decorative pins",
  "Komor Bondhoni": "Traditional waist chains",
  "Khopar Saaj": "Hair decoration accessories",
  
  // Special Collections
  "Best Seller": "Most popular items",
  "Premium": "High-end luxury pieces",
  "Traditional": "Classic Bengali designs",
  "Wedding Collection": "Special occasion jewelry",
  "Bridal": "Bridal jewelry sets",
  
  // Material-based Categories  
  "Gold Jewelry": "Gold and gold-plated items",
  "Silver Jewelry": "Silver and silver-plated items",
  "Diamond Jewelry": "Diamond studded pieces",
  "Pearl Jewelry": "Pearl-based jewelry",
  
  // Occasion-based Categories
  "Daily Wear": "Everyday jewelry",
  "Party Wear": "Special occasion pieces", 
  "Office Wear": "Professional/formal jewelry",
  "Casual Wear": "Casual and trendy pieces",
  "Event": "Event-specific jewelry",
  
  // Collection Types
  "Set": "Jewelry sets (multiple pieces)",
  "Luxury": "Luxury collection",
  "Gift Items": "Perfect for gifting",
  "Hair Accessories": "Hair decoration items"
};

console.log('📋 AVAILABLE CATEGORIES:');
console.log('========================');
Object.keys(HERITAGE_BENGAL_CATEGORIES).forEach(category => {
  console.log(`• ${category}`);
});

console.log('\n📝 CATEGORY DESCRIPTIONS:');
console.log('=========================');
Object.entries(HERITAGE_BENGAL_CATEGORIES).forEach(([category, description]) => {
  console.log(`${category}: ${description}`);
});

// ===========================
// 2. API ENDPOINTS & EXAMPLES
// ===========================

console.log('\n\n🚀 API ENDPOINTS & EXAMPLES:');
console.log('============================');

const API_EXAMPLES = {
  
  // CREATE PRODUCT WITH MULTIPLE CATEGORIES
  createMultiCategoryProduct: {
    method: "POST",
    url: "http://localhost:5000/products",
    description: "Create a product that belongs to multiple categories",
    headers: {
      "Content-Type": "application/json"
    },
    body: {
      name: "Heritage Gold Plated Necklace Set",
      price: 8500,
      original_price: 12000,
      discount_percentage: 29,
      description: "Beautiful traditional necklace set perfect for weddings",
      categories: ["Necklace", "Gold Jewelry", "Wedding Collection", "Traditional", "Set"],
      image: ["assets/necklace1.jpg", "assets/necklace2.jpg"],
      stock: 5,
      features: [
        "24kt Gold Plated",
        "Handcrafted Design", 
        "Traditional Bengali Pattern",
        "Complete Set with Earrings"
      ],
      care_instructions: [
        "Store in jewelry box",
        "Clean with soft cloth",
        "Avoid water contact"
      ],
      rating: 4.8,
      reviews_count: 24
    }
  },

  // UPDATE PRODUCT CATEGORIES
  updateProductCategories: {
    method: "PUT", 
    url: "http://localhost:5000/products/{PRODUCT_ID}",
    description: "Update existing product with new categories",
    headers: {
      "Content-Type": "application/json"
    },
    body: {
      categories: ["Bangle", "Best Seller", "Gold Jewelry", "Traditional"]
    }
  },

  // FILTER BY CATEGORY
  filterByCategory: {
    method: "GET",
    urls: [
      "http://localhost:5000/products?category=Bangle",
      "http://localhost:5000/products?category=Best%20Seller",
      "http://localhost:5000/products?category=Gold%20Jewelry",
      "http://localhost:5000/products?category=Wedding%20Collection"
    ],
    description: "Get products by specific category (URL encoded for spaces)"
  },

  // GET ALL PRODUCTS (NO DUPLICATES)
  getAllProducts: {
    method: "GET",
    url: "http://localhost:5000/products",
    description: "Get all products - each appears only once regardless of multiple categories"
  },

  // GET ALL CATEGORIES
  getAllCategories: {
    method: "GET", 
    url: "http://localhost:5000/categories",
    description: "Get list of all available categories"
  }
};

console.log('\n📡 API USAGE EXAMPLES:');
console.log('======================');

// PowerShell Examples
console.log('\n🔷 POWERSHELL EXAMPLES:');
console.log('=======================');

console.log(`
# 1. Create product with multiple categories
$body = @{
  name = "Traditional Bangles Set"
  price = 3500
  categories = @("Bangle", "Traditional", "Set", "Gold Jewelry")
  stock = 8
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "http://localhost:5000/products" -Method POST -Body $body -ContentType "application/json"

# 2. Update existing product categories
$updateBody = @{
  categories = @("Bangle", "Best Seller")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/products/YOUR_PRODUCT_ID" -Method PUT -Body $updateBody -ContentType "application/json"

# 3. Get products by category
Invoke-RestMethod -Uri "http://localhost:5000/products?category=Bangle" -Method GET
Invoke-RestMethod -Uri "http://localhost:5000/products?category=Best%20Seller" -Method GET

# 4. Get all categories
Invoke-RestMethod -Uri "http://localhost:5000/categories" -Method GET
`);

// JavaScript/Fetch Examples
console.log('\n🔷 JAVASCRIPT/FETCH EXAMPLES:');
console.log('==============================');

console.log(`
// 1. Create product with multiple categories
const createProduct = async () => {
  const response = await fetch('http://localhost:5000/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: "Elegant Earrings",
      price: 2200,
      categories: ["Earrings", "Gold Jewelry", "Party Wear"],
      stock: 12
    })
  });
  return response.json();
};

// 2. Filter products by category
const getByCategory = async (category) => {
  const response = await fetch(\`http://localhost:5000/products?category=\${encodeURIComponent(category)}\`);
  return response.json();
};

// Examples:
getByCategory('Best Seller');
getByCategory('Gold Jewelry');
getByCategory('Wedding Collection');
`);

// ===========================
// 3. CATEGORY MAPPING REFERENCE
// ===========================

console.log('\n🗂️ FRONTEND CATEGORY MAPPING:');
console.log('==============================');

const FRONTEND_MAPPINGS = {
  // Frontend data-category → Database category
  'bestseller': 'Best Seller',
  'necklace': 'Necklace',
  'bangle': 'Bangle', 
  'earrings': 'Earrings',
  'komor bondhoni': 'Komor Bondhoni',
  'tikli': 'Tikli',
  'khopar saaj': 'Khopar Saaj',
  'event': 'Event'
};

console.log('Frontend → Database Mapping:');
Object.entries(FRONTEND_MAPPINGS).forEach(([frontend, database]) => {
  console.log(`  "${frontend}" → "${database}"`);
});

// ===========================
// 4. TROUBLESHOOTING GUIDE
// ===========================

console.log('\n🔧 TROUBLESHOOTING GUIDE:');
console.log('=========================');

const TROUBLESHOOTING = {
  "Product not showing in category": [
    "Check if category name matches exactly (case sensitive)",
    "Verify product has 'categories' array or 'category' field",
    "Use URL encoding for categories with spaces (%20 for space)",
    "Check frontend category mapping in products-api.js"
  ],
  
  "Category showing as 'Jewelry'": [
    "Product missing primary 'category' field",
    "Update product with: { category: 'YourCategoryName' }",
    "Ensure getDisplayCategory() function is implemented",
    "Check if categories array is properly set"
  ],
  
  "Category count showing 0": [
    "Frontend category name doesn't match database category",
    "Check categoryMappings in updateCategoryCounts()",
    "Verify products have correct category structure",
    "Database category might use different case/spacing"
  ]
};

console.log('\nCommon Issues & Solutions:');
Object.entries(TROUBLESHOOTING).forEach(([issue, solutions]) => {
  console.log(`\n❌ ${issue}:`);
  solutions.forEach(solution => console.log(`   ✅ ${solution}`));
});

// ===========================
// 5. QUICK REFERENCE
// ===========================

console.log('\n\n📚 QUICK REFERENCE:');
console.log('==================');

console.log(`
🎯 MAIN CATEGORIES:
• Bangle, Necklace, Earrings, Tikli
• Komor Bondhoni, Khopar Saaj

🌟 SPECIAL COLLECTIONS: 
• Best Seller, Premium, Traditional
• Wedding Collection, Bridal

💎 MATERIAL TYPES:
• Gold Jewelry, Silver Jewelry  
• Diamond Jewelry, Pearl Jewelry

🎭 OCCASION TYPES:
• Daily Wear, Party Wear, Office Wear
• Casual Wear, Event

📋 KEY API ENDPOINTS:
• POST /products - Create with categories array
• PUT /products/{id} - Update categories 
• GET /products?category=X - Filter by category
• GET /products - All products (no duplicates)
• GET /categories - List all categories

⚠️ IMPORTANT NOTES:
• Use "categories" array for multiple categories
• First category becomes primary "category" field  
• URL encode category names with spaces
• Frontend uses data-category mapping
• Each product appears once in "All Products"
• Products appear in all assigned categories when filtered
`);

console.log('\n✨ Ready to use! Copy the examples above for your API requests.');

module.exports = { 
  HERITAGE_BENGAL_CATEGORIES, 
  API_EXAMPLES, 
  FRONTEND_MAPPINGS, 
  TROUBLESHOOTING 
};
