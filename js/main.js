// Enhanced Main JS for Heritage Bengal with Tailwind CSS
document.addEventListener('DOMContentLoaded', function() {
  // Initialize cart count on page load
  updateCartCount();
  
  // Contact form submission
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      showNotification('Thank you for contacting Heritage Bengal! We will get back to you soon.', 'success');
      contactForm.reset();
    });
  }

  // Enhanced button animations with Tailwind classes
  document.querySelectorAll('button, a[class*="btn"], .cta-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      // Add pulse effect
      btn.classList.add('animate-pulse');
      setTimeout(() => btn.classList.remove('animate-pulse'), 300);
    });
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Fade-in animation on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe all fade-in elements
  document.querySelectorAll('.fade-in-up').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });

  // Enhanced hamburger menu functionality
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function() {
      navLinks.classList.toggle('hidden');
      hamburger.classList.toggle('active');
      
      // Enhanced hamburger animation
      const spans = hamburger.querySelectorAll('span');
      if (hamburger.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });
  }

  // Enhanced cart functionality
  window.addToCart = function(id, name, price, image) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
      existingItem.quantity += 1;
      showNotification(`Updated ${name} quantity in cart!`, 'success');
    } else {
      cart.push({ id, name, price, image, quantity: 1 });
      showNotification(`${name} added to cart!`, 'success');
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    animateBucket();
  };

  // Enhanced notification system
  window.showNotification = function(message, type = 'info') {
    const popup = document.getElementById('cart-popup');
    if (popup) {
      popup.textContent = message;
      popup.className = `fixed top-8 left-1/2 transform -translate-x-1/2 px-10 py-4 rounded-3xl text-xl shadow-lg z-50 transition-all duration-300 text-center ${
        type === 'success' ? 'bg-green-500 text-white' : 
        type === 'error' ? 'bg-red-500 text-white' : 
        'bg-heritage-gold text-white'
      }`;
      popup.style.display = 'block';
      popup.style.opacity = '1';
      popup.style.transform = 'translate(-50%, 0) scale(1)';
      
      setTimeout(() => {
        popup.style.opacity = '0';
        popup.style.transform = 'translate(-50%, -20px) scale(0.95)';
        setTimeout(() => {
          popup.style.display = 'none';
        }, 300);
      }, 3000);
    }
  };

  // Enhanced bucket animation
  window.animateBucket = function() {
    const bucket = document.getElementById('cart-bucket');
    const mobileBucket = document.getElementById('cart-bucket-mobile');
    
    [bucket, mobileBucket].forEach(el => {
      if (el) {
        el.style.transform = 'scale(1.2)';
        el.style.transition = 'transform 0.3s ease';
        setTimeout(() => {
          el.style.transform = 'scale(1)';
        }, 300);
      }
    });
  };

  // Update cart count function
  window.updateCartCount = function() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const countElements = [
      document.getElementById('cart-count'),
      document.getElementById('cart-count-mobile')
    ];
    
    countElements.forEach(el => {
      if (el) el.textContent = totalItems;
    });
  };

  // Enhanced scroll effects for parallax
  let lastScrollTop = 0;
  window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Parallax effect for hero sections
    const heroSections = document.querySelectorAll('section[style*="background-image"]');
    heroSections.forEach(section => {
      const offset = scrollTop * 0.5;
      section.style.backgroundPosition = `center ${offset}px`;
    });

    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  });

  // Product card hover effects
  document.querySelectorAll('.product-card, [class*="product"]').forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px) scale(1.02)';
      this.style.transition = 'all 0.3s ease';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });
});
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
});

// Enhanced cart functionality
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const cartCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);
  
  // Update desktop cart count
  const cartCountElement = document.getElementById('cart-count');
  if (cartCountElement) {
    cartCountElement.textContent = cartCount;
    // Add badge animation when count changes
    if (cartCount > 0) {
      cartCountElement.classList.add('animate-bounce');
      setTimeout(() => cartCountElement.classList.remove('animate-bounce'), 500);
    }
  }
  
  // Update mobile cart count
  const cartCountMobile = document.getElementById('cart-count-mobile');
  if (cartCountMobile) {
    cartCountMobile.textContent = cartCount;
    // Add badge animation when count changes
    if (cartCount > 0) {
      cartCountMobile.classList.add('animate-bounce');
      setTimeout(() => cartCountMobile.classList.remove('animate-bounce'), 500);
    }
  }
}

// Enhanced notification system
function showNotification(message, type = 'info') {
  // Remove existing notifications
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement('div');
  notification.className = `notification fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full`;
  
  // Set colors based on type
  const colors = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-black',
    info: 'bg-heritage-gold text-white'
  };
  
  notification.className += ` ${colors[type] || colors.info}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.classList.remove('translate-x-full');
  }, 100);
  
  // Auto remove after 4 seconds
  setTimeout(() => {
    notification.classList.add('translate-x-full');
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

// Enhanced addToCart function
window.addToCart = function(id, name, price, image) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  
  // Check if item already exists
  const existingItem = cart.find(item => item.id === id);
  if (existingItem) {
    existingItem.quantity = (existingItem.quantity || 1) + 1;
    showNotification(`Updated ${name} quantity in cart!`, 'info');
  } else {
    cart.push({id, name, price, image, quantity: 1});
    showNotification(`${name} added to cart!`, 'success');
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  animateCartIcon();
  updateCartCount();
}

// Enhanced cart icon animation
function animateCartIcon() {
  // Animate desktop cart icon
  const cartIcon = document.getElementById('cart-bucket');
  if (cartIcon) {
    cartIcon.classList.add('transform', 'scale-125', '-rotate-12');
    setTimeout(() => {
      cartIcon.classList.remove('transform', 'scale-125', '-rotate-12');
    }, 300);
  }
  
  // Animate mobile cart icon
  const cartIconMobile = document.getElementById('cart-bucket-mobile');
  if (cartIconMobile) {
    cartIconMobile.classList.add('transform', 'scale-125', '-rotate-12');
    setTimeout(() => {
      cartIconMobile.classList.remove('transform', 'scale-125', '-rotate-12');
    }, 300);
  }
}

// Enhanced fade-in animation with Intersection Observer
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('opacity-100', 'translate-y-0');
        entry.target.classList.remove('opacity-0', 'translate-y-8');
      }
    });
  }, observerOptions);

  // Observe all fade-in elements
  document.querySelectorAll('.fade-in-up').forEach(el => {
    el.classList.add('opacity-0', 'translate-y-8', 'transition-all', 'duration-700');
    observer.observe(el);
  });
}

// Initialize scroll animations when DOM is loaded
document.addEventListener('DOMContentLoaded', initScrollAnimations);

// Lazy loading for images
function initLazyLoading() {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('opacity-50');
        img.classList.add('opacity-100');
        imageObserver.unobserve(img);
      }
    });
  });

  document.querySelectorAll('img[data-src]').forEach(img => {
    img.classList.add('opacity-50', 'transition-opacity', 'duration-300');
    imageObserver.observe(img);
  });
}

// Enhanced search functionality (for future use)
function initSearch() {
  const searchInput = document.querySelector('#search-input');
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', function(e) {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        performSearch(e.target.value);
      }, 300);
    });
  }
}

function performSearch(query) {
  if (query.length < 2) return;
  
  // This would typically make an API call to search products
  console.log('Searching for:', query);
  showNotification(`Searching for "${query}"...`, 'info');
}

// Mobile menu improvements
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  
  console.log('Initializing mobile menu...');
  console.log('Hamburger:', hamburger);
  console.log('NavLinks:', navLinks);
  
  if (!hamburger || !navLinks) {
    console.error('Hamburger or nav links not found!');
    return;
  }
  
  // Simple click handler
  hamburger.onclick = function(e) {
    console.log('Hamburger clicked - simple handler!');
    e.preventDefault();
    e.stopPropagation();
    
    // Toggle menu visibility
    if (navLinks.classList.contains('hidden')) {
      // Show menu
      navLinks.classList.remove('hidden');
      navLinks.classList.add('flex');
      console.log('Menu opened');
      
      // Animate hamburger to X
      const spans = hamburger.querySelectorAll('span');
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      // Hide menu
      navLinks.classList.add('hidden');
      navLinks.classList.remove('flex');
      console.log('Menu closed');
      
      // Reset hamburger
      const spans = hamburger.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '1';
      spans[2].style.transform = '';
    }
  };
  
  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.add('hidden');
      navLinks.classList.remove('flex');
      
      // Reset hamburger
      const spans = hamburger.querySelectorAll('span');
      spans.forEach(span => {
        span.style.transform = '';
        span.style.opacity = '1';
      });
    }
  });
  
  console.log('Mobile menu initialized successfully');
}

// Initialize all enhancements
document.addEventListener('DOMContentLoaded', function() {
  // Debug: Check if hamburger element exists
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  
  console.log('Hamburger element found:', !!hamburger);
  console.log('Nav links element found:', !!navLinks);
  
  if (hamburger) {
    console.log('Hamburger classes:', hamburger.className);
  }
  
  initMobileMenu();
  initLazyLoading();
  initSearch();
});
