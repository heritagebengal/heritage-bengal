require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const axios = require('axios');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const ShiprocketManager = require('./ShiprocketManager');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Shiprocket Manager
const shiprocketManager = new ShiprocketManager();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// MongoDB connection
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://sadhu1616:NYhYajU4Qm7eFioB@cluster.xqikjxq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster';
const dbName = process.env.DB_NAME || 'Hertiage_Bengal_Jewellery';

mongoose.connect(mongoUri, { dbName })
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Email configuration
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    // Additional options for better compatibility
    tls: {
        rejectUnauthorized: false
    }
});

// Email templates
function generateOrderConfirmationEmail(orderData) {
    const isCOD = orderData.paymentMethod === 'COD' || orderData.paymentMethod === 'Cash on Delivery';
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
        .header { background: #8B1538; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .tracking-button { 
            display: inline-block; 
            background: #8B1538; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 15px 0;
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
            <p>Dear ${orderData.customerName || 'Valued Customer'},</p>
            
            <p>Thank you for your order! We're excited to confirm that your order has been successfully placed.</p>
            
            <div class="order-details">
                <h3>Order Details:</h3>
                <p><strong>Order ID:</strong> ${orderData.orderId}</p>
                ${orderData.shiprocketOrderId && orderData.shiprocketOrderId !== orderData.orderId ? 
                    `<p><strong>Shiprocket Order ID:</strong> ${orderData.shiprocketOrderId}</p>` : ''
                }
                ${orderData.shipmentId ? 
                    `<p><strong>Shipment ID:</strong> ${orderData.shipmentId}</p>` : ''
                }
                <p><strong>Payment Method:</strong> ${paymentText}</p>
                ${orderData.amount ? 
                    `<p><strong>Total Amount:</strong> ₹${parseInt(orderData.amount).toLocaleString()}</p>` : ''
                }
                ${orderData.estimatedDelivery ? 
                    `<p><strong>Estimated Delivery:</strong> ${orderData.estimatedDelivery}</p>` : ''
                }
            </div>
            
            ${isCOD ? 
                '<p><strong>Cash on Delivery:</strong> Please keep the exact amount ready for payment upon delivery.</p>' :
                '<p><strong>Payment Status:</strong> Your payment has been processed successfully.</p>'
            }
            
            ${trackingLink ? `
                <!-- IMPORTANT NOTE SECTION -->
                <div style="background: #fff3cd !important; border: 1px solid #ffeaa7 !important; padding: 15px !important; border-radius: 5px !important; margin: 20px 0 !important;">
                    <p style="margin: 0 !important; color: #856404 !important; font-size: 14px !important;">
                        <strong>📋 Important Note:</strong> Once your order gets shipped, you can track the order using the button below. 
                        The tracking information may not appear before the order is actually shipped by our partner. 
                        Please allow 24-48 hours after order placement for tracking to become active.
                    </p>
                </div>
                <p>You can track your order using the link below:</p>
                <a href="${trackingLink}" class="tracking-button">Track Your Order</a>
            ` : ''}
            
            <p>If you have any questions about your order, please contact us at:</p>
            <p>📧 Email: ${process.env.STORE_EMAIL || 'heritagebengal25@gmail.com'}</p>
            <p>📞 Phone: ${process.env.STORE_PHONE || '+917439543717'}</p>
            
            <p>Thank you for choosing Heritage Bengal Jewellery!</p>
        </div>
        
        <div class="footer">
            <p>&copy; 2024 Heritage Bengal Jewellery. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
}

// Function to send order confirmation email
async function sendOrderConfirmationEmail(orderData, customerEmail) {
    try {
        console.log('🔄 Attempting to send order confirmation email...');
        console.log('📧 Customer email:', customerEmail);
        console.log('📦 Order ID:', orderData.orderId);
        
        const emailHtml = generateOrderConfirmationEmail(orderData);
        
        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME || 'Heritage Bengal Jewellery'}" <${process.env.EMAIL_USER}>`,
            to: customerEmail,
            subject: `Order Confirmation - ${orderData.orderId} | Heritage Bengal Jewellery`,
            html: emailHtml
        };
        
        console.log('📨 Sending email with options:', {
            from: mailOptions.from,
            to: mailOptions.to,
            subject: mailOptions.subject
        });
        
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Order confirmation email sent successfully!');
        console.log('📬 Message ID:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending order confirmation email:', error.message);
        console.error('💀 Full error:', error);
        return { success: false, error: error.message };
    }
}

// Product schema and model
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    description: String,
    category: String,
    image: String,
    stock: Number,
    features: [String], // Array of product features
    care_instructions: [String], // Array of care instructions
    rating: { type: Number, default: 4.8 }, // Product rating
    reviews_count: { type: Number, default: 0 } // Number of reviews
});

const Product = mongoose.model('Product', productSchema, 'Products');

// Product routes
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.post('/products', async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (err) {
        console.error('Error adding product:', err);
        res.status(400).json({ error: 'Failed to add product' });
    }
});

app.delete('/products/:id', async (req, res) => {
    try {
        const result = await Product.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({ error: 'Product not found' });
        res.json({ message: 'Product deleted' });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(400).json({ error: 'Failed to delete product' });
    }
});

// Include coupon routes
const couponsRouter = require('./routes/coupons');
app.use('/api/coupons', couponsRouter);

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create payment order endpoint
app.post('/create-payment-order', async (req, res) => {
    try {
        const { amount, currency = 'INR' } = req.body;
        
        if (!amount) {
            return res.status(400).json({ error: 'Amount is required' });
        }

        const options = {
            amount: amount * 100, // Convert to paise
            currency: currency,
            receipt: `receipt_${Date.now()}`,
            payment_capture: 1
        };

        const order = await razorpay.orders.create(options);
        
        res.json({
            success: true,
            order_id: order.id,
            amount: order.amount,
            currency: order.currency,
            key_id: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Error creating payment order:', error);
        res.status(500).json({ error: 'Failed to create payment order' });
    }
});

// Verify payment and create Shiprocket order
app.post('/verify-payment', async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            orderDetails 
        } = req.body;

        // Verify Razorpay signature
        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({ error: 'Invalid payment signature' });
        }

        // Create Shiprocket order using the new manager
        const shiprocketOrder = await shiprocketManager.createOrder(orderDetails, razorpay_payment_id, 'Prepaid');

        // Prepare order data for email
        const orderData = {
            orderId: razorpay_order_id,
            shiprocketOrderId: shiprocketOrder.order_id,
            shipmentId: shiprocketOrder.shipment_id,
            trackingUrl: shiprocketOrder.tracking_url,
            estimatedDelivery: shiprocketOrder.estimated_delivery,
            paymentMethod: 'Online Payment',
            customerName: orderDetails.customerName,
            amount: orderDetails.totalAmount
        };

        // Send order confirmation email
        if (orderDetails.customerEmail) {
            try {
                const emailResult = await sendOrderConfirmationEmail(orderData, orderDetails.customerEmail);
                if (emailResult.success) {
                    console.log('Order confirmation email sent successfully');
                } else {
                    console.error('Failed to send order confirmation email:', emailResult.error);
                }
            } catch (emailError) {
                console.error('Error sending order confirmation email:', emailError);
                // Don't fail the order if email sending fails
            }
        } else {
            console.log('No customer email provided, skipping email notification');
        }

        res.json({
            success: true,
            payment_verified: true,
            payment_id: razorpay_payment_id,
            order_id: razorpay_order_id,
            shiprocket_order_id: shiprocketOrder.order_id,
            shipment_id: shiprocketOrder.shipment_id,
            tracking_url: shiprocketOrder.tracking_url,
            estimated_delivery: shiprocketOrder.estimated_delivery,
            email_sent: !!orderDetails.customerEmail
        });

    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ error: 'Payment verification failed' });
    }
});

// Create COD order endpoint
app.post('/create-cod-order', async (req, res) => {
    try {
        console.log('🛒 COD order request received');
        const { orderDetails } = req.body;
        console.log('📦 Order details received:', orderDetails);
        
        if (!orderDetails) {
            return res.status(400).json({ error: 'Order details are required' });
        }

        // Create Shiprocket order with COD using the new manager
        const shiprocketOrder = await shiprocketManager.createOrder(orderDetails, null, 'COD');

        // Prepare order data for email
        const orderData = {
            orderId: shiprocketOrder.order_id,
            shiprocketOrderId: shiprocketOrder.order_id,
            shipmentId: shiprocketOrder.shipment_id,
            trackingUrl: shiprocketOrder.tracking_url,
            estimatedDelivery: shiprocketOrder.estimated_delivery,
            paymentMethod: 'COD',
            customerName: orderDetails.customerName,
            amount: orderDetails.totalAmount
        };

        // Send order confirmation email
        if (orderDetails.customerEmail) {
            console.log('🔄 Processing email for COD order...');
            console.log('📧 Customer email from orderDetails:', orderDetails.customerEmail);
            try {
                const emailResult = await sendOrderConfirmationEmail(orderData, orderDetails.customerEmail);
                if (emailResult.success) {
                    console.log('✅ COD order confirmation email sent successfully');
                } else {
                    console.error('❌ Failed to send COD order confirmation email:', emailResult.error);
                }
            } catch (emailError) {
                console.error('💥 Error sending COD order confirmation email:', emailError);
                // Don't fail the order if email sending fails
            }
        } else {
            console.log('⚠️ No customer email provided for COD order, skipping email notification');
        }

        res.json({
            success: true,
            order_id: shiprocketOrder.order_id,
            shipment_id: shiprocketOrder.shipment_id,
            tracking_url: shiprocketOrder.tracking_url,
            estimated_delivery: shiprocketOrder.estimated_delivery,
            payment_method: 'COD',
            email_sent: !!orderDetails.customerEmail
        });

    } catch (error) {
        console.error('Error creating COD order:', error);
        res.status(500).json({ error: 'Failed to create COD order' });
    }
});

// Shiprocket order creation is now handled by ShiprocketManager class

// Health check endpoint for Shiprocket token
app.get('/api/shiprocket/health', async (req, res) => {
    try {
        console.log('🔍 Checking Shiprocket token health...');
        const isValid = await shiprocketManager.checkTokenValidity();
        
        res.json({
            success: true,
            token_valid: isValid,
            message: isValid ? 'Shiprocket token is valid' : 'Shiprocket token needs refresh',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Shiprocket health check failed:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Shiprocket health check failed'
        });
    }
});

// Endpoint to manually refresh Shiprocket token
app.post('/api/shiprocket/refresh-token', async (req, res) => {
    try {
        console.log('🔄 Manually refreshing Shiprocket token...');
        const newToken = await shiprocketManager.refreshToken();
        
        res.json({
            success: true,
            message: 'Shiprocket token refreshed successfully',
            token_refreshed: true,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Manual token refresh failed:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Failed to refresh Shiprocket token'
        });
    }
});

// WhatsApp configuration endpoint
app.get('/api/whatsapp/config', (req, res) => {
    res.json({
        phone: process.env.WHATSAPP_PHONE || '+917439543717',
        success: true
    });
});

// Default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Heritage Bengal Server running on port ${PORT}`);
    console.log(`Access the application at http://localhost:${PORT}`);
});

module.exports = app;
