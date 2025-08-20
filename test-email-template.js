// Test script to preview the updated email template
const fs = require('fs');

// Mock order data with discount
const testOrderDataWithDiscount = {
    customerName: 'Test Customer',
    orderId: 'HB1755681226899553',
    amount: 1799,
    originalAmount: 2499,
    discountApplied: 700,
    discountCoupon: {
        code: 'FIRST20',
        percent: 28
    },
    cartItems: [
        {
            name: 'Heritage 24kt Gold Plated Navantara Choker with Earring',
            price: 2499,
            quantity: 1
        }
    ],
    shiprocketOrderId: '936651483',
    shipmentId: '933099374',
    trackingUrl: 'https://shiprocket.in/tracking/933099374',
    razorpayOrderId: null,
    razorpayPaymentId: null
};

// Mock order data without discount
const testOrderDataNoDiscount = {
    customerName: 'Test Customer',
    orderId: 'HB1755681226899554',
    amount: 1999,
    cartItems: [
        {
            name: 'Heritage Bengal Silver Necklace Set',
            price: 1999,
            quantity: 1
        }
    ],
    shiprocketOrderId: '936651484',
    shipmentId: '933099375'
};

// Email template function (simplified version of server function)
function generateEmailTemplate(orderData) {
    const isCOD = !orderData.razorpayPaymentId;
    const paymentText = isCOD ? 'Cash on Delivery' : 'Online Payment';
    const trackingLink = orderData.trackingUrl || (orderData.shipmentId ? `https://shiprocket.in/tracking/${orderData.shipmentId}` : '');
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4B0000; color: #BFA14A; padding: 20px; text-align: center; }
        .header h1 { color: #BFA14A; margin: 0; font-size: 28px; font-weight: bold; }
        .header h2 { color: #BFA14A; margin: 10px 0 0 0; font-size: 18px; font-weight: normal; }
        .content { padding: 20px; background: #f9f9f9; }
        .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .tracking-button { 
            display: inline-block; 
            background: #4B0000; 
            color: #BFA14A; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 10px 0;
            font-weight: bold;
        }
        .footer { text-align: center; padding: 20px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Heritage Bengal Jewellery</h1>
            <h2>Order Confirmation</h2>
        </div>
        
        <div class="content">
            <p>Dear ${orderData.customerName},</p>
            
            <p>Thank you for your order! We're excited to serve you with our beautiful jewelry collection.</p>
            
            <div class="order-details">
                <h3>📋 Order Details</h3>
                <p><strong>Order ID:</strong> ${orderData.orderId}</p>
                <p><strong>${isCOD ? 'Amount to be paid:' : 'Amount paid:'}</strong> ₹${orderData.amount}</p>
                <p><strong>Payment Method:</strong> ${paymentText}</p>
                ${orderData.shiprocketOrderId ? `<p><strong>Shiprocket Order ID:</strong> ${orderData.shiprocketOrderId}</p>` : ''}
                ${orderData.shipmentId ? `<p><strong>Shipment ID:</strong> ${orderData.shipmentId}</p>` : ''}
            </div>
            
            ${orderData.cartItems ? `
            <div class="order-details">
                <h3>🛍️ Order Items</h3>
                ${orderData.cartItems.map(item => {
                    const quantity = item.quantity || 1;
                    const itemTotal = item.price * quantity;
                    return `
                    <div style="display: flex; align-items: center; gap: 15px; padding: 10px; border-bottom: 1px solid #eee;">
                        <div style="flex: 1;">
                            <h4 style="margin: 0; color: #8B1538;">${item.name}</h4>
                            <p style="margin: 5px 0 0 0; color: #666;">Quantity: ${quantity} × ₹${item.price.toLocaleString()} = ₹${itemTotal.toLocaleString()}</p>
                        </div>
                    </div>`;
                }).join('')}
                
                ${orderData.originalAmount && orderData.discountApplied ? `
                <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 5px; border-left: 4px solid #BFA14A;">
                    <h4 style="margin: 0 0 10px 0; color: #4B0000;">💰 Discount Applied</h4>
                    <p style="margin: 5px 0; color: #666;"><strong>Original Total:</strong> ₹${orderData.originalAmount}</p>
                    <p style="margin: 5px 0; color: #28a745;"><strong>Discount:</strong> -₹${orderData.discountApplied} ${orderData.discountCoupon ? `(${orderData.discountCoupon.code} - ${orderData.discountCoupon.percent}% off)` : ''}</p>
                    <p style="margin: 5px 0 0 0; color: #4B0000; font-size: 16px;"><strong>Final Total: ₹${orderData.amount}</strong></p>
                </div>
                ` : ''}
            </div>
            ` : ''}
            
            ${trackingLink ? `
            <div class="order-details">
                <h3>📦 Track Your Order</h3>
                <p>Your order is being processed. You can track it using the link below:</p>
                <a href="${trackingLink}" class="tracking-button">Track Order</a>
            </div>
            ` : ''}
            
            <p>Thank you for choosing Heritage Bengal Jewellery!</p>
        </div>
        
        <div class="footer">
            <p>&copy; 2025 Heritage Bengal Jewellery. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
}

// Generate test emails
console.log('🧪 Testing Email Templates');
console.log('============================\n');

console.log('📧 COD Order WITH Discount:');
console.log('===========================');
const codWithDiscount = generateEmailTemplate(testOrderDataWithDiscount);
fs.writeFileSync('email-preview-cod-discount.html', codWithDiscount);
console.log('✅ Generated email-preview-cod-discount.html');

console.log('\n📧 Prepaid Order WITHOUT Discount:');
console.log('==================================');
const prepaidNoDiscount = generateEmailTemplate({
    ...testOrderDataNoDiscount,
    razorpayPaymentId: 'pay_test123'
});
fs.writeFileSync('email-preview-prepaid-no-discount.html', prepaidNoDiscount);
console.log('✅ Generated email-preview-prepaid-no-discount.html');

console.log('\n🎨 Key Updates Applied:');
console.log('======================');
console.log('✅ Header: Red background (#4B0000) with golden text (#BFA14A)');
console.log('✅ Amount labeling: "Amount to be paid" (COD) / "Amount paid" (Prepaid)');
console.log('✅ Discount details: Shown in Order Items section with breakdown');
console.log('✅ Theme consistency: Tracking button matches site colors');
console.log('\n🔍 Open the generated HTML files to preview the email templates!');
