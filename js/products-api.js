// Enhanced Products API with filtering, sorting, and categories
class ProductManager {
  constructor() {
    this.allProducts = [];
    this.filteredProducts = [];
    this.currentCategory = 'all';
    this.currentSort = 'name-asc';
    this.priceFilter = { min: null, max: null };
    this.init();
  }

  async init() {
    await this.fetchProducts();
    await this.handleURLParameters(); // Handle URL parameters for filtering and sorting
    this.setupEventListeners();
    await this.renderProducts();
    this.updateCategoryCounts();
  }

  // Handle URL parameters for automatic filtering and sorting
  async handleURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Handle price filtering
    const minPrice = urlParams.get('minPrice');
    const maxPrice = urlParams.get('maxPrice');
    const sort = urlParams.get('sort');
    
    if (minPrice !== null || maxPrice !== null) {
      // Set price filter values
      if (minPrice !== null) {
        this.priceFilter.min = parseFloat(minPrice);
        document.getElementById('min-price').value = minPrice;
      }
      if (maxPrice !== null) {
        this.priceFilter.max = parseFloat(maxPrice);
        document.getElementById('max-price').value = maxPrice;
      }
      
      // Apply price filtering
      await this.applyCurrentFilters();
    }
    
    // Handle sorting
    if (sort) {
      this.currentSort = sort;
      const sortSelect = document.getElementById('sort-select');
      if (sortSelect) {
        sortSelect.value = sort;
      }
    }
  }

  async fetchProducts() {
    const grid = document.getElementById('products-container');
    const loadingState = document.getElementById('loading-state');
    const noProductsState = document.getElementById('no-products-state');
    
    try {
      loadingState.style.display = 'block';
      noProductsState.style.display = 'none';
      
      const res = await fetch('/products');
      const products = await res.json();
      
      if (!Array.isArray(products)) {
        throw new Error('Invalid response format');
      }
      
      this.allProducts = products;
      this.filteredProducts = [...products];
      
      console.log('Loaded products:', products.length);
      
    } catch (err) {
      console.error('Error loading products:', err);
      grid.innerHTML = '<div class="col-span-full text-center py-8 text-heritage-red">Error loading products. Please try again.</div>';
    } finally {
      loadingState.style.display = 'none';
    }
  }

  setupEventListeners() {
    // Category buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const category = e.target.dataset.category;
        this.setActiveCategory(category);
        await this.filterByCategory(category);
      });
    });

    // Sort dropdown
    document.getElementById('sort-select').addEventListener('change', async (e) => {
      this.currentSort = e.target.value;
      await this.applySorting();
    });

    // Price filter
    document.getElementById('apply-filter').addEventListener('click', async () => {
      await this.applyPriceFilter();
    });

    document.getElementById('clear-filter').addEventListener('click', async () => {
      await this.clearPriceFilter();
    });

    // Enter key on price inputs
    ['min-price', 'max-price'].forEach(id => {
      document.getElementById(id).addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
          await this.applyPriceFilter();
        }
      });
    });
  }

  setActiveCategory(category) {
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.classList.remove('active', 'bg-heritage-red', 'text-white');
      btn.classList.add('text-heritage-red');
    });
    
    const activeBtn = document.querySelector(`[data-category="${category}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active', 'bg-heritage-red', 'text-white');
      activeBtn.classList.remove('text-heritage-red');
    }
    
    this.currentCategory = category;
  }

  async filterByCategory(category) {
    if (category === 'all') {
      this.filteredProducts = [...this.allProducts];
    } else {
      this.filteredProducts = this.allProducts.filter(product => 
        product.category && product.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    await this.applyCurrentFilters();
  }

  async applyPriceFilter() {
    const minPrice = parseFloat(document.getElementById('min-price').value) || 0;
    const maxPrice = parseFloat(document.getElementById('max-price').value) || Infinity;
    
    this.priceFilter = { min: minPrice, max: maxPrice };
    await this.applyCurrentFilters();
    this.updateActiveFilters();
  }

  async clearPriceFilter() {
    document.getElementById('min-price').value = '';
    document.getElementById('max-price').value = '';
    this.priceFilter = { min: null, max: null };
    await this.applyCurrentFilters();
    this.updateActiveFilters();
  }

  async applyCurrentFilters() {
    let products = [...this.filteredProducts];
    
    // Apply price filter
    if (this.priceFilter.min !== null || this.priceFilter.max !== null) {
      const min = this.priceFilter.min || 0;
      const max = this.priceFilter.max || Infinity;
      products = products.filter(product => 
        product.price >= min && product.price <= max
      );
    }
    
    this.filteredProducts = products;
    await this.applySorting();
  }

  async applySorting() {
    const [sortBy, order] = this.currentSort.split('-');
    
    this.filteredProducts.sort((a, b) => {
      let valueA, valueB;
      
      if (sortBy === 'name') {
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
      } else if (sortBy === 'price') {
        valueA = a.price;
        valueB = b.price;
      }
      
      if (order === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
    
    await this.renderProducts();
  }

  updateActiveFilters() {
    const filterText = [];
    
    if (this.currentCategory !== 'all') {
      filterText.push(`Category: ${this.currentCategory}`);
    }
    
    if (this.priceFilter.min !== null || this.priceFilter.max !== null) {
      const min = this.priceFilter.min || 0;
      const max = this.priceFilter.max || '∞';
      filterText.push(`Price: ₹${min} - ₹${max}`);
    }
    
    document.getElementById('active-filters').textContent = 
      filterText.length > 0 ? `Filters: ${filterText.join(', ')}` : '';
  }

  updateCategoryCounts() {
    const categories = ['all', 'bestseller', 'necklace', 'bangle', 'earrings', 'komor bondhoni', 'tikli', 'khopar saaj', 'event'];
    
    categories.forEach(category => {
      let count;
      if (category === 'all') {
        count = this.allProducts.length;
      } else {
        count = this.allProducts.filter(product => 
          product.category && product.category.toLowerCase() === category.toLowerCase()
        ).length;
      }
      
      const btn = document.querySelector(`[data-category="${category}"]`);
      if (btn) {
        const countSpan = btn.querySelector('.category-count');
        if (countSpan) {
          countSpan.textContent = `(${count})`;
        }
      }
    });
  }

  // Function to check if image exists and return appropriate src
  async checkImageExists(imagePath) {
    return new Promise((resolve) => {
      if (!imagePath || imagePath.trim() === '' || imagePath === 'assets/placeholder.svg') {
        resolve('assets/placeholder.svg');
        return;
      }
      
      const img = new Image();
      img.onload = () => resolve(imagePath);
      img.onerror = () => resolve('assets/placeholder.svg');
      img.src = imagePath;
    });
  }

  async renderProducts() {
    const grid = document.getElementById('products-container');
    const productCount = document.getElementById('product-count');
    const noProductsState = document.getElementById('no-products-state');
    
    // Update product count
    productCount.textContent = this.filteredProducts.length;
    
    if (this.filteredProducts.length === 0) {
      grid.innerHTML = '';
      noProductsState.style.display = 'block';
      return;
    }
    
    noProductsState.style.display = 'none';
    
    // Process products and check images
    const productCards = await Promise.all(this.filteredProducts.map(async (product) => {
      // Get appropriate image based on screen size for PRODUCTS page
      const isMobile = window.innerWidth < 1024; // lg breakpoint
      let imageSrc = 'assets/placeholder.svg';
      
      // Debug logging
      console.log('Product:', product.name, 'Image type:', typeof product.image, 'Image value:', product.image);
      
      if (typeof product.image === 'string' && product.image && product.image.trim() !== '' && product.image !== 'assets/placeholder.svg') {
        // Legacy format - single image (only if not empty and not already placeholder)
        imageSrc = product.image;
      } else if (typeof product.image === 'object' && product.image !== null) {
        // New format - 4 different images
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
      
      // Ensure we always have a valid image source
      if (!imageSrc || imageSrc.trim() === '') {
        imageSrc = 'assets/placeholder.svg';
      }
      
      // Check if image actually exists
      const validImageSrc = await this.checkImageExists(imageSrc);
      
      console.log('Final imageSrc for', product.name, ':', validImageSrc);
      
      return `
      <div class="product-card bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
           onclick="navigateToProduct('${product._id}', event)">
        <div class="relative">
          <img src="${validImageSrc}" alt="${product.name}" 
               class="w-full h-48 object-cover"
               onerror="console.log('Image failed to load for ${product.name}:', this.src); this.onerror=null; this.src='assets/placeholder.svg';"
               onload="console.log('Image loaded successfully for ${product.name}:', this.src);">
          <div class="absolute top-3 right-3">
            <span class="bg-heritage-red text-white px-2 py-1 rounded-full text-xs font-bold">
              ${product.category || 'Jewelry'}
            </span>
          </div>
        </div>
        
        <div class="p-4">
          <h3 class="text-xs sm:text-sm font-bold text-heritage-red mb-2 min-h-[2.5rem] flex items-start leading-tight" title="${product.name}">${product.name}</h3>
          
          <div class="flex items-center justify-between mb-3">
            ${this.renderProductPrice(product)}
            <span class="text-xs text-heritage-red stock-text-mobile ${product.stock > 0 ? '' : 'text-red-500'}">
              ${product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>
          
          <div class="flex justify-center">
            <button onclick="addToCartFromProduct('${product._id}', '${product.name}', ${product.price}, '${validImageSrc}', event)" 
                    class="w-full bg-heritage-red text-white py-2 px-3 rounded-lg hover:bg-red-900 transition-colors text-xs font-medium ${product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}"
                    ${product.stock <= 0 ? 'disabled' : ''}>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
      `;
    }));
    
    grid.innerHTML = productCards.join('');
    
    // Animate cards
    const cards = grid.querySelectorAll('.product-card');
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
        card.style.transition = 'all 0.3s ease';
      }, index * 100);
    });
    
    this.updateActiveFilters();
  }

  renderProductPrice(product) {
    // For products page, only show the current price
    return `<span class="text-base sm:text-lg font-bold text-heritage-gold font-number">₹${product.price.toLocaleString()}</span>`;
  }
}

// Global functions for product navigation and cart management
function navigateToProduct(productId, event) {
  // Don't navigate if the click was on the add to cart button
  if (event.target.closest('button')) {
    return;
  }
  
  window.location.href = `product-details.html?id=${productId}`;
}

function addToCartFromProduct(productId, productName, price, imageSrc, event) {
  // Stop event propagation to prevent navigation
  event.stopPropagation();
  
  // Call the existing addToCart function
  if (typeof addToCart === 'function') {
    addToCart(productId, productName, price, imageSrc);
  } else {
    // Fallback implementation
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if item already exists
    const existingItemIndex = cart.findIndex(item => item.id === productId);
    
    if (existingItemIndex >= 0) {
      // Update quantity of existing item
      cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 1) + 1;
    } else {
      // Add new item to cart
      cart.push({
        id: productId,
        name: productName,
        price: price,
        image: imageSrc,
        quantity: 1
      });
    }
    
    // Save cart
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Show notification if function exists
    if (typeof showCartPopup === 'function') {
      showCartPopup(`${productName} added to cart!`);
    }
    
    // Update cart count if function exists
    if (typeof updateCartCount === 'function') {
      updateCartCount();
    }
  }
}

// Initialize the product manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ProductManager();
});
