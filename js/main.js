// Main JS for navigation, form, etc.
document.addEventListener('DOMContentLoaded', function() {
  // Contact form submission
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      alert('Thank you for contacting Heritage Bengal!');
      contactForm.reset();
    });
  }

  // Pulse animation on button click
  document.querySelectorAll('button, a.same-btn, .cta-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      btn.classList.remove('pulse');
      void btn.offsetWidth; // trigger reflow
      btn.classList.add('pulse');
      setTimeout(() => btn.classList.remove('pulse'), 350);
    });
  });

  // ===== Banner Carousel =====
  const slides = document.querySelectorAll(".banner-slide");
  const prevBtn = document.querySelector(".banner-prev");
  const nextBtn = document.querySelector(".banner-next");
  const dotsContainer = document.querySelector(".banner-dots");
  let currentIndex = 0;
  let autoSlide;

  if (slides.length > 0) {
    // Auto-slide every 5 seconds as requested
    const slideInterval = 5000; // 5 seconds

    // Create dots dynamically
    slides.forEach((_, idx) => {
      const dot = document.createElement("span");
      if (idx === 0) dot.classList.add("active");
      dot.addEventListener("click", () => showSlide(idx));
      dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll("span");

    function showSlide(index) {
      // Remove active class from current slide and dot
      slides[currentIndex].classList.remove("active");
      dots[currentIndex].classList.remove("active");

      // Update current index with proper wrapping
      currentIndex = (index + slides.length) % slides.length;

      // Add active class to new slide and dot
      slides[currentIndex].classList.add("active");
      dots[currentIndex].classList.add("active");
      
      // Reset auto-slide timer
      resetAutoSlide();
    }

    function nextSlide() { 
      showSlide(currentIndex + 1); 
    }
    
    function prevSlide() { 
      showSlide(currentIndex - 1); 
    }

    function resetAutoSlide() {
      clearInterval(autoSlide);
      autoSlide = setInterval(nextSlide, slideInterval);
    }

    // Event listeners for navigation buttons
    if (nextBtn) nextBtn.addEventListener("click", nextSlide);
    if (prevBtn) prevBtn.addEventListener("click", prevSlide);

    // Click navigation for banners
    slides.forEach(slide => {
      slide.addEventListener("click", () => {
        const link = slide.dataset.link;
        if (link) {
          if (link.startsWith('http')) {
            // External link - open in new tab (for Instagram)
            window.open(link, '_blank');
          } else {
            // Internal link - navigate in same tab
            window.location.href = link;
          }
        }
      });
    });

    resetAutoSlide();
    
    // Pause auto-slide on hover for better user experience
    const bannerContainer = document.querySelector('.banner-container');
    if (bannerContainer) {
      bannerContainer.addEventListener('mouseenter', () => {
        clearInterval(autoSlide);
      });
      bannerContainer.addEventListener('mouseleave', () => {
        resetAutoSlide();
      });
    }
  }
});

// ===== Add to Cart =====
window.addToCart = function(id, name, price, image) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  cart.push({id, name, price, image});
  localStorage.setItem('cart', JSON.stringify(cart));
  alert('Added to cart!');
}

// ===== Fade-in-up animation on scroll =====
function revealOnScroll() {
  const fadeEls = document.querySelectorAll('.fade-in-up');
  fadeEls.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 40 && rect.bottom > 0) {
      el.classList.add('visible');
    } else {
      el.classList.remove('visible');
    }
  });
}
window.addEventListener('scroll', revealOnScroll);
window.addEventListener('DOMContentLoaded', revealOnScroll);
