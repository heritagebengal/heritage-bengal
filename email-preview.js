// Preview of the email template structure

const sampleOrderData = {
    orderId: 'HB_1234567890',
    shiprocketOrderId: '932737914',
    shipmentId: '929189994',
    trackingUrl: 'https://shiprocket.in/tracking/929189994',
    estimatedDelivery: 'Sat Aug 23 2025',
    paymentMethod: 'COD',
    customerName: 'Test Customer',
    amount: 5000
};

console.log('📧 Email Template Preview:');
console.log('==========================');
console.log('');
console.log('STRUCTURE:');
console.log('1. Header (Heritage Bengal Jewellery + Order Confirmation)');
console.log('2. Greeting (Dear Customer)');
console.log('3. Thank you message');
console.log('4. Order Details Box');
console.log('5. Payment Status/COD Message');
console.log('6. 📋 NOTE SECTION (Yellow box - BEFORE track button)');
console.log('   ├─ "Once your order gets shipped, you can track..."');
console.log('   └─ "May not appear before order is shipped"');
console.log('7. Track Your Order Button');
console.log('8. Contact Information');
console.log('9. Footer');
console.log('');
console.log('✅ The note section is now positioned ABOVE the Track button!');
console.log('✅ The note explains tracking will work after shipping!');
console.log('✅ Check your email to see the updated template!');
