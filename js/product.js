// Enhanced Product Details Manager
class ProductDetailsManager {
  constructor() {
    this.currentProduct = null;
    this.magnificationElements = null;
    this.resizeListener = null;
    this.currentImageIndex = 0;
    this.productImages = [];
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

  // Function to get the display category for a product
  getDisplayCategory(product) {
    // Priority: categories array first, then single category, then default
    if (product.categories && Array.isArray(product.categories) && product.categories.length > 0) {
      return product.categories.join(', '); // Show all categories on details page
    } else if (product.category) {
      return product.category;
    } else {
      return 'Jewelry'; // Default fallback
    }
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
    
    // Update product image with responsive handling and multi-image support
    this.setupProductImages();
    
    // Update product information
    document.getElementById('product-name').textContent = product.name;
    
    // Handle pricing with discount support
    const priceContainer = document.getElementById('product-price');
    this.renderProductPrice(product, priceContainer);
    
    document.getElementById('product-description').textContent = 
      product.description || 'Beautiful handcrafted jewelry piece inspired by Bengal\'s rich heritage.';
    document.getElementById('product-category').textContent = this.getDisplayCategory(product);
    
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
    
    // Update add to cart button state (will be overridden by quantity controls)
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    if (product.stock <= 0) {
      addToCartBtn.disabled = true;
      addToCartBtn.textContent = 'Out of Stock';
      addToCartBtn.className = addToCartBtn.className.replace('hover:bg-red-900', '') + ' opacity-50 cursor-not-allowed';
    }

    // Initialize quantity controls after product data is loaded
    setTimeout(() => {
      this.setupQuantityControls();
    }, 100);
  }

  setupProductImages() {
    const product = this.currentProduct;
    const productImage = document.getElementById('product-image');
    
    // Initialize images array
    this.productImages = [];
    this.currentImageIndex = 0;
    
    // Check if we have multiple images (array format)
    if (Array.isArray(product.image) && product.image.length > 0) {
      // New format - array of image URLs
      this.productImages = product.image.filter(img => img && img.trim() !== '');
      
      // Setup gallery navigation if multiple images
      if (this.productImages.length > 1) {
        this.setupImageGallery();
      }
      
    } else if (typeof product.image === 'string' && product.image && product.image.trim() !== '') {
      // Legacy format - single image string
      this.productImages = [product.image];
      
    } else {
      // Fallback to placeholder
      this.productImages = ['assets/placeholder.svg'];
    }
    
    // Set initial image
    this.setCurrentImage(0);
    
    // Initialize magnification once after image is set
    setTimeout(() => {
      this.initImageMagnification();
    }, 300);
  }

  getResponsiveImageSrc(imageSrc, isDetailsPage = true) {
    // Simplified - just return the image URL as-is
    if (!imageSrc || imageSrc.trim() === '') {
      return 'assets/placeholder.svg';
    }
    return imageSrc;
  }

  setupImageGallery() {
    const navControls = document.getElementById('image-nav-controls');
    const imageCounter = document.getElementById('image-counter');
    const thumbnailsContainer = document.getElementById('image-thumbnails');
    const prevBtn = document.getElementById('prev-image');
    const nextBtn = document.getElementById('next-image');
    
    if (this.productImages.length <= 1) {
      // Hide gallery controls for single image
      navControls.style.display = 'none';
      imageCounter.style.display = 'none';
      thumbnailsContainer.style.display = 'none';
      return;
    }
    
    // Show gallery controls for multiple images
    navControls.style.display = 'flex';
    imageCounter.style.display = 'block';
    thumbnailsContainer.style.display = 'grid';
    
    // Update counters
    document.getElementById('total-images').textContent = this.productImages.length;
    
    // Setup navigation event listeners
    prevBtn.addEventListener('click', () => this.previousImage());
    nextBtn.addEventListener('click', () => this.nextImage());
    
    // Setup keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.previousImage();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.nextImage();
      }
    });
    
    // Setup thumbnails
    this.createThumbnails();
  }

  createThumbnails() {
    const thumbnailsContainer = document.getElementById('image-thumbnails');
    
    thumbnailsContainer.innerHTML = this.productImages.map((imageSrc, index) => `
      <div class="aspect-square bg-heritage-cream rounded-lg overflow-hidden cursor-pointer thumbnail-image ${index === 0 ? 'active' : ''}" 
           data-index="${index}">
        <img src="${imageSrc}" alt="${this.currentProduct.name} - Image ${index + 1}" 
             class="w-full h-full object-cover" 
             onerror="this.src='assets/placeholder.svg'">
      </div>
    `).join('');
    
    // Add click event listeners to thumbnails
    thumbnailsContainer.querySelectorAll('.thumbnail-image').forEach((thumb, index) => {
      thumb.addEventListener('click', () => this.setCurrentImage(index));
    });
  }

  updateThumbnails() {
    const thumbnails = document.querySelectorAll('.thumbnail-image');
    thumbnails.forEach((thumb, index) => {
      const img = thumb.querySelector('img');
      img.src = this.productImages[index];
      
      // Update active state
      if (index === this.currentImageIndex) {
        thumb.classList.add('active');
      } else {
        thumb.classList.remove('active');
      }
    });
  }

  setCurrentImage(index) {
    if (index < 0 || index >= this.productImages.length) return;
    
    this.currentImageIndex = index;
    const productImage = document.getElementById('product-image');
    const currentIndexSpan = document.getElementById('current-image-index');
    const prevBtn = document.getElementById('prev-image');
    const nextBtn = document.getElementById('next-image');
    
    // Reset zoom when changing images (but don't remove magnification entirely)
    if (this.magnificationElements && this.magnificationElements.resetZoom) {
      this.magnificationElements.resetZoom();
    }
    
    // Add fade effect
    productImage.classList.add('image-fade-out');
    
    setTimeout(() => {
      // Update image source
      productImage.src = this.productImages[index];
      productImage.alt = `${this.currentProduct.name} - Image ${index + 1}`;
      
      // Error handling
      productImage.onerror = () => {
        productImage.src = 'assets/placeholder.svg';
      };
      
      // Remove fade effect
      productImage.classList.remove('image-fade-out');
      
      // Update counter
      if (currentIndexSpan) {
        currentIndexSpan.textContent = index + 1;
      }
      
      // Update navigation buttons
      if (prevBtn) prevBtn.disabled = index === 0;
      if (nextBtn) nextBtn.disabled = index === this.productImages.length - 1;
      
      // Update thumbnail active state
      document.querySelectorAll('.thumbnail-image').forEach((thumb, thumbIndex) => {
        if (thumbIndex === index) {
          thumb.classList.add('active');
        } else {
          thumb.classList.remove('active');
        }
      });
      
    }, 150);
  }

  previousImage() {
    if (this.currentImageIndex > 0) {
      this.setCurrentImage(this.currentImageIndex - 1);
    }
  }

  nextImage() {
    if (this.currentImageIndex < this.productImages.length - 1) {
      this.setCurrentImage(this.currentImageIndex + 1);
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

  renderProductPrice(product, container) {
    // Check if discount pricing is available
    const hasDiscount = product.original_price && product.discount_percentage && 
                       product.original_price > product.price && product.discount_percentage > 0;
    
    if (hasDiscount) {
      // Discount pricing display
      container.innerHTML = `
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-sm text-gray-500 line-through font-number">₹${product.original_price.toLocaleString()}</span>
            <span class="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">${product.discount_percentage}% off</span>
          </div>
          <div class="text-2xl font-bold text-heritage-gold font-number">₹${product.price.toLocaleString()}</div>
        </div>
      `;
    } else {
      // Regular pricing display
      container.innerHTML = `<span class="text-2xl font-bold text-heritage-gold font-number">₹${product.price.toLocaleString()}</span>`;
    }
  }

  // Image Magnification Feature for Product Details Page
  initImageMagnification() {
    const productImage = document.getElementById('product-image');
    const imageContainer = productImage.parentElement;
    
    // Remove any existing magnification elements
    this.removeMagnificationElements();
    
    // Add zoom controls only once - they will work for all images
    this.addZoomControls(imageContainer, productImage);
    
    // Keep the hover magnification as backup
    this.addHoverMagnification(productImage, imageContainer);
  }
  
  addZoomControls(container, image) {
    // Detect if we're on mobile
    const isMobile = window.innerWidth <= 768;
    
    // Create main controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'image-controls-container';
    controlsContainer.style.cssText = `
      position: absolute;
      ${isMobile ? 'bottom: 10px; right: 10px;' : 'bottom: 20px; right: 20px;'}
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: ${isMobile ? '10px' : '15px'};
      z-index: 20;
    `;
    
    // Create zoom controls section
    const zoomControls = document.createElement('div');
    zoomControls.className = 'zoom-controls';
    zoomControls.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: ${isMobile ? '6px' : '8px'};
    `;
    
    // Create pan controls section (will be shown only when zoomed)
    const panControls = document.createElement('div');
    panControls.className = 'pan-controls';
    panControls.style.cssText = `
      display: none;
      flex-direction: column;
      align-items: center;
      gap: ${isMobile ? '6px' : '8px'};
      padding: ${isMobile ? '8px' : '12px'};
      background: rgba(0, 0, 0, 0.85);
      border-radius: ${isMobile ? '8px' : '12px'};
      border: ${isMobile ? '1px' : '2px'} solid #BFA14A;
      backdrop-filter: blur(10px);
    `;
    
    // Create pan controls grid - responsive design
    const panGrid = document.createElement('div');
    panGrid.style.cssText = `
      display: grid;
      grid-template-columns: ${isMobile ? '25px 25px 25px' : '30px 30px 30px'};
      grid-template-rows: ${isMobile ? '25px 25px 25px' : '30px 30px 30px'};
      gap: ${isMobile ? '2px' : '3px'};
    `;
    
    // Pan Up button
    const panUpBtn = document.createElement('button');
    panUpBtn.innerHTML = `
      <svg width="${isMobile ? '12' : '14'}" height="${isMobile ? '12' : '14'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 15l7-7 7 7"></path>
      </svg>
    `;
    panUpBtn.className = 'pan-btn pan-up';
    panUpBtn.title = 'Pan Up';
    panUpBtn.style.cssText = `grid-column: 2; grid-row: 1;`;
    
    // Pan Left button
    const panLeftBtn = document.createElement('button');
    panLeftBtn.innerHTML = `
      <svg width="${isMobile ? '12' : '14'}" height="${isMobile ? '12' : '14'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"></path>
      </svg>
    `;
    panLeftBtn.className = 'pan-btn pan-left';
    panLeftBtn.title = 'Pan Left';
    panLeftBtn.style.cssText = `grid-column: 1; grid-row: 2;`;
    
    // Pan Right button
    const panRightBtn = document.createElement('button');
    panRightBtn.innerHTML = `
      <svg width="${isMobile ? '12' : '14'}" height="${isMobile ? '12' : '14'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"></path>
      </svg>
    `;
    panRightBtn.className = 'pan-btn pan-right';
    panRightBtn.title = 'Pan Right';
    panRightBtn.style.cssText = `grid-column: 3; grid-row: 2;`;
    
    // Pan Down button
    const panDownBtn = document.createElement('button');
    panDownBtn.innerHTML = `
      <svg width="${isMobile ? '12' : '14'}" height="${isMobile ? '12' : '14'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path>
      </svg>
    `;
    panDownBtn.className = 'pan-btn pan-down';
    panDownBtn.title = 'Pan Down';
    panDownBtn.style.cssText = `grid-column: 2; grid-row: 3;`;
    
    // Center indicator - responsive design
    const centerDot = document.createElement('div');
    centerDot.style.cssText = `
      grid-column: 2; 
      grid-row: 2;
      width: ${isMobile ? '4px' : '6px'};
      height: ${isMobile ? '4px' : '6px'};
      background: #BFA14A;
      border-radius: 50%;
      margin: auto;
      opacity: 0.7;
    `;
    
    // Zoom in button
    const zoomInBtn = document.createElement('button');
    zoomInBtn.innerHTML = `
      <svg width="${isMobile ? '18' : '20'}" height="${isMobile ? '18' : '20'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <svg width="${isMobile ? '18' : '20'}" height="${isMobile ? '18' : '20'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <svg width="${isMobile ? '18' : '20'}" height="${isMobile ? '18' : '20'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M1 4v6h6"/>
        <path d="M23 20v-6h-6"/>
        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
      </svg>
    `;
    resetBtn.className = 'zoom-btn reset-zoom';
    resetBtn.title = 'Reset Zoom';
    
    
    // Style zoom buttons with responsive sizing
    [zoomInBtn, zoomOutBtn, resetBtn].forEach(btn => {
      btn.style.cssText = `
        width: ${isMobile ? '40px' : '45px'};
        height: ${isMobile ? '40px' : '45px'};
        background: rgba(139, 21, 56, 0.9);
        color: white;
        border: ${isMobile ? '1.5px' : '2px'} solid #BFA14A;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
        box-shadow: 0 ${isMobile ? '3px 12px' : '4px 15px'} rgba(0, 0, 0, 0.2);
        touch-action: manipulation;
      `;
      
      btn.addEventListener('mouseenter', () => {
        btn.style.background = 'rgba(191, 161, 74, 0.9)';
        btn.style.transform = `scale(${isMobile ? '1.05' : '1.1'})`;
      });
      
      btn.addEventListener('mouseleave', () => {
        btn.style.background = 'rgba(139, 21, 56, 0.9)';
        btn.style.transform = 'scale(1)';
      });
      
      // Add touch feedback for mobile
      if (isMobile) {
        btn.addEventListener('touchstart', () => {
          btn.style.background = 'rgba(191, 161, 74, 0.9)';
          btn.style.transform = 'scale(0.95)';
        });
        
        btn.addEventListener('touchend', () => {
          setTimeout(() => {
            btn.style.background = 'rgba(139, 21, 56, 0.9)';
            btn.style.transform = 'scale(1)';
          }, 150);
        });
      }
    });
    
    // Style pan buttons with responsive sizing
    [panUpBtn, panLeftBtn, panRightBtn, panDownBtn].forEach(btn => {
      btn.style.cssText = btn.style.cssText + `
        width: ${isMobile ? '25px' : '30px'};
        height: ${isMobile ? '25px' : '30px'};
        background: rgba(139, 21, 56, 0.8);
        color: white;
        border: ${isMobile ? '1px' : '1px'} solid #BFA14A;
        border-radius: ${isMobile ? '4px' : '6px'};
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        touch-action: manipulation;
      `;
      
      btn.addEventListener('mouseenter', () => {
        btn.style.background = 'rgba(191, 161, 74, 0.9)';
        btn.style.transform = `scale(${isMobile ? '1.05' : '1.1'})`;
        btn.style.boxShadow = '0 3px 12px rgba(191, 161, 74, 0.4)';
      });
      
      btn.addEventListener('mouseleave', () => {
        btn.style.background = 'rgba(139, 21, 56, 0.8)';
        btn.style.transform = 'scale(1)';
        btn.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
      });
      
      // Add touch feedback for mobile
      if (isMobile) {
        btn.addEventListener('touchstart', () => {
          btn.style.background = 'rgba(191, 161, 74, 0.9)';
          btn.style.transform = 'scale(0.95)';
        });
        
        btn.addEventListener('touchend', () => {
          setTimeout(() => {
            btn.style.background = 'rgba(139, 21, 56, 0.8)';
            btn.style.transform = 'scale(1)';
          }, 150);
        });
      }
    });
    
    // Add pan controls to grid
    panGrid.appendChild(panUpBtn);
    panGrid.appendChild(panLeftBtn);
    panGrid.appendChild(centerDot);
    panGrid.appendChild(panRightBtn);
    panGrid.appendChild(panDownBtn);
    
    // Assemble pan controls (without title)
    panControls.appendChild(panGrid);
    
    // Add zoom buttons to zoom controls
    zoomControls.appendChild(zoomInBtn);
    zoomControls.appendChild(zoomOutBtn);
    zoomControls.appendChild(resetBtn);
    
    // Assemble main controls
    controlsContainer.appendChild(zoomControls);
    controlsContainer.appendChild(panControls);
    
    
    // Zoom functionality with mobile-optimized pan step
    let currentZoom = 1;
    const minZoom = 1;
    const maxZoom = 4;
    const zoomStep = 0.5;
    
    let panX = 0, panY = 0;
    const panStep = isMobile ? 40 : 60; // Smaller steps for mobile precision
    
    const applyZoom = () => {
      const currentImage = document.getElementById('product-image'); // Get current image dynamically
      // Use CSS transform with proper ordering: translate first, then scale
      currentImage.style.transform = `translate(${panX}px, ${panY}px) scale(${currentZoom})`;
      currentImage.style.transformOrigin = 'center center';
      currentImage.style.cursor = currentZoom > 1 ? 'move' : 'default';
      
      // Show/hide pan controls based on zoom level with smooth animation
      if (currentZoom > 1) {
        panControls.style.display = 'flex';
        // Small delay to ensure display is set before animation
        setTimeout(() => {
          panControls.style.opacity = '1';
          panControls.style.transform = 'translateY(0)';
        }, 10);
      } else {
        panControls.style.opacity = '0';
        panControls.style.transform = 'translateY(10px)';
        setTimeout(() => {
          panControls.style.display = 'none';
        }, 200);
      }
      
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
    
    // Pan functionality with improved limits
    const panImage = (direction) => {
      if (currentZoom <= 1) return; // Only pan when zoomed in
      
      switch (direction) {
        case 'up':
          panY += panStep;
          break;
        case 'down':
          panY -= panStep;
          break;
        case 'left':
          panX += panStep;
          break;
        case 'right':
          panX -= panStep;
          break;
      }
      
      // Calculate dynamic pan limits based on zoom level and image dimensions
      const currentImage = document.getElementById('product-image');
      const imageRect = currentImage.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      // Calculate how much the image extends beyond the container when zoomed
      const scaledWidth = imageRect.width;
      const scaledHeight = imageRect.height;
      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;
      
      // Calculate maximum pan distance (how far image can move before edge shows)
      const maxPanX = Math.max(0, (scaledWidth - containerWidth) / 2) + 50; // Extra margin
      const maxPanY = Math.max(0, (scaledHeight - containerHeight) / 2) + 50; // Extra margin
      
      // Apply limits with generous margins for better coverage
      panX = Math.max(-maxPanX, Math.min(maxPanX, panX));
      panY = Math.max(-maxPanY, Math.min(maxPanY, panY));
      
      applyZoom();
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
    
    // Pan button event listeners
    panUpBtn.addEventListener('click', () => panImage('up'));
    panDownBtn.addEventListener('click', () => panImage('down'));
    panLeftBtn.addEventListener('click', () => panImage('left'));
    panRightBtn.addEventListener('click', () => panImage('right'));
    
    
    // Mouse wheel zoom support (keep this for convenience)
    const wheelListener = (e) => {
      const currentImage = document.getElementById('product-image'); // Get current image dynamically
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
        const rect = currentImage.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left - rect.width / 2;
        const mouseY = e.clientY - rect.top - rect.height / 2;
        
        const zoomRatio = currentZoom / oldZoom;
        panX = (panX - mouseX) * zoomRatio + mouseX;
        panY = (panY - mouseY) * zoomRatio + mouseY;
        
        // Apply dynamic limits based on new zoom level
        const scaledWidth = rect.width;
        const scaledHeight = rect.height;
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;
        
        const maxPanX = Math.max(0, (scaledWidth - containerWidth) / 2) + 50;
        const maxPanY = Math.max(0, (scaledHeight - containerHeight) / 2) + 50;
        
        panX = Math.max(-maxPanX, Math.min(maxPanX, panX));
        panY = Math.max(-maxPanY, Math.min(maxPanY, panY));
        
        if (currentZoom === 1) {
          panX = panY = 0; // Reset pan when fully zoomed out
        }
        
        applyZoom();
      }
    };
    
    // Add wheel event listener
    image.addEventListener('wheel', wheelListener, { passive: false });
    
    // Add controls to container
    container.style.position = 'relative';
    container.appendChild(controlsContainer);
    
    // Add smooth transitions to pan controls with responsive design
    panControls.style.cssText += `
      opacity: 0;
      transform: translateY(${isMobile ? '8px' : '10px'});
      transition: all 0.2s ease;
    `;
    
    // Add resize listener to update mobile detection
    const resizeHandler = () => {
      const nowMobile = window.innerWidth <= 768;
      if (nowMobile !== isMobile) {
        // Re-initialize controls if mobile state changed
        this.removeMagnificationElements();
        setTimeout(() => this.initImageMagnification(), 100);
      }
    };
    
    window.addEventListener('resize', resizeHandler);
    
    // Store references for cleanup
    this.magnificationElements = {
      controlsContainer,
      zoomControls,
      panControls,
      image, // Store image reference for cleanup
      wheelListener,
      resizeHandler,
      resetZoom: () => {
        currentZoom = 1;
        panX = panY = 0;
        applyZoom();
      },
      applyZoom: () => {
        const currentImage = document.getElementById('product-image');
        if (currentImage) {
          currentZoom = 1;
          panX = panY = 0;
          currentImage.style.transform = '';
          currentImage.style.cursor = 'default';
          panControls.style.display = 'none';
        }
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
      if (this.magnificationElements.controlsContainer) {
        this.magnificationElements.controlsContainer.remove();
      }
      if (this.magnificationElements.zoomControls) {
        this.magnificationElements.zoomControls.remove();
      }
      if (this.magnificationElements.panControls) {
        this.magnificationElements.panControls.remove();
      }
      
      // Clean up wheel event listener
      const imageElement = this.magnificationElements.image;
      if (imageElement && this.magnificationElements.wheelListener) {
        imageElement.removeEventListener('wheel', this.magnificationElements.wheelListener);
      }
      
      // Clean up resize listener
      if (this.magnificationElements.resizeHandler) {
        window.removeEventListener('resize', this.magnificationElements.resizeHandler);
      }
      
      if (this.magnificationElements.applyZoom) {
        this.magnificationElements.applyZoom(); // Reset any zoom
      }
      this.magnificationElements = null;
    }
    
    // Remove any existing elements
    document.querySelectorAll('.magnification-lens, .magnified-view, .zoom-controls, .pan-controls, .image-controls-container').forEach(el => el.remove());
    
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

    // Buy now button
    document.getElementById('buy-now-btn').addEventListener('click', () => {
      this.buyNow();
    });

    // Quantity controls
    this.setupQuantityControls();
  }

  setupQuantityControls() {
    const quantityInput = document.getElementById('quantity-input');
    const quantityDisplay = document.getElementById('quantity-display');
    const decreaseBtn = document.getElementById('quantity-decrease');
    const increaseBtn = document.getElementById('quantity-increase');
    const stockIndicator = document.getElementById('stock-indicator');

    if (!quantityInput || !quantityDisplay || !decreaseBtn || !increaseBtn) {
      console.warn('Quantity controls not found');
      return;
    }

    // Update stock indicator and button states
    const updateQuantityControls = () => {
      const currentQuantity = parseInt(quantityInput.value) || 1;
      const maxStock = this.currentProduct ? this.currentProduct.stock : 0;

      // Update display
      quantityDisplay.textContent = currentQuantity;

      // Update decrease button state
      decreaseBtn.disabled = currentQuantity <= 1;

      // Update increase button state  
      increaseBtn.disabled = currentQuantity >= maxStock || maxStock <= 0;

      // Update stock indicator
      if (stockIndicator) {
        if (maxStock <= 0) {
          stockIndicator.textContent = 'Out of stock';
          stockIndicator.className = 'ml-4 text-sm text-red-500 font-medium';
        } else if (currentQuantity === maxStock) {
          stockIndicator.textContent = 'Maximum quantity reached';
          stockIndicator.className = 'ml-4 text-sm text-orange-500 font-medium';
        } else {
          stockIndicator.textContent = `${maxStock} available`;
          stockIndicator.className = 'ml-4 text-sm text-heritage-gold font-medium';
        }
      }

      // Update add to cart and buy now buttons
      const addToCartBtn = document.getElementById('add-to-cart-btn');
      const buyNowBtn = document.getElementById('buy-now-btn');
      
      if (maxStock <= 0) {
        if (addToCartBtn) {
          addToCartBtn.disabled = true;
          addToCartBtn.innerHTML = `
            <span class="flex items-center justify-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              Out of Stock
            </span>
          `;
        }
        if (buyNowBtn) {
          buyNowBtn.disabled = true;
          buyNowBtn.innerHTML = `
            <span class="flex items-center justify-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              Out of Stock
            </span>
          `;
        }
      } else {
        if (addToCartBtn) {
          addToCartBtn.disabled = false;
          addToCartBtn.innerHTML = `
            <span class="flex items-center justify-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13h10M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6"></path>
              </svg>
              Add to Cart
            </span>
          `;
        }
        if (buyNowBtn) {
          buyNowBtn.disabled = false;
          buyNowBtn.innerHTML = `
            <span class="flex items-center justify-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              Buy Now
            </span>
          `;
        }
      }
    };

    // Decrease quantity
    decreaseBtn.addEventListener('click', () => {
      const currentValue = parseInt(quantityInput.value) || 1;
      if (currentValue > 1) {
        quantityInput.value = currentValue - 1;
        updateQuantityControls();
      }
    });

    // Increase quantity
    increaseBtn.addEventListener('click', () => {
      const currentValue = parseInt(quantityInput.value) || 1;
      const maxStock = this.currentProduct ? this.currentProduct.stock : 0;
      if (currentValue < maxStock) {
        quantityInput.value = currentValue + 1;
        updateQuantityControls();
      }
    });

    // Initial update
    updateQuantityControls();
  }

  buyNow() {
    if (!this.currentProduct || this.currentProduct.stock <= 0) {
      this.showNotification('This product is currently out of stock.', 'error');
      return;
    }

    const quantityInput = document.getElementById('quantity-input');
    const quantity = parseInt(quantityInput?.value) || 1;

    if (quantity > this.currentProduct.stock) {
      this.showNotification('Requested quantity exceeds available stock.', 'error');
      return;
    }

    // Get appropriate image for checkout
    const isMobile = window.innerWidth < 1024;
    let productImage = 'assets/placeholder.svg';
    
    if (typeof this.currentProduct.image === 'string') {
      productImage = this.currentProduct.image;
    } else if (typeof this.currentProduct.image === 'object' && this.currentProduct.image !== null) {
      if (isMobile) {
        productImage = this.currentProduct.image.products_mobile || 
                      this.currentProduct.image.products_desktop || 
                      this.currentProduct.image.details_mobile || 
                      this.currentProduct.image.details_desktop || 
                      this.currentProduct.image.mobile || 
                      this.currentProduct.image.desktop || 
                      'assets/placeholder.svg';
      } else {
        productImage = this.currentProduct.image.products_desktop || 
                      this.currentProduct.image.products_mobile || 
                      this.currentProduct.image.details_desktop || 
                      this.currentProduct.image.details_mobile || 
                      this.currentProduct.image.desktop || 
                      this.currentProduct.image.mobile || 
                      'assets/placeholder.svg';
      }
    }

    // Create a temporary cart with just this item
    const buyNowItem = {
      id: this.currentProduct._id,
      name: this.currentProduct.name,
      price: this.currentProduct.price,
      image: productImage,
      quantity: quantity
    };

    // Store the buy now item in localStorage for checkout
    localStorage.setItem('buyNowItem', JSON.stringify(buyNowItem));

    // Show confirmation and animate button
    this.animateBuyNow();

    // Navigate to checkout after short delay
    setTimeout(() => {
      window.location.href = 'checkout.html?buynow=true';
    }, 1000);
  }

  animateBuyNow() {
    const button = document.getElementById('buy-now-btn');
    const originalHTML = button.innerHTML;
    
    button.innerHTML = `
      <span class="flex items-center justify-center">
        <svg class="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        Processing...
      </span>
    `;
    
    this.showNotification('Redirecting to checkout...', 'success');
    
    setTimeout(() => {
      button.innerHTML = originalHTML;
    }, 1000);
  }

  addToCart() {
    if (!this.currentProduct || this.currentProduct.stock <= 0) {
      this.showNotification('This product is currently out of stock.', 'error');
      return;
    }

    // Get quantity from quantity selector
    const quantityInput = document.getElementById('quantity-input');
    const quantity = parseInt(quantityInput?.value) || 1;

    if (quantity > this.currentProduct.stock) {
      this.showNotification('Requested quantity exceeds available stock.', 'error');
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
      cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 1) + quantity;
      this.showNotification(`Updated ${this.currentProduct.name} quantity in cart! (${quantity} added)`, 'success');
    } else {
      // Add new item to cart
      cart.push({
        id: this.currentProduct._id,
        name: this.currentProduct.name,
        price: this.currentProduct.price,
        image: cartImage,
        quantity: quantity
      });
      this.showNotification(`${this.currentProduct.name} added to cart! (Quantity: ${quantity})`, 'success');
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
