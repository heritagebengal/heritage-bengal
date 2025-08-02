async function applyCheckoutCoupon() {
  const code = document.getElementById('checkout-coupon-code').value.trim();
  if (!code) {
    alert('Please enter a coupon code.');
    return;
  }
  const cart = getCart();
  let total = cart.reduce((sum, item) => sum + item.price, 0);
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
    document.getElementById('checkout-total').innerHTML = `<h3>Total: ₹${total}</h3><h3>Discount (${data.percent}%): -₹${total-data.discountedTotal}</h3><h3>Grand Total: ₹${data.discountedTotal}</h3>`;
    alert('Coupon applied! Discount: ' + data.percent + '%');
  } catch (err) {
    alert('Error applying coupon.');
  }
}
// Checkout logic and Razorpay integration
function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}
function renderCheckout() {
  const cart = getCart();
  const checkoutItems = document.getElementById('checkout-items');
  const checkoutTotal = document.getElementById('checkout-total');
  if (cart.length === 0) {
    checkoutItems.innerHTML = '<p>Your cart is empty.</p>';
    checkoutTotal.innerHTML = '';
    document.getElementById('pay-btn').style.display = 'none';
    return;
  }
  let total = 0;
  checkoutItems.innerHTML = cart.map(item => {
    total += item.price;
    return `<div class="checkout-item">
      <img src="${item.image}" alt="${item.name}" style="width:60px;">
      <span>${item.name}</span>
      <span>₹${item.price}</span>
    </div>`;
  }).join('');
  checkoutTotal.innerHTML = `<h3>Total: ₹${total}</h3>`;
}
function payWithRazorpay() {
  const cart = getCart();
  let total = cart.reduce((sum, item) => sum + item.price, 0);
  var options = {
    key: 'YOUR_RAZORPAY_KEY_ID', // Replace with your Razorpay Key ID
    amount: total * 100, // Amount in paise
    currency: 'INR',
    name: 'Heritage Bengal',
    description: 'Jewellery Purchase',
    handler: function (response){
      alert('Payment successful! Payment ID: ' + response.razorpay_payment_id);
      localStorage.removeItem('cart');
      window.location.href = 'index.html';
    },
    prefill: {
      name: '',
      email: ''
    },
    theme: {
      color: '#bfa14a'
    }
  };
  var rzp = new Razorpay(options);
  rzp.open();
}
document.addEventListener('DOMContentLoaded', function() {
  renderCheckout();
  document.getElementById('pay-btn').addEventListener('click', payWithRazorpay);
});
