// Script to add multiple images to existing products
// This demonstrates how to structure multiple images for products

const sampleMultipleImages = {
  // Example structure for a product with multiple images
  "product1": {
    images: [
      {
        id: "img1",
        details_desktop: "https://via.placeholder.com/800x800/4B0000/BFA14A?text=Main+View",
        details_mobile: "https://via.placeholder.com/600x600/4B0000/BFA14A?text=Main+Mobile",
        products_desktop: "https://via.placeholder.com/400x400/4B0000/BFA14A?text=Thumb+Desktop",
        products_mobile: "https://via.placeholder.com/300x300/4B0000/BFA14A?text=Thumb+Mobile",
        alt_text: "Main view of the jewelry piece",
        order: 1
      },
      {
        id: "img2", 
        details_desktop: "https://via.placeholder.com/800x800/8B0000/BFA14A?text=Side+View",
        details_mobile: "https://via.placeholder.com/600x600/8B0000/BFA14A?text=Side+Mobile",
        products_desktop: "https://via.placeholder.com/400x400/8B0000/BFA14A?text=Side+Desktop",
        products_mobile: "https://via.placeholder.com/300x300/8B0000/BFA14A?text=Side+Mobile",
        alt_text: "Side view showing details",
        order: 2
      },
      {
        id: "img3",
        details_desktop: "https://via.placeholder.com/800x800/6B0000/BFA14A?text=Back+View", 
        details_mobile: "https://via.placeholder.com/600x600/6B0000/BFA14A?text=Back+Mobile",
        products_desktop: "https://via.placeholder.com/400x400/6B0000/BFA14A?text=Back+Desktop",
        products_mobile: "https://via.placeholder.com/300x300/6B0000/BFA14A?text=Back+Mobile",
        alt_text: "Back view of the jewelry",
        order: 3
      },
      {
        id: "img4",
        details_desktop: "https://via.placeholder.com/800x800/2B0000/BFA14A?text=Detail+View",
        details_mobile: "https://via.placeholder.com/600x600/2B0000/BFA14A?text=Detail+Mobile", 
        products_desktop: "https://via.placeholder.com/400x400/2B0000/BFA14A?text=Detail+Desktop",
        products_mobile: "https://via.placeholder.com/300x300/2B0000/BFA14A?text=Detail+Mobile",
        alt_text: "Close-up detail view",
        order: 4
      }
    ]
  }
};

// Function to add multiple images to a product via API
async function addMultipleImagesToProduct(productId, images) {
  try {
    // Get the current product
    const response = await fetch(`/products/${productId}`);
    const product = await response.json();
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    // Update the product with new images
    const updatedProduct = {
      ...product,
      images: images
    };
    
    // Send update request
    const updateResponse = await fetch(`/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedProduct)
    });
    
    if (updateResponse.ok) {
      console.log(`Successfully updated product ${productId} with multiple images`);
      return await updateResponse.json();
    } else {
      throw new Error('Failed to update product');
    }
    
  } catch (error) {
    console.error('Error adding multiple images to product:', error);
    throw error;
  }
}

// Example usage:
// addMultipleImagesToProduct('your-product-id-here', sampleMultipleImages.product1.images);

console.log('Multiple Images Structure Example:');
console.log(JSON.stringify(sampleMultipleImages, null, 2));

console.log('\nHow to use:');
console.log('1. Replace placeholder URLs with actual image URLs');
console.log('2. Call addMultipleImagesToProduct(productId, imagesArray) to update a product');
console.log('3. Images will be shown in order on product details page');
console.log('4. First image will be used on products listing page');

module.exports = {
  sampleMultipleImages,
  addMultipleImagesToProduct
};
