// Script to add products to multiple categories
// This demonstrates how to structure multiple categories for products

const sampleMultipleCategories = {
  // Example: A necklace that can be in multiple categories
  "product1": {
    name: "Heritage Gold Necklace",
    categories: ["Necklaces", "Gold Jewelry", "Traditional", "Wedding Collection"],
    // The first category becomes the primary category for backward compatibility
    primary_category: "Necklaces"
  },
  
  // Example: Earrings in multiple categories
  "product2": {
    name: "Diamond Drop Earrings", 
    categories: ["Earrings", "Diamond Jewelry", "Party Wear", "Premium Collection"],
    primary_category: "Earrings"
  },
  
  // Example: Bracelet in multiple categories
  "product3": {
    name: "Silver Charm Bracelet",
    categories: ["Bracelets", "Silver Jewelry", "Casual Wear", "Gift Items"],
    primary_category: "Bracelets"
  }
};

// Function to add multiple categories to a product via API
async function addMultipleCategoriesToProduct(productId, categories) {
  try {
    // Get the current product
    const response = await fetch(`http://localhost:5000/products/${productId}`);
    const product = await response.json();
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    // Update the product with new categories
    const updatedProduct = {
      ...product,
      categories: categories,
      category: categories[0] || product.category || 'Uncategorized' // Set first category as primary
    };
    
    // Send update request
    const updateResponse = await fetch(`http://localhost:5000/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedProduct)
    });
    
    if (updateResponse.ok) {
      console.log(`Successfully updated product ${productId} with categories:`, categories);
      return await updateResponse.json();
    } else {
      const errorData = await updateResponse.json();
      throw new Error(`Failed to update product: ${errorData.error}`);
    }
    
  } catch (error) {
    console.error('Error adding multiple categories to product:', error);
    throw error;
  }
}

// Function to create a new product with multiple categories
async function createProductWithMultipleCategories(productData, categories) {
  try {
    const newProduct = {
      ...productData,
      categories: categories,
      category: categories[0] || 'Uncategorized' // Set first category as primary
    };
    
    const response = await fetch('http://localhost:5000/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newProduct)
    });
    
    if (response.ok) {
      const createdProduct = await response.json();
      console.log('Successfully created product with multiple categories:', createdProduct);
      return createdProduct;
    } else {
      const errorData = await response.json();
      throw new Error(`Failed to create product: ${errorData.error}`);
    }
    
  } catch (error) {
    console.error('Error creating product with multiple categories:', error);
    throw error;
  }
}

// Function to get all available categories
async function getAllCategories() {
  try {
    const response = await fetch('http://localhost:5000/categories');
    const categories = await response.json();
    console.log('Available categories:', categories);
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

// Function to get products by category (shows how filtering works)
async function getProductsByCategory(category) {
  try {
    const response = await fetch(`http://localhost:5000/products?category=${encodeURIComponent(category)}`);
    const products = await response.json();
    console.log(`Products in category "${category}":`, products.length);
    return products;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
}

// Function to get all products (no duplicates)
async function getAllProducts() {
  try {
    const response = await fetch('http://localhost:5000/products');
    const products = await response.json();
    console.log('All products (no duplicates):', products.length);
    return products;
  } catch (error) {
    console.error('Error fetching all products:', error);
    throw error;
  }
}

// Example usage functions
async function demonstrateMultiCategoryAPI() {
  console.log('=== Multi-Category API Demonstration ===');
  
  try {
    // 1. Get all categories
    console.log('\n1. Getting all categories...');
    await getAllCategories();
    
    // 2. Get all products
    console.log('\n2. Getting all products...');
    await getAllProducts();
    
    // 3. Get products by specific category
    console.log('\n3. Getting products by category "Necklaces"...');
    await getProductsByCategory('Necklaces');
    
    console.log('\n4. Getting products by category "Gold Jewelry"...');
    await getProductsByCategory('Gold Jewelry');
    
  } catch (error) {
    console.error('Demo error:', error);
  }
}

// Sample product data for testing
const sampleProductData = {
  name: "Multi-Category Test Product",
  price: 2500,
  original_price: 3000,
  discount_percentage: 17,
  description: "A beautiful piece that fits multiple categories",
  image: "assets/placeholder.svg",
  stock: 10,
  features: ["Handcrafted", "Premium Quality", "Traditional Design"],
  care_instructions: ["Store in dry place", "Clean with soft cloth"],
  rating: 4.8,
  reviews_count: 15
};

console.log('Multiple Categories Structure Example:');
console.log(JSON.stringify(sampleMultipleCategories, null, 2));

console.log('\n=== How to use Multi-Category API ===');
console.log('1. Create product with multiple categories:');
console.log('   createProductWithMultipleCategories(productData, ["Category1", "Category2"])');
console.log('\n2. Add categories to existing product:');
console.log('   addMultipleCategoriesToProduct(productId, ["Category1", "Category2"])');
console.log('\n3. Get products by category (includes products from multiple categories):');
console.log('   getProductsByCategory("Category1")');
console.log('\n4. Get all products (no duplicates even if product is in multiple categories):');
console.log('   getAllProducts()');
console.log('\n5. Get all available categories:');
console.log('   getAllCategories()');

console.log('\n=== Key Features ===');
console.log('✅ Products can belong to multiple categories');
console.log('✅ When browsing "All Products", each item appears only once');
console.log('✅ When filtering by category, products appear in all relevant categories');
console.log('✅ Backward compatibility with single category field');
console.log('✅ First category in array becomes primary category');

// Uncomment to run demonstration
// demonstrateMultiCategoryAPI();

module.exports = {
  sampleMultipleCategories,
  sampleProductData,
  addMultipleCategoriesToProduct,
  createProductWithMultipleCategories,
  getAllCategories,
  getProductsByCategory,
  getAllProducts,
  demonstrateMultiCategoryAPI
};
