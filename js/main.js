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
});

window.addToCart = function(id, name, price, image) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  cart.push({id, name, price, image});
  localStorage.setItem('cart', JSON.stringify(cart));
  alert('Added to cart!');
}

// Fade-in-up animation on scroll
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
