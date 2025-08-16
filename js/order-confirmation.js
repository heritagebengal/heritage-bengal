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
    customerName: urlParams.get('customerName'),
    paymentMethod: urlParams.get('paymentMethod')
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

  // Determine payment method and status
  const isCOD = orderData.paymentMethod === 'COD' || orderData.paymentMethod === 'Cash on Delivery';
  const paymentStatusText = isCOD ? 'Cash on Delivery' : 'Payment Successful';
  const paymentStatusColor = isCOD ? 'text-orange-600' : 'text-green-600';
  const paymentBgColor = isCOD ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200';
  const paymentIconColor = isCOD ? 'text-orange-500' : 'text-green-500';

  // Display order details
  orderDetailsContainer.innerHTML = `
    <div class="grid md:grid-cols-2 gap-6">
      <div class="space-y-3">
        <div class="flex justify-between py-2 border-b border-gray-200">
          <span class="font-semibold text-gray-700">Order ID:</span>
          <span class="text-heritage-red font-mono">${orderData.orderId}</span>
        </div>
        ${orderData.shiprocketOrderId && orderData.shiprocketOrderId !== orderData.orderId ? `
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
        <div class="flex justify-between py-2 border-b border-gray-200">
          <span class="font-semibold text-gray-700">Payment Method:</span>
          <span class="text-heritage-red font-semibold">${isCOD ? 'Cash on Delivery' : 'Online Payment'}</span>
        </div>
      </div>
      <div class="space-y-3">
        ${orderData.amount ? `
          <div class="flex justify-between py-2 border-b border-gray-200">
            <span class="font-semibold text-gray-700">${isCOD ? 'Amount (COD):' : 'Amount Paid:'}:</span>
            <span class="${paymentStatusColor} font-bold font-number">₹${parseInt(orderData.amount).toLocaleString()}</span>
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
    <div class="mt-6 p-4 ${paymentBgColor} rounded-lg border">
      <div class="flex items-center">
        <svg class="w-5 h-5 ${paymentIconColor} mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          ${isCOD ? `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-3a2 2 0 00-2-2H9a2 2 0 00-2 2v3a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
          ` : `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          `}
        </svg>
        <span class="${paymentStatusColor} font-semibold">${paymentStatusText}</span>
      </div>
      <p class="${paymentStatusColor} text-sm mt-1">
        ${isCOD 
          ? 'Your order is confirmed. Please keep the exact amount ready for payment upon delivery.' 
          : 'Your payment has been processed successfully and your order is confirmed.'
        }
      </p>
    </div>
  `;

  // Always show tracking section if we have any tracking info
  if (orderData.trackingUrl || orderData.shipmentId) {
    trackingSection.classList.remove('hidden');
    
    // Set the tracking URL
    if (orderData.trackingUrl) {
      trackingLink.href = orderData.trackingUrl;
    } else if (orderData.shipmentId) {
      // Fallback: construct tracking URL from shipment ID
      trackingLink.href = `https://shiprocket.in/tracking/${orderData.shipmentId}`;
    }
    
    // Update tracking section content to be more prominent
    trackingSection.innerHTML = `
      <h3 class="text-xl font-bold text-heritage-red mb-4 flex items-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
        Track Your Order
      </h3>
      <p class="text-gray-700 mb-4">You can track your order in real-time using the link below:</p>
      <div class="flex flex-col sm:flex-row gap-4 mb-4">
        <a href="${orderData.trackingUrl || `https://shiprocket.in/tracking/${orderData.shipmentId}`}" target="_blank" class="inline-block bg-heritage-red text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-800 transition-colors text-center">
          🚚 Track Order on Shiprocket
        </a>
        ${orderData.shipmentId ? `
          <div class="bg-white p-3 rounded-lg border border-heritage-gold">
            <span class="text-sm text-gray-600">Shipment ID:</span>
            <span class="font-mono text-heritage-red font-semibold">${orderData.shipmentId}</span>
          </div>
        ` : ''}
      </div>
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div class="flex items-start">
          <svg class="w-5 h-5 text-yellow-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <p class="text-yellow-800 text-sm font-semibold">📋 Important Note:</p>
            <p class="text-yellow-700 text-sm mt-1">
              Tracking information will be available once your order is picked up by our shipping partner. 
              If the tracking page shows "Order not found", please wait 24-48 hours after order placement for the tracking details to become active.
            </p>
          </div>
        </div>
      </div>
    `;
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
