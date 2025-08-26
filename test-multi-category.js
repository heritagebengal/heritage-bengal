// Simple test script for multi-category functionality
const fetch = require('node-fetch');

async function testMultiCategoryAPI() {
    try {
        console.log('Testing Multi-Category API...\n');

        // Test 1: Get all categories
        console.log('1. Testing /categories endpoint...');
        const categoriesResponse = await fetch('http://localhost:5000/categories');
        const categories = await categoriesResponse.json();
        console.log('Categories:', categories);

        // Test 2: Get all products
        console.log('\n2. Testing /products endpoint...');
        const productsResponse = await fetch('http://localhost:5000/products');
        const products = await productsResponse.json();
        console.log(`Found ${products.length} products`);
        if (products.length > 0) {
            console.log('First product categories:', products[0].categories || 'No categories array');
        }

        // Test 3: Create a test product with multiple categories
        console.log('\n3. Creating test product with multiple categories...');
        const testProduct = {
            name: "Multi-Category Test Necklace",
            price: 2500,
            original_price: 3000,
            discount_percentage: 17,
            description: "A beautiful necklace for testing multi-category functionality",
            categories: ["Necklaces", "Gold Jewelry", "Traditional", "Wedding Collection"],
            image: "assets/placeholder.svg",
            stock: 10,
            features: ["Handcrafted", "Traditional Design"],
            rating: 4.8
        };

        const createResponse = await fetch('http://localhost:5000/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testProduct)
        });

        if (createResponse.ok) {
            const createdProduct = await createResponse.json();
            console.log('✅ Product created successfully with ID:', createdProduct._id);
            console.log('   Categories:', createdProduct.categories);
            console.log('   Primary category:', createdProduct.category);

            // Test 4: Filter by specific category
            console.log('\n4. Testing category filtering...');
            const filterResponse = await fetch('http://localhost:5000/products?category=Necklaces');
            const filteredProducts = await filterResponse.json();
            console.log(`Found ${filteredProducts.length} products in "Necklaces" category`);

            const goldResponse = await fetch('http://localhost:5000/products?category=Gold%20Jewelry');
            const goldProducts = await goldResponse.json();
            console.log(`Found ${goldProducts.length} products in "Gold Jewelry" category`);

            // Test 5: Get updated categories list
            console.log('\n5. Getting updated categories...');
            const updatedCategoriesResponse = await fetch('http://localhost:5000/categories');
            const updatedCategories = await updatedCategoriesResponse.json();
            console.log('Updated categories:', updatedCategories);

        } else {
            const error = await createResponse.json();
            console.log('❌ Failed to create product:', error);
        }

    } catch (error) {
        console.error('Test error:', error.message);
    }
}

// Run the test
testMultiCategoryAPI();
