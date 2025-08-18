async function applyCoupon() {
  const code = document.getElementById('coupon-code').value.trim();
  if (!code) {
    alert('Please enter a coupon code.');
    return;
  }
  const cart = getCart();
  let total = cart.reduce((sum, item) => {
    const quantity = item.quantity || 1;
    return sum + (item.price * quantity);
  }, 0);
  
  try {
    const res = await fetch('/api/coupons/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, total })
    });
    const data = await res.json();
    if (!data.valid) {
      alert('Invalid or expired coupon.');
      return;
    }
    document.getElementById('cart-total').innerHTML = `<h3>Total: ₹${total}</h3><h3>Discount (${data.percent}%): -₹${total-data.discountedTotal}</h3><h3>Grand Total: ₹${data.discountedTotal}</h3>`;
    alert('Coupon applied! Discount: ' + data.percent + '%');
  } catch (err) {
    alert('Error applying coupon.');
  }
}
// Cart logic using localStorage
function getCart() {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  
  // Migrate existing cart items to include quantity if missing
  cart = cart.map(item => {
    if (!item.quantity || item.quantity < 1) {
      item.quantity = 1;
    }
    return item;
  });
  
  // Save migrated cart
  localStorage.setItem('cart', JSON.stringify(cart));
  return cart;
}
function setCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}
function renderCart() {
  const cart = getCart();
  const cartItems = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  const emptyCart = document.getElementById('empty-cart');
  const checkoutBtn = document.getElementById('checkout-btn');
  
  if (cart.length === 0) {
    cartItems.innerHTML = '';
    cartTotal.innerHTML = '';
    if (emptyCart) {
      emptyCart.classList.remove('hidden');
    }
    if (checkoutBtn) {
      checkoutBtn.style.opacity = '0.5';
      checkoutBtn.style.pointerEvents = 'none';
    }
    return;
  }
  
  if (emptyCart) {
    emptyCart.classList.add('hidden');
  }
  if (checkoutBtn) {
    checkoutBtn.style.opacity = '1';
    checkoutBtn.style.pointerEvents = 'auto';
  }
  
  let total = 0;
  let totalItems = 0;
  
  cartItems.innerHTML = cart.map((item, idx) => {
    const quantity = item.quantity || 1;
    const itemTotal = item.price * quantity;
    total += itemTotal;
    totalItems += quantity;
    
    return `
    <div class='cart-item bg-gradient-to-r from-heritage-cream to-white p-6 rounded-xl shadow-lg border-l-4 border-heritage-gold hover:shadow-xl transition-all'>
      <div class="flex flex-col lg:flex-row items-center gap-6">
        <div class="flex-shrink-0">
          <img src='${item.image}' alt='${item.name}' class='w-20 h-20 object-cover rounded-lg shadow-md'>
        </div>
        
        <div class="flex-1 text-center lg:text-left">
          <h3 class="text-xl font-bold text-heritage-red mb-2">${item.name}</h3>
          <p class="text-lg font-bold text-heritage-gold font-number">₹${item.price.toLocaleString()} each</p>
        </div>
        
        <!-- Quantity Controls -->
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-3 bg-white rounded-lg p-2 border-2 border-heritage-gold">
            <button 
              onclick="decreaseQuantity(${idx})" 
              class="w-8 h-8 bg-heritage-red text-white rounded-full flex items-center justify-center hover:bg-opacity-80 transition-colors"
              title="Decrease quantity"
            >
              <span class="text-lg leading-none">−</span>
            </button>
            
            <span class="font-bold text-lg min-w-[2rem] text-center text-heritage-red">${quantity}</span>
            
            <button 
              onclick="increaseQuantity(${idx})" 
              class="w-8 h-8 bg-heritage-red text-white rounded-full flex items-center justify-center hover:bg-opacity-80 transition-colors"
              title="Increase quantity"
            >
              <span class="text-lg leading-none">+</span>
            </button>
          </div>
          
          <!-- Item Total -->
          <div class="text-center min-w-[100px]">
            <div class="text-xl font-bold text-heritage-red font-number">₹${itemTotal.toLocaleString()}</div>
            <div class="text-sm text-gray-600">Total</div>
          </div>
        </div>
        
        <!-- Remove Button -->
        <div class="flex-shrink-0">
          <button 
            onclick='removeFromCart(${idx})' 
            class='bg-red-500 text-white px-6 py-2 rounded-full font-bold hover:bg-red-600 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2'
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            Remove
          </button>
        </div>
      </div>
    </div>`;
  }).join('');
  
  // Update cart total with summary
  cartTotal.innerHTML = `
    <div class="text-center">
      <h2 class="text-2xl md:text-3xl font-bold mb-2">Cart Summary</h2>
      <div class="text-2xl sm:text-3xl md:text-4xl font-bold text-heritage-cream font-number">
        Total: ₹${total.toLocaleString()}
      </div>
      <p class="text-heritage-cream mt-2 opacity-90">${totalItems} ${totalItems === 1 ? 'item' : 'items'} in your cart</p>
    </div>
  `;
}

function increaseQuantity(idx) {
  let cart = getCart();
  cart[idx].quantity = (cart[idx].quantity || 1) + 1;
  setCart(cart);
  renderCart();
  updateCartCount();
}

function decreaseQuantity(idx) {
  let cart = getCart();
  const currentQuantity = cart[idx].quantity || 1;
  
  if (currentQuantity > 1) {
    cart[idx].quantity = currentQuantity - 1;
    setCart(cart);
    renderCart();
    updateCartCount();
  } else {
    // If quantity becomes 0, remove the item
    removeFromCart(idx);
  }
}

function removeFromCart(idx) {
  let cart = getCart();
  cart.splice(idx, 1);
  setCart(cart);
  renderCart();
  updateCartCount();
}

function removeAllCartItems() {
  setCart([]);
  renderCart();
  updateCartCount();
}

// Update cart count in navigation
function updateCartCount() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  
  const cartCountElements = document.querySelectorAll('.cart-count, #cart-count');
  cartCountElements.forEach(element => {
    if (element) {
      element.textContent = totalItems;
      element.style.display = totalItems > 0 ? 'block' : 'none';
    }
  });
}
document.addEventListener('DOMContentLoaded', function() {
  renderCart();
  updateCartCount();
});
