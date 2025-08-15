// Order Confirmation Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
  loadOrderDetails();
});

function loadOrderDetails() {
  // Get order details from URL parameters or localStorage
  const urlParams = new URLSearchParams(window.location.search);
  const orderData = {
    orderId: urlParams.get('orderId'),
    shiprocketOrderId: urlParams.get('shiprocketOrderId'),
    amount: urlParams.get('amount'),
    estimatedDelivery: urlParams.get('estimatedDelivery'),
    trackingUrl: urlParams.get('trackingUrl'),
    shipmentId: urlParams.get('shipmentId'),
    customerName: urlParams.get('customerName')
  };

  // If no URL params, try to get from localStorage (backup)
  if (!orderData.orderId) {
    const savedOrder = localStorage.getItem('lastOrder');
    if (savedOrder) {
      const parsedOrder = JSON.parse(savedOrder);
      Object.assign(orderData, parsedOrder);
      // Clear the saved order after loading
      localStorage.removeItem('lastOrder');
    }
  }

  displayOrderDetails(orderData);
}

function displayOrderDetails(orderData) {
  const orderDetailsContainer = document.getElementById('order-details');
  const trackingSection = document.getElementById('tracking-section');
  const trackingLink = document.getElementById('tracking-link');

  if (!orderData.orderId) {
    // Fallback if no order data found
    orderDetailsContainer.innerHTML = `
      <div class="text-center text-gray-600">
        <p>Order details not found. Please check your email for order confirmation.</p>
      </div>
    `;
    return;
  }

  // Display order details
  orderDetailsContainer.innerHTML = `
    <div class="grid md:grid-cols-2 gap-6">
      <div class="space-y-3">
        <div class="flex justify-between py-2 border-b border-gray-200">
          <span class="font-semibold text-gray-700">Order ID:</span>
          <span class="text-heritage-red font-mono">${orderData.orderId}</span>
        </div>
        ${orderData.shiprocketOrderId ? `
          <div class="flex justify-between py-2 border-b border-gray-200">
            <span class="font-semibold text-gray-700">Shiprocket Order ID:</span>
            <span class="text-heritage-red font-mono">${orderData.shiprocketOrderId}</span>
          </div>
        ` : ''}
        ${orderData.shipmentId ? `
          <div class="flex justify-between py-2 border-b border-gray-200">
            <span class="font-semibold text-gray-700">Shipment ID:</span>
            <span class="text-heritage-red font-mono">${orderData.shipmentId}</span>
          </div>
        ` : ''}
      </div>
      <div class="space-y-3">
        ${orderData.amount ? `
          <div class="flex justify-between py-2 border-b border-gray-200">
            <span class="font-semibold text-gray-700">Amount Paid:</span>
            <span class="text-green-600 font-bold">₹${parseInt(orderData.amount).toLocaleString()}</span>
          </div>
        ` : ''}
        ${orderData.estimatedDelivery ? `
          <div class="flex justify-between py-2 border-b border-gray-200">
            <span class="font-semibold text-gray-700">Estimated Delivery:</span>
            <span class="text-heritage-red">${orderData.estimatedDelivery}</span>
          </div>
        ` : ''}
        ${orderData.customerName ? `
          <div class="flex justify-between py-2 border-b border-gray-200">
            <span class="font-semibold text-gray-700">Customer:</span>
            <span class="text-gray-800">${orderData.customerName}</span>
          </div>
        ` : ''}
      </div>
    </div>
    <div class="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span class="text-green-700 font-semibold">Payment Successful</span>
      </div>
      <p class="text-green-600 text-sm mt-1">Your payment has been processed successfully and your order is confirmed.</p>
    </div>
  `;

  // Show tracking section if tracking URL is available
  if (orderData.trackingUrl) {
    trackingSection.classList.remove('hidden');
    trackingLink.href = orderData.trackingUrl;
  }
}

// Function to handle when user comes from checkout
function handleCheckoutRedirect() {
  // This function can be called from the checkout page to pass order data
  const orderData = JSON.parse(localStorage.getItem('pendingOrder') || '{}');
  if (orderData.orderId) {
    localStorage.setItem('lastOrder', JSON.stringify(orderData));
    localStorage.removeItem('pendingOrder');
    window.location.href = 'order-confirmation.html';
  }
}

// Export for use in other files
window.handleCheckoutRedirect = handleCheckoutRedirect;
