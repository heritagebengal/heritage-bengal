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
    this.handleURLParameters(); // Handle URL parameters for filtering and sorting
    this.setupEventListeners();
    this.renderProducts();
    this.updateCategoryCounts();
  }

  // Handle URL parameters for automatic filtering and sorting
  handleURLParameters() {
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
      this.applyCurrentFilters();
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
      btn.addEventListener('click', (e) => {
        const category = e.target.dataset.category;
        this.setActiveCategory(category);
        this.filterByCategory(category);
      });
    });

    // Sort dropdown
    document.getElementById('sort-select').addEventListener('change', (e) => {
      this.currentSort = e.target.value;
      this.applySorting();
    });

    // Price filter
    document.getElementById('apply-filter').addEventListener('click', () => {
      this.applyPriceFilter();
    });

    document.getElementById('clear-filter').addEventListener('click', () => {
      this.clearPriceFilter();
    });

    // Enter key on price inputs
    ['min-price', 'max-price'].forEach(id => {
      document.getElementById(id).addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.applyPriceFilter();
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

  filterByCategory(category) {
    if (category === 'all') {
      this.filteredProducts = [...this.allProducts];
    } else {
      this.filteredProducts = this.allProducts.filter(product => 
        product.category && product.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    this.applyCurrentFilters();
  }

  applyPriceFilter() {
    const minPrice = parseFloat(document.getElementById('min-price').value) || 0;
    const maxPrice = parseFloat(document.getElementById('max-price').value) || Infinity;
    
    this.priceFilter = { min: minPrice, max: maxPrice };
    this.applyCurrentFilters();
    this.updateActiveFilters();
  }

  clearPriceFilter() {
    document.getElementById('min-price').value = '';
    document.getElementById('max-price').value = '';
    this.priceFilter = { min: null, max: null };
    this.applyCurrentFilters();
    this.updateActiveFilters();
  }

  applyCurrentFilters() {
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
    this.applySorting();
  }

  applySorting() {
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
    
    this.renderProducts();
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
    const categories = ['all', 'bestseller', 'necklace', 'bangle', 'earrings', 'komor bondhoni', 'tikli', 'khopar saaj'];
    
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

  renderProducts() {
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
    
    grid.innerHTML = this.filteredProducts.map(product => `
      <div class="product-card bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div class="relative">
          <img src="${product.image || 'assets/placeholder.svg'}" alt="${product.name}" 
               class="w-full h-48 object-cover"
               onerror="this.src='assets/placeholder.svg'">
          <div class="absolute top-3 right-3">
            <span class="bg-heritage-red text-white px-2 py-1 rounded-full text-xs font-bold">
              ${product.category || 'Jewelry'}
            </span>
          </div>
        </div>
        
        <div class="p-6">
          <h3 class="text-lg font-bold text-heritage-red mb-2 line-clamp-2">${product.name}</h3>
          <p class="text-sm text-gray-600 mb-3 line-clamp-2">${product.description || 'Beautiful handcrafted jewelry piece.'}</p>
          
          <div class="flex items-center justify-between mb-4">
            <span class="text-2xl font-bold text-heritage-gold">₹${product.price.toLocaleString()}</span>
            <span class="text-sm text-heritage-red ${product.stock > 0 ? '' : 'text-red-500'}">
              ${product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>
          
          <div class="flex gap-2">
            <a href="product-details.html?id=${product._id}" 
               class="flex-1 bg-heritage-gold text-heritage-red py-2 px-4 rounded-lg hover:bg-heritage-light-gold transition-colors text-center text-sm font-medium">
              View Details
            </a>
            <button onclick="addToCart('${product._id}', '${product.name}', ${product.price}, '${product.image || ''}')" 
                    class="flex-1 bg-heritage-red text-white py-2 px-4 rounded-lg hover:bg-red-900 transition-colors text-sm font-medium ${product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}"
                    ${product.stock <= 0 ? 'disabled' : ''}>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    `).join('');
    
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
}

// Initialize the product manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ProductManager();
});
