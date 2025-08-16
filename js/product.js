// Enhanced Product Details Manager
class ProductDetailsManager {
  constructor() {
    this.currentProduct = null;
    this.init();
  }

  async init() {
    try {
      await this.loadProductDetails();
      this.setupEventListeners();
      this.loadRelatedProducts();
    } catch (error) {
      console.error('Error initializing product details:', error);
      this.showNotFoundState();
    }
  }

  getProductId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
  }

  async loadProductDetails() {
    const productId = this.getProductId();
    
    if (!productId) {
      this.showNotFoundState();
      return;
    }

    try {
      this.showLoadingState();
      
      // Fetch product from MongoDB API
      const response = await fetch(`/products`);
      const products = await response.json();
      
      // Find the specific product
      this.currentProduct = products.find(p => p._id === productId);
      
      if (!this.currentProduct) {
        this.showNotFoundState();
        return;
      }
      
      this.renderProductDetails();
      this.showProductContent();
      
    } catch (error) {
      console.error('Error loading product details:', error);
      this.showNotFoundState();
    }
  }

  showLoadingState() {
    document.getElementById('loading-state').style.display = 'block';
    document.getElementById('not-found-state').style.display = 'none';
    document.getElementById('product-content').style.display = 'none';
  }

  showNotFoundState() {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('not-found-state').style.display = 'block';
    document.getElementById('product-content').style.display = 'none';
  }

  showProductContent() {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('not-found-state').style.display = 'none';
    document.getElementById('product-content').style.display = 'block';
    
    // Add fade-in animation
    document.getElementById('product-content').classList.add('fade-in');
  }

  renderProductDetails() {
    const product = this.currentProduct;
    
    // Update page title
    document.title = `${product.name} - Heritage Bengal`;
    
    // Update breadcrumb
    document.getElementById('breadcrumb-product-name').textContent = product.name;
    
    // Update product image
    const productImage = document.getElementById('product-image');
    productImage.src = product.image || 'assets/placeholder.svg';
    productImage.alt = product.name;
    productImage.onerror = () => {
      productImage.src = 'assets/placeholder.svg';
    };
    
    // Update product information
    document.getElementById('product-name').textContent = product.name;
    document.getElementById('product-price').textContent = `₹${product.price.toLocaleString()}`;
    document.getElementById('product-description').textContent = 
      product.description || 'Beautiful handcrafted jewelry piece inspired by Bengal\'s rich heritage.';
    document.getElementById('product-category').textContent = product.category || 'Jewelry';
    
    // Update rating
    const rating = product.rating || 4.8;
    const reviewsCount = product.reviews_count || Math.floor(Math.random() * 50) + 10;
    const ratingElement = document.getElementById('product-rating');
    if (ratingElement) {
      const stars = '⭐'.repeat(Math.round(rating));
      ratingElement.innerHTML = `${stars} (${rating}/5) - ${reviewsCount} reviews`;
    }
    
    // Update stock information
    const stockElement = document.getElementById('product-stock');
    if (product.stock > 0) {
      stockElement.textContent = `${product.stock} in stock`;
      stockElement.className = 'text-heritage-gold text-sm font-medium';
    } else {
      stockElement.textContent = 'Out of stock';
      stockElement.className = 'text-red-500 text-sm font-medium';
    }
    
    // Update features section dynamically
    this.renderFeatures(product.features);
    
    // Update care instructions dynamically
    this.renderCareInstructions(product.care_instructions);
    
    // Update add to cart button state
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    if (product.stock <= 0) {
      addToCartBtn.disabled = true;
      addToCartBtn.textContent = 'Out of Stock';
      addToCartBtn.className = addToCartBtn.className.replace('hover:bg-red-900', '') + ' opacity-50 cursor-not-allowed';
    }
  }

  renderFeatures(features) {
    const featuresContainer = document.getElementById('product-features-list');
    
    // Default features based on category if none provided
    let defaultFeatures = [];
    const category = this.currentProduct.category?.toLowerCase() || '';
    
    if (category.includes('necklace')) {
      defaultFeatures = [
        'Handcrafted traditional Bengali necklace design',
        'Premium quality gold plating',
        'Adjustable chain length',
        'Perfect for festive occasions'
      ];
    } else if (category.includes('earrings')) {
      defaultFeatures = [
        'Traditional Bengali earring craftsmanship',
        'Lightweight and comfortable wear',
        'Secure hook closure',
        'Elegant design for all occasions'
      ];
    } else if (category.includes('bangle')) {
      defaultFeatures = [
        'Traditional Bengali bangle artistry',
        'Comfortable fit design',
        'Durable gold plating',
        'Perfect for daily and festive wear'
      ];
    } else if (category.includes('komor')) {
      defaultFeatures = [
        'Traditional Bengali waist chain design',
        'Adjustable length for perfect fit',
        'Intricate handcrafted details',
        'Perfect for traditional attire'
      ];
    } else if (category.includes('tikli')) {
      defaultFeatures = [
        'Traditional Bengali hair accessory',
        'Lightweight design',
        'Easy to wear and remove',
        'Perfect for cultural events'
      ];
    } else if (category.includes('khopar')) {
      defaultFeatures = [
        'Traditional Bengali bridal hair jewelry',
        'Intricate heritage design',
        'Premium craftsmanship',
        'Perfect for weddings and ceremonies'
      ];
    } else {
      defaultFeatures = [
        'Handcrafted with traditional Bengali techniques',
        'Premium quality gold plating',
        'Authentic heritage design',
        'Suitable for special occasions'
      ];
    }
    
    // Use provided features or default features
    const displayFeatures = (features && features.length > 0) ? features : defaultFeatures;
    
    featuresContainer.innerHTML = displayFeatures.map(feature => `
      <li class="flex items-center">
        <span class="w-2 h-2 bg-heritage-gold rounded-full mr-3"></span>
        ${feature}
      </li>
    `).join('');
  }

  renderCareInstructions(careInstructions) {
    const careContainer = document.getElementById('care-instructions-list');
    
    // Default care instructions if none provided
    const defaultCare = [
      'Store in a dry place away from moisture',
      'Clean with a soft, dry cloth',
      'Avoid contact with perfumes and chemicals',
      'Handle with care to maintain the finish'
    ];
    
    // Use provided care instructions or default ones
    const displayCare = (careInstructions && careInstructions.length > 0) ? careInstructions : defaultCare;
    
    careContainer.innerHTML = displayCare.map(instruction => `
      <li>• ${instruction}</li>
    `).join('');
  }

  setupEventListeners() {
    // Add to cart button
    document.getElementById('add-to-cart-btn').addEventListener('click', () => {
      this.addToCart();
    });
  }

  addToCart() {
    if (!this.currentProduct || this.currentProduct.stock <= 0) {
      return;
    }

    // Get existing cart
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if item already exists
    const existingItemIndex = cart.findIndex(item => item.id === this.currentProduct._id);
    
    if (existingItemIndex >= 0) {
      // Update quantity of existing item
      cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 1) + 1;
      this.showNotification(`Updated ${this.currentProduct.name} quantity in cart!`, 'success');
    } else {
      // Add new item to cart
      cart.push({
        id: this.currentProduct._id,
        name: this.currentProduct.name,
        price: this.currentProduct.price,
        image: this.currentProduct.image || 'assets/placeholder.svg',
        quantity: 1
      });
      this.showNotification(`${this.currentProduct.name} added to cart!`, 'success');
    }
    
    // Save cart
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    this.updateCartCount();
    
    // Animate add to cart button
    this.animateAddToCart();
  }

  animateAddToCart() {
    const button = document.getElementById('add-to-cart-btn');
    const originalText = button.innerHTML;
    
    button.innerHTML = `
      <span class="flex items-center justify-center">
        <svg class="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        Adding...
      </span>
    `;
    
    setTimeout(() => {
      button.innerHTML = `
        <span class="flex items-center justify-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          Added!
        </span>
      `;
      
      setTimeout(() => {
        button.innerHTML = originalText;
      }, 1000);
    }, 500);
  }

  showNotification(message, type = 'info') {
    // Use the existing cart popup system from main.js
    if (typeof showCartPopup === 'function') {
      showCartPopup(message);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification(message, type);
    } else {
      // Fallback notification
      const notification = document.createElement('div');
      notification.className = `fixed top-8 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 ${
        type === 'success' ? 'bg-green-500 text-white' : 
        type === 'error' ? 'bg-red-500 text-white' : 
        'bg-heritage-gold text-white'
      }`;
      notification.textContent = message;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
          if (notification.parentNode) {
            document.body.removeChild(notification);
          }
        }, 300);
      }, 3000);
    }
  }

  updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    const countElements = [
      document.getElementById('cart-count'),
      document.getElementById('cart-count-mobile')
    ];
    
    countElements.forEach(el => {
      if (el) {
        el.textContent = totalItems;
      }
    });
  }

  async loadRelatedProducts() {
    try {
      const response = await fetch('/products');
      const allProducts = await response.json();
      
      // Filter products from the same category, excluding current product
      let relatedProducts = allProducts.filter(p => 
        p._id !== this.currentProduct._id && 
        p.category === this.currentProduct.category
      );
      
      // If not enough related products in same category, add random products
      if (relatedProducts.length < 4) {
        const otherProducts = allProducts.filter(p => 
          p._id !== this.currentProduct._id && 
          !relatedProducts.find(rp => rp._id === p._id)
        );
        relatedProducts = [...relatedProducts, ...otherProducts];
      }
      
      // Limit to 4 products
      relatedProducts = relatedProducts.slice(0, 4);
      
      this.renderRelatedProducts(relatedProducts);
      
    } catch (error) {
      console.error('Error loading related products:', error);
    }
  }

  renderRelatedProducts(products) {
    const container = document.getElementById('related-products');
    
    if (products.length === 0) {
      container.innerHTML = '<p class="text-center text-heritage-red col-span-full">No related products found.</p>';
      return;
    }
    
    container.innerHTML = products.map(product => `
      <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div class="aspect-square bg-heritage-cream">
          <img src="${product.image || 'assets/placeholder.svg'}" alt="${product.name}" 
               class="w-full h-full object-cover"
               onerror="this.src='assets/placeholder.svg'">
        </div>
        <div class="p-4">
          <h4 class="font-bold text-heritage-red mb-2 line-clamp-2">${product.name}</h4>
          <p class="text-base sm:text-lg font-bold text-heritage-gold mb-3 font-number">₹${product.price.toLocaleString()}</p>
          <a href="product-details.html?id=${product._id}" 
             class="block w-full bg-heritage-red text-white py-2 px-4 rounded-lg hover:bg-red-900 transition-colors text-center text-sm font-medium">
            View Details
          </a>
        </div>
      </div>
    `).join('');
  }
}

// Initialize the product details manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ProductDetailsManager();
});
