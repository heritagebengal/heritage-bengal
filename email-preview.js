// Preview of the UPDATED email template structure

const sampleOrderData = {
    orderId: 'HB_1234567890',
    shiprocketOrderId: '932737914',
    shipmentId: '929189994',
    trackingUrl: 'https://shiprocket.in/tracking/929189994',
    estimatedDelivery: 'Sat Aug 23 2025',
    paymentMethod: 'COD',
    customerName: 'Test Customer',
    amount: 1799,
    originalAmount: 2499,
    discountApplied: 700,
    discountCoupon: {
        code: 'FIRST20',
        percent: 28
    }
};

console.log('📧 UPDATED Email Template Preview:');
console.log('==================================');
console.log('');
console.log('🎨 NEW STYLING:');
console.log('├─ Header: RED background (#4B0000) with GOLDEN text (#BFA14A)');
console.log('├─ "Heritage Bengal Jewellery Order Confirmation" in heritage colors');
console.log('└─ Tracking button: Heritage red with golden text');
console.log('');
console.log('📋 UPDATED STRUCTURE:');
console.log('1. Header (RED bg + GOLDEN text - Heritage Bengal Jewellery Order Confirmation)');
console.log('2. Greeting (Dear Customer)');
console.log('3. Thank you message');
console.log('4. 📋 Order Details Box');
console.log('   ├─ Order ID: HB_1234567890');
console.log('   ├─ Amount to be paid: ₹1,799 (COD) / Amount paid: ₹1,799 (Prepaid)');
console.log('   ├─ Payment Method');
console.log('   └─ Shiprocket IDs');
console.log('5. 🛍️ Order Items Box');
console.log('   ├─ Item: Heritage 24kt Gold Plated Navantara Choker');
console.log('   ├─ Quantity: 1 × ₹2,499 = ₹2,499');
console.log('   └─ 💰 Discount Applied (if any):');
console.log('       ├─ Original Total: ₹2,499');
console.log('       ├─ Discount: -₹700 (FIRST20 - 28% off)');
console.log('       └─ Final Total: ₹1,799');
console.log('6. 📦 Track Your Order (with heritage-styled button)');
console.log('7. Thank you message');
console.log('8. Footer');
console.log('');
console.log('✅ COMPLETED UPDATES:');
console.log('✅ Header now matches site theme (Red bg + Golden text)');
console.log('✅ Amount properly labeled based on payment method');
console.log('✅ Discount details prominently displayed in Order Items');
console.log('✅ Professional discount breakdown with coupon code');
console.log('✅ Consistent heritage colors throughout email');
console.log('');
console.log('🔍 Generated preview files:');
console.log('- email-preview-cod-discount.html (COD with discount)');
console.log('- email-preview-prepaid-no-discount.html (Prepaid without discount)');
