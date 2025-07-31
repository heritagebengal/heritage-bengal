async function applyCoupon() {
  const code = document.getElementById('coupon-code').value.trim();
  if (!code) {
    alert('Please enter a coupon code.');
    return;
  }
  const cart = getCart();
  let total = cart.reduce((sum, item) => sum + item.price, 0);
  try {
    const res = await fetch('http://localhost:5000/api/coupons/apply', {
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
  return JSON.parse(localStorage.getItem('cart') || '[]');
}
function setCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}
function renderCart() {
  const cart = getCart();
  const cartItems = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  if (cart.length === 0) {
    cartItems.innerHTML = '<p>Your cart is empty.</p>';
    cartTotal.innerHTML = '';
    return;
  }
  let total = 0;
  cartItems.innerHTML = cart.map((item, idx) => {
    total += item.price;
    return `<div class='cart-item'>
      <img src='${item.image}' alt='${item.name}' style='width:60px;'>
      <span>${item.name}</span>
      <span>₹${item.price}</span>
      <button onclick='removeFromCart(${idx})' class='cart-btn' style='background:#e57373;'>Remove</button>
    </div>`;
  }).join('');
  cartTotal.innerHTML = `<h3>Total: ₹${total}</h3>`;
}
function removeFromCart(idx) {
  let cart = getCart();
  cart.splice(idx, 1);
  setCart(cart);
  renderCart();
}
function removeAllCartItems() {
  setCart([]);
  renderCart();
}
document.addEventListener('DOMContentLoaded', renderCart);
