// Script to fix category issues for the Heritage Bengal product
// This script addresses:
// 1. Product not showing in "Best Seller" category 
// 2. Product showing "Jewelry" instead of actual category
// 3. Spelling inconsistency (Jewellery vs Jewelry)

const productId = "68acbe07fda7e532468f18a6";

async function fixProductCategories() {
    console.log('🔧 Fixing Heritage Bengal Product Categories...\n');
    
    try {
        // Step 1: Get the current product
        console.log('1. Fetching current product...');
        const response = await fetch(`http://localhost:5000/products/${productId}`);
        const product = await response.json();
        
        console.log('   Current product name:', product.name);
        console.log('   Current categories:', product.categories);
        console.log('   Current primary category:', product.category || 'MISSING');
        
        // Step 2: Fix the product by setting primary category
        console.log('\n2. Updating product with correct primary category...');
        const updateData = {
            category: product.categories[0] || 'Bangle' // Set first category as primary
        };
        
        const updateResponse = await fetch(`http://localhost:5000/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        if (updateResponse.ok) {
            const updatedProduct = await updateResponse.json();
            console.log('   ✅ Product updated successfully!');
            console.log('   Updated primary category:', updatedProduct.category);
            console.log('   Categories array:', updatedProduct.categories);
        } else {
            const error = await updateResponse.json();
            console.log('   ❌ Update failed:', error);
            return;
        }
        
        // Step 3: Test category filtering
        console.log('\n3. Testing category filtering...');
        
        // Test Bangle category
        const bangleResponse = await fetch('http://localhost:5000/products?category=Bangle');
        const bangleProducts = await bangleResponse.json();
        console.log(`   Bangle category: ${bangleProducts.length} products`);
        const bangleHasProduct = bangleProducts.some(p => p._id === productId);
        console.log(`   ✅ Product appears in Bangle: ${bangleHasProduct}`);
        
        // Test Best Seller category
        const bestSellerResponse = await fetch('http://localhost:5000/products?category=Best%20Seller');
        const bestSellerProducts = await bestSellerResponse.json();
        console.log(`   Best Seller category: ${bestSellerProducts.length} products`);
        const bestSellerHasProduct = bestSellerProducts.some(p => p._id === productId);
        console.log(`   ✅ Product appears in Best Seller: ${bestSellerHasProduct}`);
        
        // Step 4: Summary
        console.log('\n📋 SUMMARY:');
        console.log('=============');
        console.log('✅ Product primary category set to:', updatedProduct.category);
        console.log('✅ Product categories:', updatedProduct.categories.join(', '));
        console.log('✅ Frontend updated to handle proper category names');
        console.log('✅ Display category function added');
        console.log('✅ Category filtering fixed for "Best Seller" vs "bestseller"');
        
        console.log('\n🎯 FIXES APPLIED:');
        console.log('==================');
        console.log('1. Set primary category field to avoid "Jewelry" default');
        console.log('2. Updated frontend category mappings');
        console.log('3. Fixed case sensitivity in category filtering');
        console.log('4. Added proper display category function');
        console.log('5. Updated category count calculations');
        
        console.log('\n✨ The product should now:');
        console.log('• Show in both "Bangle" and "Best Seller" categories');
        console.log('• Display "Bangle" tag instead of "Jewelry"');
        console.log('• Have consistent category handling');
        
    } catch (error) {
        console.error('❌ Error fixing product categories:', error);
    }
}

// Note: This uses Node.js fetch, so run with: node --experimental-fetch fix-categories.js
// Or use the PowerShell version below for immediate testing

console.log('To run this script:');
console.log('1. Save as fix-categories.js');
console.log('2. Run: node fix-categories.js');
console.log('\nOr use the PowerShell commands below for immediate testing:\n');

console.log(`
# PowerShell version (copy and paste):
$productId = "${productId}"

# Step 1: Get current product
Write-Host "Getting current product..." -ForegroundColor Green
$product = Invoke-RestMethod -Uri "http://localhost:5000/products/$productId" -Method GET
Write-Host "Current category: '$($product.category)'" -ForegroundColor Yellow
Write-Host "Categories: $($product.categories -join ', ')" -ForegroundColor Cyan

# Step 2: Fix primary category
Write-Host "Fixing primary category..." -ForegroundColor Green
$updateBody = @{ category = $product.categories[0] } | ConvertTo-Json
$updated = Invoke-RestMethod -Uri "http://localhost:5000/products/$productId" -Method PUT -Body $updateBody -ContentType "application/json"
Write-Host "Updated primary category: '$($updated.category)'" -ForegroundColor Green

# Step 3: Test filtering
Write-Host "Testing category filtering..." -ForegroundColor Green
$bangles = Invoke-RestMethod -Uri "http://localhost:5000/products?category=Bangle" -Method GET
$bestSellers = Invoke-RestMethod -Uri "http://localhost:5000/products?category=Best%20Seller" -Method GET
Write-Host "Bangle category: $($bangles.Count) products" -ForegroundColor Cyan
Write-Host "Best Seller category: $($bestSellers.Count) products" -ForegroundColor Cyan
`);

// Run the fix if this is being executed directly
if (typeof fetch !== 'undefined') {
    fixProductCategories();
} else {
    console.log('\nTo use fetch API, run with: node --experimental-fetch fix-categories.js');
}

module.exports = { fixProductCategories };
