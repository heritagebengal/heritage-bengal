// Enhanced Checkout functionality for Heritage Bengal
// This file handles the complete checkout process including Shiprocket integration

class HeritageCheckout {
  constructor() {
    this.cartItems = [];
    this.totalAmount = 0;
    this.discountApplied = 0;
    this.validCoupons = {
      'HERITAGE10': { discount: 0.10, type: 'percentage' },
      'WELCOME15': { discount: 0.15, type: 'percentage' },
      'NEWUSER20': { discount: 0.20, type: 'percentage' }
    };
    
    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.loadCartItems();
      this.updateCartCount();
      this.initializeFormValidation();
      this.setupEventListeners();
    });
  }

  setupEventListeners() {
    // Hamburger menu
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    
    if (hamburger && navLinks) {
      hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('hidden');
        hamburger.classList.toggle('active');
        
        const spans = hamburger.querySelectorAll('span');
        if (hamburger.classList.contains('active')) {
          spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
          spans[1].style.opacity = '0';
          spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
          spans[0].style.transform = '';
          spans[1].style.opacity = '1';
          spans[2].style.transform = '';
        }
      });
    }

    // Place order button
    const placeOrderBtn = document.getElementById('place-order-btn');
    if (placeOrderBtn) {
      placeOrderBtn.addEventListener('click', () => this.placeOrder());
    }
  }

  loadCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    this.cartItems = cart;
    
    const checkoutItemsContainer = document.getElementById('checkout-items');
    const emptyCartContainer = document.getElementById('empty-cart-checkout');
    const placeOrderBtn = document.getElementById('place-order-btn');
    
    if (cart.length === 0) {
      if (checkoutItemsContainer) checkoutItemsContainer.innerHTML = '';
      if (emptyCartContainer) emptyCartContainer.classList.remove('hidden');
      if (placeOrderBtn) placeOrderBtn.disabled = true;
      const couponSection = document.getElementById('coupon-section');
      if (couponSection) couponSection.style.display = 'none';
      return;
    }
    
    if (emptyCartContainer) emptyCartContainer.classList.add('hidden');
    if (placeOrderBtn) placeOrderBtn.disabled = false;
    
    let total = 0;
    
    if (checkoutItemsContainer) {
      checkoutItemsContainer.innerHTML = cart.map(item => {
        const itemTotal = item.price * (item.quantity || 1);
        total += itemTotal;
        
        return `
          <div class="flex items-center gap-4 p-4 bg-heritage-cream rounded-lg">
            <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-lg">
            <div class="flex-1">
              <h4 class="font-semibold text-heritage-red">${item.name}</h4>
              <p class="text-sm text-gray-600">Quantity: ${item.quantity || 1}</p>
              <p class="font-bold text-heritage-gold font-number">₹${itemTotal.toLocaleString()}</p>
            </div>
          </div>
        `;
      }).join('');
    }
    
    this.totalAmount = total;
    this.updateOrderTotal();
  }

  updateOrderTotal() {
    const finalAmount = this.totalAmount - this.discountApplied;
    const checkoutTotal = document.getElementById('checkout-total');
    
    if (checkoutTotal) {
      checkoutTotal.innerHTML = `
        <div>
          <div class="flex justify-between mb-2">
            <span>Subtotal:</span>
            <span class="font-number">₹${this.totalAmount.toLocaleString()}</span>
          </div>
          ${this.discountApplied > 0 ? `
            <div class="flex justify-between mb-2 text-green-400">
              <span>Discount:</span>
              <span class="font-number">-₹${this.discountApplied.toLocaleString()}</span>
            </div>
          ` : ''}
          <div class="flex justify-between mb-2">
            <span>Shipping:</span>
            <span class="text-green-400">FREE</span>
          </div>
          <hr class="border-heritage-cream my-3">
          <div class="flex justify-between text-xl font-bold">
            <span>Total:</span>
            <span class="font-number">₹${finalAmount.toLocaleString()}</span>
          </div>
          <p class="text-sm text-heritage-cream mt-2 opacity-90">
            ${this.cartItems.length} item${this.cartItems.length > 1 ? 's' : ''} • Free shipping across India
          </p>
        </div>
      `;
    }
  }

  initializeFormValidation() {
    const form = document.getElementById('checkout-form');
    if (!form) return;

    const inputs = form.querySelectorAll('input[required], textarea[required]');
    
    inputs.forEach(input => {
      input.addEventListener('input', () => this.validateForm());
      input.addEventListener('blur', () => this.validateForm());
    });
    
    // Phone number formatting
    const phoneInput = document.getElementById('customer-phone');
    if (phoneInput) {
      phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 10) value = value.slice(0, 10);
        e.target.value = value;
      });
    }
    
    // Pincode formatting
    const pincodeInput = document.getElementById('customer-pincode');
    if (pincodeInput) {
      pincodeInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 6) value = value.slice(0, 6);
        e.target.value = value;
      });
    }
  }

  validateForm() {
    const form = document.getElementById('checkout-form');
    const placeOrderBtn = document.getElementById('place-order-btn');
    
    if (!form || !placeOrderBtn) return;
    
    const isValid = form.checkValidity() && this.cartItems.length > 0;
    placeOrderBtn.disabled = !isValid;
    
    if (isValid) {
      placeOrderBtn.innerHTML = `
        <span class="flex items-center justify-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
          Place Secure Order (₹${(this.totalAmount - this.discountApplied).toLocaleString()})
        </span>
      `;
    } else {
      placeOrderBtn.innerHTML = `
        <span class="flex items-center justify-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
          Complete All Fields
        </span>
      `;
    }
  }

  async placeOrder() {
    const form = document.getElementById('checkout-form');
    const placeOrderBtn = document.getElementById('place-order-btn');
    
    if (!form || !form.checkValidity() || this.cartItems.length === 0) {
      this.showNotification('Please fill all required fields and ensure you have items in your cart.', 'error');
      return;
    }
    
    const formData = new FormData(form);
    
    // Show loading state
    placeOrderBtn.disabled = true;
    placeOrderBtn.innerHTML = `
      <span class="flex items-center justify-center">
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Creating Payment Order...
      </span>
    `;
    
    try {
      // Prepare order details for both Razorpay and Shiprocket
      const orderDetails = {
        customerName: formData.get('customerName'),
        customerPhone: formData.get('customerPhone'),
        customerEmail: formData.get('customerEmail'),
        address: formData.get('address'),
        pincode: formData.get('pincode'),
        city: formData.get('city') || 'Kolkata',
        state: formData.get('state') || 'West Bengal',
        cartItems: this.cartItems,
        totalAmount: this.totalAmount - this.discountApplied
      };
      
      console.log('Creating payment order for amount:', orderDetails.totalAmount);
      
      // Step 1: Create Razorpay order
      const paymentOrderResponse = await fetch('/create-payment-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: orderDetails.totalAmount,
          customerDetails: {
            name: orderDetails.customerName,
            email: orderDetails.customerEmail,
            phone: orderDetails.customerPhone
          }
        })
      });
      
      const paymentOrderResult = await paymentOrderResponse.json();
      
      if (!paymentOrderResult.success) {
        throw new Error(paymentOrderResult.message || 'Failed to create payment order');
      }
      
      console.log('Payment order created:', paymentOrderResult);
      
      // Step 2: Open Razorpay payment gateway
      this.openRazorpayPayment(paymentOrderResult, orderDetails);
      
    } catch (error) {
      console.error('Order creation error:', error);
      this.showNotification(`Failed to create order: ${error.message}. Please try again or contact support.`, 'error');
      
      // Reset button
      placeOrderBtn.disabled = false;
      this.validateForm();
    }
  }

  openRazorpayPayment(paymentOrder, orderDetails) {
    const options = {
      key: paymentOrder.key,
      amount: paymentOrder.amount,
      currency: paymentOrder.currency,
      name: 'Heritage Bengal',
      description: 'Premium Jewelry Collection',
      image: 'assets/HB_icon_wb.PNG',
      order_id: paymentOrder.order_id,
      handler: (response) => {
        console.log('Payment successful:', response);
        this.verifyPaymentAndCreateOrder(response, orderDetails);
      },
      prefill: {
        name: orderDetails.customerName,
        email: orderDetails.customerEmail,
        contact: orderDetails.customerPhone
      },
      notes: {
        address: orderDetails.address,
        pincode: orderDetails.pincode
      },
      theme: {
        color: '#8B0000' // Heritage red color
      },
      modal: {
        ondismiss: () => {
          console.log('Payment cancelled by user');
          this.handlePaymentFailure('Payment cancelled by user');
        }
      }
    };

    const rzp = new Razorpay(options);
    
    rzp.on('payment.failed', (response) => {
      console.error('Payment failed:', response.error);
      this.handlePaymentFailure(response.error.description || 'Payment failed');
    });

    rzp.open();
  }

  async verifyPaymentAndCreateOrder(paymentResponse, orderDetails) {
    const placeOrderBtn = document.getElementById('place-order-btn');
    
    // Update button to show verification state
    placeOrderBtn.innerHTML = `
      <span class="flex items-center justify-center">
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Verifying Payment & Creating Order...
      </span>
    `;
    
    try {
      // Step 3: Verify payment and create Shiprocket order
      const verificationResponse = await fetch('/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature,
          orderDetails: orderDetails
        })
      });
      
      const verificationResult = await verificationResponse.json();
      
      if (verificationResult.success && verificationResult.payment_verified) {
        console.log('Payment verified and order created:', verificationResult);
        
        // Clear cart
        localStorage.removeItem('cart');
        this.updateCartCount();
        
        // Prepare data for order confirmation page
        const confirmationData = {
          orderId: verificationResult.order_id,
          shiprocketOrderId: verificationResult.shiprocket_order_id,
          shipmentId: verificationResult.shipment_id,
          amount: orderDetails.totalAmount,
          estimatedDelivery: verificationResult.estimated_delivery,
          trackingUrl: verificationResult.tracking_url,
          customerName: orderDetails.customerName,
          paymentId: paymentResponse.razorpay_payment_id
        };
        
        // Save to localStorage and redirect
        localStorage.setItem('lastOrder', JSON.stringify(confirmationData));
        
        // Redirect to order confirmation page
        window.location.href = `order-confirmation.html?orderId=${confirmationData.orderId}&amount=${confirmationData.amount}&customerName=${encodeURIComponent(confirmationData.customerName)}`;
        
      } else {
        throw new Error(verificationResult.error || 'Payment verification failed');
      }
      
    } catch (error) {
      console.error('Payment verification error:', error);
      this.handlePaymentFailure(`Payment verification failed: ${error.message}`);
    }
  }

  handlePaymentFailure(errorMessage) {
    const placeOrderBtn = document.getElementById('place-order-btn');
    
    // Reset button
    placeOrderBtn.disabled = false;
    this.validateForm();
    
    // Show error notification
    this.showNotification(`Payment failed: ${errorMessage}. Please try again.`, 'error');
  }

  showOrderSuccess(orderData) {
    const modal = document.getElementById('order-modal');
    const orderDetails = document.getElementById('order-details');
    const trackBtn = document.getElementById('track-order-btn');
    
    if (!modal || !orderDetails) return;
    
    // Handle both Shiprocket integrated and manual shipping scenarios
    const isShippingIntegrated = orderData.shipping_integrated === true;
    
    orderDetails.innerHTML = `
      <p class="text-sm text-gray-600"><strong>Order ID:</strong> ${orderData.order_id}</p>
      <p class="text-sm text-gray-600"><strong>Amount:</strong> ₹${(this.totalAmount - this.discountApplied).toLocaleString()}</p>
      <p class="text-sm text-gray-600"><strong>Estimated Delivery:</strong> ${orderData.estimated_delivery}</p>
      ${orderData.shipment_id ? `<p class="text-sm text-gray-600"><strong>Shipment ID:</strong> ${orderData.shipment_id}</p>` : ''}
      ${orderData.note ? `<p class="text-sm text-blue-600 font-medium mt-2"><strong>Note:</strong> ${orderData.note}</p>` : ''}
    `;
    
    if (trackBtn) {
      if (orderData.tracking_url && isShippingIntegrated) {
        trackBtn.href = orderData.tracking_url;
        trackBtn.style.display = 'block';
        trackBtn.textContent = 'Track Your Order';
      } else {
        trackBtn.style.display = 'none';
      }
    }
    
    modal.classList.remove('hidden');
  }

  closeOrderModal() {
    const modal = document.getElementById('order-modal');
    if (modal) {
      modal.classList.add('hidden');
      window.location.href = 'index.html';
    }
  }

  applyCheckoutCoupon() {
    const couponInput = document.getElementById('checkout-coupon-code');
    if (!couponInput) return;

    const couponCode = couponInput.value.trim().toUpperCase();
    
    if (!couponCode) {
      this.showNotification('Please enter a coupon code', 'error');
      return;
    }
    
    if (this.validCoupons[couponCode]) {
      const coupon = this.validCoupons[couponCode];
      this.discountApplied = Math.round(this.totalAmount * coupon.discount);
      this.updateOrderTotal();
      this.validateForm();
      this.showNotification(`Coupon applied! ₹${this.discountApplied} discount`, 'success');
      couponInput.disabled = true;
    } else {
      this.showNotification('Invalid coupon code', 'error');
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
      if (el) el.textContent = totalItems;
    });
  }
  
  showNotification(message, type = 'info') {
    const popup = document.getElementById('cart-popup');
    if (popup) {
      popup.textContent = message;
      popup.className = `fixed top-8 left-1/2 transform -translate-x-1/2 px-10 py-4 rounded-3xl text-xl shadow-lg z-50 transition-all duration-300 text-center ${
        type === 'success' ? 'bg-green-500 text-white' : 
        type === 'error' ? 'bg-red-500 text-white' : 
        'bg-heritage-gold text-white'
      }`;
      popup.classList.remove('hidden');
      popup.style.opacity = 1;
      
      setTimeout(() => {
        popup.style.opacity = 0;
        setTimeout(() => popup.classList.add('hidden'), 400);
      }, 3000);
    }
  }
}

// Initialize checkout
const heritageCheckout = new HeritageCheckout();

// Global functions for HTML onclick handlers
window.placeOrder = () => heritageCheckout.placeOrder();
window.applyCheckoutCoupon = () => heritageCheckout.applyCheckoutCoupon();
window.closeOrderModal = () => heritageCheckout.closeOrderModal();
