// Enhanced Product Details Manager
class ProductDetailsManager {
  constructor() {
    this.currentProduct = null;
    this.magnificationElements = null;
    this.resizeListener = null;
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

  // Cleanup method for when leaving the page
  destroy() {
    this.removeMagnificationElements();
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
      this.resizeListener = null;
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
    
    // Update product image with responsive handling for DETAILS page
    const productImage = document.getElementById('product-image');
    
    // Handle responsive images for product details page
    if (typeof product.image === 'object' && product.image !== null) {
      // New format - 4 different images (details_mobile, details_desktop, products_mobile, products_desktop)
      const isMobile = window.innerWidth < 1024; // lg breakpoint
      let imageSrc;
      
      if (isMobile) {
        imageSrc = product.image.details_mobile || 
                   product.image.details_desktop || 
                   product.image.products_mobile || 
                   product.image.products_desktop || 
                   product.image.mobile || 
                   product.image.desktop || 
                   'assets/placeholder.svg';
      } else {
        imageSrc = product.image.details_desktop || 
                   product.image.details_mobile || 
                   product.image.products_desktop || 
                   product.image.products_mobile || 
                   product.image.desktop || 
                   product.image.mobile || 
                   'assets/placeholder.svg';
      }
      
      productImage.src = imageSrc;
      
      // Add responsive image switching on resize
      const handleResize = () => {
        const newIsMobile = window.innerWidth < 1024;
        let newImageSrc;
        
        if (newIsMobile) {
          newImageSrc = product.image.details_mobile || 
                        product.image.details_desktop || 
                        product.image.products_mobile || 
                        product.image.products_desktop || 
                        product.image.mobile || 
                        product.image.desktop || 
                        'assets/placeholder.svg';
        } else {
          newImageSrc = product.image.details_desktop || 
                        product.image.details_mobile || 
                        product.image.products_desktop || 
                        product.image.products_mobile || 
                        product.image.desktop || 
                        product.image.mobile || 
                        'assets/placeholder.svg';
        }
        
        if (productImage.src !== newImageSrc) {
          productImage.src = newImageSrc;
        }
      };
      
      // Clean up previous listener if exists
      if (this.resizeListener) {
        window.removeEventListener('resize', this.resizeListener);
      }
      this.resizeListener = handleResize;
      window.addEventListener('resize', this.resizeListener);
      
    } else {
      // Legacy format - single image
      productImage.src = product.image || 'assets/placeholder.svg';
    }
    
    productImage.alt = product.name;
    productImage.onerror = () => {
      productImage.src = 'assets/placeholder.svg';
    };
    
    // Initialize image magnification after image is set
    // Wait for image to load before initializing magnification
    if (productImage.complete) {
      this.initImageMagnification();
    } else {
      productImage.onload = () => {
        this.initImageMagnification();
      };
    }
    
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

  // Image Magnification Feature for Product Details Page
  initImageMagnification() {
    const productImage = document.getElementById('product-image');
    const imageContainer = productImage.parentElement;
    
    // Remove any existing magnification elements
    this.removeMagnificationElements();
    
    // Add zoom controls
    this.addZoomControls(imageContainer, productImage);
    
    // Keep the hover magnification as backup
    this.addHoverMagnification(productImage, imageContainer);
  }
  
  addZoomControls(container, image) {
    // Create zoom controls container
    const zoomControls = document.createElement('div');
    zoomControls.className = 'zoom-controls';
    zoomControls.style.cssText = `
      position: absolute;
      bottom: 20px;
      right: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 20;
    `;
    
    // Zoom in button
    const zoomInBtn = document.createElement('button');
    zoomInBtn.innerHTML = `
      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8"/>
        <path d="M21 21l-4.35-4.35"/>
        <line x1="8" y1="11" x2="14" y2="11"/>
        <line x1="11" y1="8" x2="11" y2="14"/>
      </svg>
    `;
    zoomInBtn.className = 'zoom-btn zoom-in';
    zoomInBtn.title = 'Zoom In';
    
    // Zoom out button
    const zoomOutBtn = document.createElement('button');
    zoomOutBtn.innerHTML = `
      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8"/>
        <path d="M21 21l-4.35-4.35"/>
        <line x1="8" y1="11" x2="14" y2="11"/>
      </svg>
    `;
    zoomOutBtn.className = 'zoom-btn zoom-out';
    zoomOutBtn.title = 'Zoom Out';
    
    // Reset zoom button
    const resetBtn = document.createElement('button');
    resetBtn.innerHTML = `
      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M1 4v6h6"/>
        <path d="M23 20v-6h-6"/>
        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
      </svg>
    `;
    resetBtn.className = 'zoom-btn reset-zoom';
    resetBtn.title = 'Reset Zoom';
    
    // Style buttons
    [zoomInBtn, zoomOutBtn, resetBtn].forEach(btn => {
      btn.style.cssText = `
        width: 50px;
        height: 50px;
        background: rgba(139, 21, 56, 0.9);
        color: white;
        border: 2px solid #BFA14A;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      `;
      
      btn.addEventListener('mouseenter', () => {
        btn.style.background = 'rgba(191, 161, 74, 0.9)';
        btn.style.transform = 'scale(1.1)';
      });
      
      btn.addEventListener('mouseleave', () => {
        btn.style.background = 'rgba(139, 21, 56, 0.9)';
        btn.style.transform = 'scale(1)';
      });
    });
    
    // Zoom functionality
    let currentZoom = 1;
    const minZoom = 1;
    const maxZoom = 4;
    const zoomStep = 0.5;
    
    let panX = 0, panY = 0;
    let isDragging = false;
    let startX, startY;
    
    const applyZoom = () => {
      // Use CSS transform with proper ordering: translate first, then scale
      image.style.transform = `translate(${panX}px, ${panY}px) scale(${currentZoom})`;
      image.style.transformOrigin = 'center center';
      image.style.cursor = currentZoom > 1 ? 'grab' : 'default';
      
      // Update button states
      zoomInBtn.disabled = currentZoom >= maxZoom;
      zoomOutBtn.disabled = currentZoom <= minZoom;
      resetBtn.disabled = currentZoom === 1 && panX === 0 && panY === 0;
      
      [zoomInBtn, zoomOutBtn, resetBtn].forEach(btn => {
        if (btn.disabled) {
          btn.style.opacity = '0.5';
          btn.style.cursor = 'not-allowed';
        } else {
          btn.style.opacity = '1';
          btn.style.cursor = 'pointer';
        }
      });
    };
    
    // Button event listeners
    zoomInBtn.addEventListener('click', () => {
      if (currentZoom < maxZoom) {
        currentZoom = Math.min(maxZoom, currentZoom + zoomStep);
        applyZoom();
      }
    });
    
    zoomOutBtn.addEventListener('click', () => {
      if (currentZoom > minZoom) {
        currentZoom = Math.max(minZoom, currentZoom - zoomStep);
        if (currentZoom === 1) {
          panX = panY = 0; // Reset pan when fully zoomed out
        }
        applyZoom();
      }
    });
    
    resetBtn.addEventListener('click', () => {
      currentZoom = 1;
      panX = panY = 0;
      applyZoom();
    });
    
    // Pan functionality when zoomed
    image.addEventListener('mousedown', (e) => {
      if (currentZoom > 1) {
        isDragging = true;
        startX = e.clientX - panX;
        startY = e.clientY - panY;
        image.style.cursor = 'grabbing';
        e.preventDefault();
      }
    });
    
    document.addEventListener('mousemove', (e) => {
      if (isDragging && currentZoom > 1) {
        panX = e.clientX - startX;
        panY = e.clientY - startY;
        
        // Calculate dynamic pan limits based on zoom level and image size
        const imageRect = image.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Allow more movement when zoomed in more
        const maxPanX = (imageRect.width * (currentZoom - 1)) / 2;
        const maxPanY = (imageRect.height * (currentZoom - 1)) / 2;
        
        // Limit panning but allow generous movement
        panX = Math.max(-maxPanX, Math.min(maxPanX, panX));
        panY = Math.max(-maxPanY, Math.min(maxPanY, panY));
        
        applyZoom();
      }
    });
    
    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        if (currentZoom > 1) {
          image.style.cursor = 'grab';
        }
      }
    });
    
    // Touch support for mobile
    let touchStartX, touchStartY;
    image.addEventListener('touchstart', (e) => {
      if (currentZoom > 1 && e.touches.length === 1) {
        isDragging = true;
        touchStartX = e.touches[0].clientX - panX;
        touchStartY = e.touches[0].clientY - panY;
        e.preventDefault();
      }
    });
    
    image.addEventListener('touchmove', (e) => {
      if (isDragging && currentZoom > 1 && e.touches.length === 1) {
        panX = e.touches[0].clientX - touchStartX;
        panY = e.touches[0].clientY - touchStartY;
        
        // Calculate dynamic pan limits based on zoom level and image size
        const imageRect = image.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Allow more movement when zoomed in more
        const maxPanX = (imageRect.width * (currentZoom - 1)) / 2;
        const maxPanY = (imageRect.height * (currentZoom - 1)) / 2;
        
        // Limit panning but allow generous movement
        panX = Math.max(-maxPanX, Math.min(maxPanX, panX));
        panY = Math.max(-maxPanY, Math.min(maxPanY, panY));
        
        applyZoom();
        e.preventDefault();
      }
    });
    
    image.addEventListener('touchend', () => {
      isDragging = false;
    });
    
    // Mouse wheel zoom support
    image.addEventListener('wheel', (e) => {
      e.preventDefault();
      
      const zoomDirection = e.deltaY > 0 ? -1 : 1;
      const oldZoom = currentZoom;
      
      if (zoomDirection > 0 && currentZoom < maxZoom) {
        currentZoom = Math.min(maxZoom, currentZoom + zoomStep * 0.5);
      } else if (zoomDirection < 0 && currentZoom > minZoom) {
        currentZoom = Math.max(minZoom, currentZoom - zoomStep * 0.5);
      }
      
      // If zoom changed, apply it
      if (currentZoom !== oldZoom) {
        // Adjust pan position to zoom towards mouse cursor
        const rect = image.getBoundingClientRect();
        const mouseX = e.clientX - rect.left - rect.width / 2;
        const mouseY = e.clientY - rect.top - rect.height / 2;
        
        const zoomRatio = currentZoom / oldZoom;
        panX = (panX - mouseX) * zoomRatio + mouseX;
        panY = (panY - mouseY) * zoomRatio + mouseY;
        
        // Apply zoom limits to pan
        const maxPanX = (rect.width * (currentZoom - 1)) / 2;
        const maxPanY = (rect.height * (currentZoom - 1)) / 2;
        
        panX = Math.max(-maxPanX, Math.min(maxPanX, panX));
        panY = Math.max(-maxPanY, Math.min(maxPanY, panY));
        
        if (currentZoom === 1) {
          panX = panY = 0; // Reset pan when fully zoomed out
        }
        
        applyZoom();
      }
    }, { passive: false });
    
    // Add buttons to controls
    zoomControls.appendChild(zoomInBtn);
    zoomControls.appendChild(zoomOutBtn);
    zoomControls.appendChild(resetBtn);
    
    // Add controls to container
    container.style.position = 'relative';
    container.appendChild(zoomControls);
    
    // Store references for cleanup
    this.magnificationElements = {
      zoomControls,
      applyZoom: () => {
        currentZoom = 1;
        panX = panY = 0;
        image.style.transform = '';
        image.style.cursor = 'default';
      }
    };
    
    // Initial state
    applyZoom();
  }
  
  addHoverMagnification(productImage, imageContainer) {
    // Simplified hover magnification as backup - removed for now
    // Focus on zoom controls as primary magnification method
    console.log('Zoom controls added. Use the zoom buttons to examine jewelry details.');
  }

  removeMagnificationElements() {
    if (this.magnificationElements) {
      if (this.magnificationElements.lens) {
        this.magnificationElements.lens.remove();
      }
      if (this.magnificationElements.magnifiedContainer) {
        this.magnificationElements.magnifiedContainer.remove();
      }
      if (this.magnificationElements.imageObserver) {
        this.magnificationElements.imageObserver.disconnect();
      }
      if (this.magnificationElements.zoomControls) {
        this.magnificationElements.zoomControls.remove();
      }
      if (this.magnificationElements.applyZoom) {
        this.magnificationElements.applyZoom(); // Reset any zoom
      }
      this.magnificationElements = null;
    }
    
    // Remove any existing elements
    document.querySelectorAll('.magnification-lens, .magnified-view, .zoom-controls').forEach(el => el.remove());
    
    // Reset any transforms on product image
    const productImage = document.getElementById('product-image');
    if (productImage) {
      productImage.style.transform = '';
      productImage.style.cursor = 'default';
    }
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

    // Get appropriate image for cart (prefer smaller products page images for cart)
    const isMobile = window.innerWidth < 1024;
    let cartImage = 'assets/placeholder.svg';
    
    if (typeof this.currentProduct.image === 'string') {
      cartImage = this.currentProduct.image;
    } else if (typeof this.currentProduct.image === 'object' && this.currentProduct.image !== null) {
      if (isMobile) {
        cartImage = this.currentProduct.image.products_mobile || 
                    this.currentProduct.image.products_desktop || 
                    this.currentProduct.image.details_mobile || 
                    this.currentProduct.image.details_desktop || 
                    this.currentProduct.image.mobile || 
                    this.currentProduct.image.desktop || 
                    'assets/placeholder.svg';
      } else {
        cartImage = this.currentProduct.image.products_desktop || 
                    this.currentProduct.image.products_mobile || 
                    this.currentProduct.image.details_desktop || 
                    this.currentProduct.image.details_mobile || 
                    this.currentProduct.image.desktop || 
                    this.currentProduct.image.mobile || 
                    'assets/placeholder.svg';
      }
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
        image: cartImage,
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
    
    container.innerHTML = products.map(product => {
      // Get appropriate image for related products (using products page sizes)
      const isMobile = window.innerWidth < 1024;
      let imageSrc = 'assets/placeholder.svg';
      
      if (typeof product.image === 'string') {
        imageSrc = product.image;
      } else if (typeof product.image === 'object' && product.image !== null) {
        if (isMobile) {
          imageSrc = product.image.products_mobile || 
                     product.image.products_desktop || 
                     product.image.details_mobile || 
                     product.image.details_desktop || 
                     product.image.mobile || 
                     product.image.desktop || 
                     'assets/placeholder.svg';
        } else {
          imageSrc = product.image.products_desktop || 
                     product.image.products_mobile || 
                     product.image.details_desktop || 
                     product.image.details_mobile || 
                     product.image.desktop || 
                     product.image.mobile || 
                     'assets/placeholder.svg';
        }
      }
      
      return `
      <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div class="aspect-square bg-heritage-cream">
          <picture>
            <source media="(max-width: 1023px)" srcset="${typeof product.image === 'object' && product.image ? (product.image.products_mobile || product.image.products_desktop || product.image.details_mobile || product.image.details_desktop || product.image.mobile || product.image.desktop || 'assets/placeholder.svg') : (product.image || 'assets/placeholder.svg')}">
            <source media="(min-width: 1024px)" srcset="${typeof product.image === 'object' && product.image ? (product.image.products_desktop || product.image.products_mobile || product.image.details_desktop || product.image.details_mobile || product.image.desktop || product.image.mobile || 'assets/placeholder.svg') : (product.image || 'assets/placeholder.svg')}">
            <img src="${imageSrc}" alt="${product.name}" 
                 class="w-full h-full object-cover"
                 onerror="this.src='assets/placeholder.svg'">
          </picture>
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
      `;
    }).join('');
  }
}

// Initialize the product details manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const productManager = new ProductDetailsManager();
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    productManager.destroy();
  });
  
  // Also cleanup when navigating away (for SPAs)
  window.addEventListener('pagehide', () => {
    productManager.destroy();
  });
});
