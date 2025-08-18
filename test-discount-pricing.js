// Test script to add a product with discount pricing
const productWithDiscount = {
  "name": "Heritage Gold Necklace - Discounted",
  "description": "Beautiful handcrafted gold necklace with traditional Bengal design - Special offer!",
  "price": 15000,
  "original_price": 20000,
  "discount_percentage": 25,
  "category": "Necklaces",
  "stock": 5,
  "image": {
    "products_mobile": "https://via.placeholder.com/400x300/FFD700/8B0000?text=Gold+Necklace+Mobile",
    "products_desktop": "https://via.placeholder.com/600x400/FFD700/8B0000?text=Gold+Necklace+Desktop",
    "details_mobile": "https://via.placeholder.com/400x600/FFD700/8B0000?text=Gold+Necklace+Detail+Mobile",
    "details_desktop": "https://via.placeholder.com/800x600/FFD700/8B0000?text=Gold+Necklace+Detail+Desktop"
  },
  "features": [
    "22K Gold Plated",
    "Traditional Bengal Design",
    "Handcrafted Excellence",
    "Special Discount Offer"
  ],
  "care_instructions": [
    "Store in provided jewelry box",
    "Clean with soft cloth only",
    "Avoid water and chemicals",
    "Handle with care"
  ]
};

async function addDiscountProduct() {
  try {
    const response = await fetch('http://localhost:5000/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productWithDiscount)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Product with discount added successfully:', result);
    } else {
      const error = await response.text();
      console.error('❌ Error adding product:', error);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

// Run if executed directly (for Node.js)
if (typeof window === 'undefined') {
  addDiscountProduct();
}

// For browser testing
if (typeof window !== 'undefined') {
  console.log('Test product ready. Call addDiscountProduct() to add it.');
  window.addDiscountProduct = addDiscountProduct;
}
