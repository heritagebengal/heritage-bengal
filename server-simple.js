// Simple working server for Heritage Bengal with discount pricing
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const axios = require('axios');
const nodemailer = require('nodemailer');
const Razorpay = require('razorpay');

const app = express();
const PORT = process.env.PORT || 5000;

// Razorpay configuration
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

// MongoDB connection
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://sadhu1616:NYhYajU4Qm7eFioB@cluster.xqikjxq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster';
const dbName = process.env.DB_NAME || 'Heritage_Bengal_Jewellery';

mongoose.connect(mongoUri, { dbName })
    .then(() => console.log('MongoDB connected successfully to database:', dbName))
    .catch(err => console.error('MongoDB connection error:', err));

// Email configuration
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Email template function
function generateOrderConfirmationEmail(orderData) {
    const isCOD = orderData.paymentMethod === 'COD' || orderData.paymentMethod === 'Cash on Delivery';
    const isPrepaid = orderData.paymentMethod === 'Prepaid' || orderData.paymentMethod === 'Online Payment';
    const paymentText = isCOD ? 'Cash on Delivery' : 'Online Payment (Prepaid)';
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
        .payment-success { 
            background: #d4edda !important; 
            border: 1px solid #c3e6cb !important; 
            padding: 15px !important; 
            border-radius: 5px !important; 
            margin: 20px 0 !important;
        }
        .note-box { 
            background: #fff3cd !important; 
            border: 1px solid #ffeaa7 !important; 
            padding: 15px !important; 
            border-radius: 5px !important; 
            margin: 20px 0 !important;
        }
        .note-text {
            margin: 0 !important; 
            color: #856404 !important; 
            font-size: 14px !important;
        }
        .tracking-button { 
            display: inline-block; 
            background: #8B1538; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 10px 0;
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
                <p><strong>Amount:</strong> ₹${orderData.amount}</p>
                <p><strong>Payment Method:</strong> ${paymentText}</p>
                ${orderData.shiprocketOrderId ? `<p><strong>Shiprocket Order ID:</strong> ${orderData.shiprocketOrderId}</p>` : ''}
                ${orderData.shipmentId ? `<p><strong>Shipment ID:</strong> ${orderData.shipmentId}</p>` : ''}
                ${orderData.razorpayOrderId ? `<p><strong>Razorpay Order ID:</strong> ${orderData.razorpayOrderId}</p>` : ''}
                ${orderData.razorpayPaymentId ? `<p><strong>Payment ID:</strong> ${orderData.razorpayPaymentId}</p>` : ''}
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
            </div>
            ` : ''}
            
            ${isCOD ? `
            <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0; color: #0c5460;"><strong>💰 Cash on Delivery</strong></p>
                <p style="margin: 5px 0 0 0; color: #0c5460;">Please keep the exact amount ready for payment upon delivery.</p>
            </div>
            ` : ''}
            
            ${isPrepaid ? `
            <div class="payment-success">
                <p style="margin: 0; color: #155724;"><strong>✅ Payment Successful</strong></p>
                <p style="margin: 5px 0 0 0; color: #155724;">Your payment has been processed successfully. No additional payment required upon delivery.</p>
            </div>
            ` : ''}
            
            <div class="note-box">
                <p class="note-text"><strong>📋 NOTE:</strong> Once your order gets shipped, you can track it using the button below. The tracking information may not appear immediately before the order is shipped.</p>
            </div>
            
            ${trackingLink ? `
            <p style="text-align: center;">
                <a href="${trackingLink}" class="tracking-button">🚚 Track Your Order</a>
            </p>
            ` : ''}
            
            <div style="background: #e2e3e5; border: 1px solid #d6d8db; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0;">📞 Contact Information</h4>
                <p style="margin: 5px 0;"><strong>Phone:</strong> ${process.env.STORE_PHONE || '+917439543717'}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${process.env.STORE_EMAIL || 'heritagebengal25@gmail.com'}</p>
                <p style="margin: 5px 0;"><strong>WhatsApp:</strong> ${process.env.WHATSAPP_PHONE || '+917439543717'}</p>
            </div>
            
            <p>We will prepare your order and ship it within 1-2 business days.</p>
            
            <p>Thank you for choosing Heritage Bengal Jewellery!</p>
        </div>
        
        <div class="footer">
            <p>&copy; 2025 Heritage Bengal Jewellery. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
}

// Function to send order confirmation email
async function sendOrderConfirmationEmail(orderData) {
    try {
        const emailHtml = generateOrderConfirmationEmail(orderData);
        
        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME || 'Heritage Bengal Jewellery'}" <${process.env.EMAIL_USER}>`,
            to: orderData.customerEmail,
            subject: `Order Confirmation - ${orderData.orderId} | Heritage Bengal Jewellery`,
            html: emailHtml
        };
        
        console.log('Sending email to:', orderData.customerEmail);
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
        
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
}

// Product schema with discount fields
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    original_price: { type: Number, required: false }, // Explicitly define discount fields
    discount_percentage: { type: Number, required: false },
    description: String,
    category: String,
    image: {
        type: mongoose.Schema.Types.Mixed,
        default: 'assets/placeholder.svg'
    },
    stock: { type: Number, default: 0 },
    features: { type: [String], default: [] },
    care_instructions: { type: [String], default: [] },
    rating: { type: Number, default: 4.8 },
    reviews_count: { type: Number, default: 0 }
}, { 
    strict: false,
    timestamps: true // Add timestamps for debugging
});

const Product = mongoose.model('Product', productSchema, 'Products');

// Discount Coupon schema
const discountCouponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    percent: { type: Number, required: true }, // e.g. 10 for 10%
    expires: { type: Date } // optional
});

const DiscountCoupon = mongoose.model('Discount_Coupon', discountCouponSchema);

// Order schema for storing order details
const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerAddress: { type: String, required: true },
    pincode: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    orderItems: [{
        productId: String,
        name: String,
        price: Number,
        quantity: Number,
        image: String
    }],
    orderTotal: { type: Number, required: true },
    originalTotal: { type: Number }, // Before discount
    discountApplied: { type: Number, default: 0 },
    discountCoupon: {
        code: String,
        percent: Number,
        discountAmount: Number
    },
    paymentMethod: { type: String, enum: ['COD', 'Prepaid'], required: true },
    shiprocketOrderId: String,
    shipmentId: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    orderStatus: { type: String, default: 'Confirmed' },
    trackingUrl: String,
    emailSent: { type: Boolean, default: false },
    orderDate: { type: Date, default: Date.now },
    notes: String
}, { 
    timestamps: true 
});

const Order = mongoose.model('Order', orderSchema, 'Orders');

// Routes
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (err) {
        console.error('Error fetching product:', err);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

app.post('/products', async (req, res) => {
    try {
        console.log('=== PRODUCT CREATION DEBUG ===');
        console.log('Received raw body:', JSON.stringify(req.body, null, 2));
        
        // Extract and log discount fields specifically
        const { original_price, discount_percentage, name, price } = req.body;
        console.log('Discount fields check:');
        console.log('- original_price:', original_price, typeof original_price);
        console.log('- discount_percentage:', discount_percentage, typeof discount_percentage);
        console.log('- price:', price, typeof price);
        
        // Create product with all fields
        const productData = {
            ...req.body,
            // Ensure discount fields are properly set
            original_price: original_price ? Number(original_price) : undefined,
            discount_percentage: discount_percentage ? Number(discount_percentage) : undefined
        };
        
        console.log('Product data before save:', JSON.stringify(productData, null, 2));
        
        const product = new Product(productData);
        console.log('Product instance before save:', JSON.stringify(product.toObject(), null, 2));
        
        const savedProduct = await product.save();
        console.log('Product after save:', JSON.stringify(savedProduct.toObject(), null, 2));
        console.log('=== END DEBUG ===');
        
        res.status(201).json(savedProduct);
    } catch (err) {
        console.error('Error adding product:', err);
        res.status(400).json({ error: 'Failed to add product', details: err.message });
    }
});

// Coupon Routes
// Create a coupon
app.post('/api/coupons', async (req, res) => {
    try {
        console.log('Creating coupon:', req.body);
        
        // Convert code to uppercase for consistency
        const couponData = {
            ...req.body,
            code: req.body.code.toUpperCase()
        };
        
        const coupon = new DiscountCoupon(couponData);
        const savedCoupon = await coupon.save();
        console.log('Coupon created successfully:', savedCoupon);
        res.status(201).json(savedCoupon);
    } catch (err) {
        console.error('Error creating coupon:', err);
        if (err.code === 11000) {
            // Duplicate key error
            res.status(400).json({ error: 'Coupon code already exists' });
        } else {
            res.status(400).json({ error: err.message });
        }
    }
});

// Get all coupons
app.get('/api/coupons', async (req, res) => {
    try {
        const coupons = await DiscountCoupon.find({});
        res.json(coupons);
    } catch (err) {
        console.error('Error fetching coupons:', err);
        res.status(500).json({ error: 'Failed to fetch coupons' });
    }
});

// Delete a coupon by code
app.delete('/api/coupons/:code', async (req, res) => {
    try {
        const result = await DiscountCoupon.deleteOne({ code: req.params.code });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Coupon not found' });
        }
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting coupon:', err);
        res.status(400).json({ error: err.message });
    }
});

// Apply coupon and get discounted total
app.post('/api/coupons/apply', async (req, res) => {
    const { code, total } = req.body;
    try {
        console.log('Applying coupon:', { code, total });
        
        // Make case-insensitive search by using regex
        const coupon = await DiscountCoupon.findOne({ 
            code: { $regex: new RegExp('^' + code + '$', 'i') } 
        });
        
        if (!coupon) {
            console.log('Coupon not found:', code);
            return res.json({ valid: false, message: 'Coupon not found' });
        }
        
        if (coupon.expires && new Date() > coupon.expires) {
            console.log('Coupon expired:', code);
            return res.json({ valid: false, expired: true, message: 'Coupon has expired' });
        }
        
        const percent = coupon.percent;
        const discountedTotal = Math.round(total * (1 - percent / 100));
        
        console.log('Coupon applied successfully:', {
            code: coupon.code, // Return the actual stored code
            percent,
            originalTotal: total,
            discountedTotal
        });
        
        res.json({ 
            valid: true, 
            discountedTotal, 
            percent,
            code: coupon.code, // Return the correctly cased code
            message: `${percent}% discount applied successfully!`
        });
    } catch (err) {
        console.error('Error applying coupon:', err);
        res.status(400).json({ error: err.message });
    }
});

// Shiprocket token refresh function
async function refreshShiprocketToken() {
    try {
        console.log('Refreshing Shiprocket token...');
        const response = await axios.post(`${process.env.SHIPROCKET_API_URL}/auth/login`, {
            email: process.env.SHIPROCKET_EMAIL,
            password: process.env.SHIPROCKET_PASSWORD
        });
        
        if (response.data && response.data.token) {
            process.env.SHIPROCKET_TOKEN = response.data.token;
            console.log('Shiprocket token refreshed successfully');
            return response.data.token;
        } else {
            throw new Error('Invalid response from Shiprocket auth API');
        }
    } catch (error) {
        console.error('Failed to refresh Shiprocket token:', error.response?.data || error.message);
        throw error;
    }
}

// Function to save order to database
async function saveOrderToDatabase(orderData) {
    try {
        console.log('=== SAVING ORDER TO DATABASE ===');
        console.log('Database connection state:', mongoose.connection.readyState);
        console.log('Database name:', mongoose.connection.db?.databaseName);
        console.log('Order data received:', {
            orderId: orderData.orderId,
            customerName: orderData.customerName,
            customerEmail: orderData.customerEmail,
            totalAmount: orderData.totalAmount,
            paymentMethod: orderData.paymentMethod
        });
        
        const {
            orderId,
            customerName,
            customerPhone,
            customerEmail,
            address,
            pincode,
            city,
            state,
            cartItems,
            totalAmount,
            originalTotal,
            discountApplied,
            discountCoupon,
            paymentMethod,
            shiprocketOrderId,
            shipmentId,
            razorpayOrderId,
            razorpayPaymentId,
            trackingUrl,
            emailSent
        } = orderData;

        const orderDocument = {
            orderId,
            customerName,
            customerPhone,
            customerEmail,
            customerAddress: address,
            pincode,
            city: city || 'Kolkata',
            state: state || 'West Bengal',
            orderItems: cartItems.map(item => ({
                productId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity || 1,
                image: item.image
            })),
            orderTotal: totalAmount,
            originalTotal: originalTotal || totalAmount,
            discountApplied: discountApplied || 0,
            discountCoupon: discountCoupon ? {
                code: discountCoupon.code,
                percent: discountCoupon.percent,
                discountAmount: discountCoupon.discountAmount
            } : undefined,
            paymentMethod,
            shiprocketOrderId,
            shipmentId,
            razorpayOrderId,
            razorpayPaymentId,
            trackingUrl,
            emailSent: emailSent || false
        };

        console.log('Order document to save:', JSON.stringify(orderDocument, null, 2));

        const order = new Order(orderDocument);
        const savedOrder = await order.save();
        
        console.log('Order saved successfully:', {
            _id: savedOrder._id,
            orderId: savedOrder.orderId,
            createdAt: savedOrder.createdAt
        });
        
        // Verify the order was saved by querying it back
        const verifyOrder = await Order.findOne({ orderId: savedOrder.orderId });
        console.log('Verification: Order exists in DB:', !!verifyOrder);
        
        console.log('=== ORDER SAVE COMPLETE ===');
        return savedOrder;
        
    } catch (error) {
        console.error('=== ORDER SAVE ERROR ===');
        console.error('Error details:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('=== END ERROR ===');
        throw error;
    }
}

// Function to make Shiprocket API calls with automatic token refresh
async function makeShiprocketRequest(url, data, retryCount = 0) {
    try {
        const response = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.SHIPROCKET_TOKEN}`
            }
        });
        return response;
    } catch (error) {
        // Check if error is due to token expiration (HTML response indicates auth failure)
        if (error.response?.status === 401 || 
            (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE'))) {
            
            if (retryCount < 2) {
                console.log('Token expired, refreshing and retrying...');
                await refreshShiprocketToken();
                return makeShiprocketRequest(url, data, retryCount + 1);
            }
        }
        throw error;
    }
}

// COD Order creation function
async function createShiprocketOrder(orderDetails) {
    try {
        const {
            customerName,
            customerPhone,
            customerEmail,
            address,
            pincode,
            city,
            state,
            cartItems,
            totalAmount
        } = orderDetails;
        
        // Generate unique order ID
        const orderId = `HB${Date.now()}${Math.floor(Math.random() * 1000)}`;
        const orderDate = new Date().toISOString().split('T')[0];
        
        // Calculate total weight and dimensions (estimates for jewelry)
        const totalWeight = cartItems.length * 0.05; // 50g per item estimate
        const packageLength = 15;
        const packageBreadth = 10;
        const packageHeight = 5;

        // Prepare order data for Shiprocket
        const orderData = {
            order_id: orderId,
            order_date: orderDate,
            pickup_location: process.env.PICKUP_LOCATION || "Primary",
            billing_customer_name: customerName,
            billing_last_name: "",
            billing_address: address,
            billing_address_2: "",
            billing_city: city || "Kolkata",
            billing_pincode: pincode,
            billing_state: state || "West Bengal",
            billing_country: "India",
            billing_email: customerEmail,
            billing_phone: customerPhone,
            shipping_is_billing: true,
            order_items: cartItems.map(item => ({
                name: item.name,
                sku: `HB-${item.id}`,
                units: item.quantity || 1,
                selling_price: item.price,
                discount: 0,
                tax: 0,
                hsn: 711311 // HSN code for jewelry
            })),
            payment_method: "COD",
            shipping_charges: 0,
            giftwrap_charges: 0,
            transaction_charges: 0,
            total_discount: 0,
            sub_total: totalAmount,
            length: packageLength,
            breadth: packageBreadth,
            height: packageHeight,
            weight: totalWeight
        };

        console.log('Creating COD Shiprocket order:', {
            orderId,
            customerName,
            itemCount: cartItems.length,
            totalAmount
        });

        // Check if Shiprocket is properly configured
        const shiprocketToken = process.env.SHIPROCKET_TOKEN;
        const isShiprocketConfigured = shiprocketToken && 
            shiprocketToken !== 'your_shiprocket_jwt_token_here' && 
            shiprocketToken.length > 20;

        let shiprocketResponse = null;
        
        if (isShiprocketConfigured) {
            try {
                // Send request to Shiprocket API with auto retry on token expiration
                shiprocketResponse = await makeShiprocketRequest(
                    `${process.env.SHIPROCKET_API_URL}/orders/create/adhoc`,
                    orderData
                );
                console.log('Shiprocket COD response:', shiprocketResponse.data);
            } catch (shiprocketError) {
                console.error('Shiprocket COD API Error:', shiprocketError.response?.data || shiprocketError.message);
                throw new Error('Failed to create COD order with Shiprocket');
            }
        } else {
            throw new Error('Shiprocket not configured properly');
        }

        // Return success response
        const orderResponse = {
            success: true,
            message: 'COD order created successfully',
            orderId: orderId,
            shiprocketOrderId: shiprocketResponse?.data?.order_id,
            shipmentId: shiprocketResponse?.data?.shipment_id,
            orderDetails: {
                customerName,
                customerEmail,
                customerPhone,
                address: `${address}, ${city || 'Kolkata'}, ${state || 'West Bengal'} - ${pincode}`,
                items: cartItems,
                totalAmount,
                orderDate
            }
        };

        // Send order confirmation email
        try {
            const emailData = {
                orderId: orderId,
                shiprocketOrderId: shiprocketResponse?.data?.order_id,
                shipmentId: shiprocketResponse?.data?.shipment_id,
                customerName: customerName,
                customerEmail: customerEmail,
                amount: totalAmount,
                paymentMethod: 'COD',
                trackingUrl: shiprocketResponse?.data?.shipment_id ? `https://shiprocket.in/tracking/${shiprocketResponse.data.shipment_id}` : null,
                cartItems: cartItems
            };
            
            const emailResult = await sendOrderConfirmationEmail(emailData);
            
            if (emailResult.success) {
                console.log('Order confirmation email sent successfully');
                orderResponse.emailSent = true;
                orderResponse.emailMessageId = emailResult.messageId;
            } else {
                console.error('Failed to send email:', emailResult.error);
                orderResponse.emailSent = false;
                orderResponse.emailError = emailResult.error;
            }
        } catch (emailError) {
            console.error('Email sending error:', emailError);
            orderResponse.emailSent = false;
            orderResponse.emailError = emailError.message;
        }

        // Save order to database
        try {
            const orderDataForDB = {
                orderId,
                customerName,
                customerPhone,
                customerEmail,
                address,
                pincode,
                city,
                state,
                cartItems,
                totalAmount,
                originalTotal: orderDetails.originalTotal,
                discountApplied: orderDetails.discountApplied,
                discountCoupon: orderDetails.discountCoupon,
                paymentMethod: 'COD',
                shiprocketOrderId: shiprocketResponse?.data?.order_id,
                shipmentId: shiprocketResponse?.data?.shipment_id,
                trackingUrl: shiprocketResponse?.data?.shipment_id ? `https://shiprocket.in/tracking/${shiprocketResponse.data.shipment_id}` : null,
                emailSent: orderResponse.emailSent
            };
            
            const savedOrder = await saveOrderToDatabase(orderDataForDB);
            orderResponse.databaseOrderId = savedOrder._id;
            console.log('Order saved to database successfully');
            
        } catch (dbError) {
            console.error('Error saving order to database:', dbError);
            // Don't fail the order creation if database save fails
            orderResponse.databaseError = dbError.message;
        }

        return orderResponse;

    } catch (error) {
        console.error('Error creating COD order:', error);
        throw error;
    }
}

// COD Order creation endpoint
app.post('/create-cod-order', async (req, res) => {
    console.log('=== CREATE COD ORDER REQUEST ===');
    console.log('Request body:', req.body);
    
    try {
        // Extract order details from nested structure
        const orderData = req.body.orderDetails || req.body;
        
        // Validate required fields
        const {
            customerName,
            customerPhone,
            customerEmail,
            address,
            pincode,
            cartItems,
            totalAmount
        } = orderData;

        console.log('Extracted order data:', {
            customerName,
            customerPhone,
            customerEmail,
            address,
            pincode,
            cartItemsCount: cartItems?.length,
            totalAmount
        });

        if (!customerName || !customerPhone || !customerEmail || !address || !pincode || !cartItems || !totalAmount) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                required: ['customerName', 'customerPhone', 'customerEmail', 'address', 'pincode', 'cartItems', 'totalAmount'],
                received: {
                    customerName: !!customerName,
                    customerPhone: !!customerPhone,
                    customerEmail: !!customerEmail,
                    address: !!address,
                    pincode: !!pincode,
                    cartItems: !!cartItems,
                    totalAmount: !!totalAmount
                }
            });
        }

        // Create COD Shiprocket order
        const orderResponse = await createShiprocketOrder(orderData);
        
        // Send success response
        res.json(orderResponse);
        
    } catch (error) {
        console.error('=== COD ORDER CREATION ERROR ===');
        console.error('Error details:', error);
        console.error('Error message:', error.message);
        console.error('Stack trace:', error.stack);
        
        // Always return JSON response
        res.status(500).json({
            success: false,
            error: 'Failed to create COD order',
            message: error.message || 'Please try again or contact support',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Razorpay order creation endpoint
app.post('/create-razorpay-order', async (req, res) => {
    try {
        const { amount, currency = 'INR' } = req.body;
        
        const options = {
            amount: amount * 100, // Razorpay expects amount in paisa
            currency,
            receipt: `receipt_${Date.now()}`,
        };
        
        const order = await razorpay.orders.create(options);
        res.json({
            success: true,
            order
        });
        
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create Razorpay order'
        });
    }
});

// Razorpay payment verification and order creation
app.post('/verify-payment', async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderDetails
        } = req.body;
        
        // Verify payment signature
        const crypto = require('crypto');
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');
        
        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                error: 'Invalid payment signature'
            });
        }
        
        // Payment is verified, create Shiprocket order with prepaid method
        const prepaidOrderData = {
            ...orderDetails,
            paymentMethod: 'Prepaid',
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id
        };
        
        // Modify the createShiprocketOrder call for prepaid orders
        const orderResponse = await createShiprocketOrderPrepaid(prepaidOrderData);
        
        res.json(orderResponse);
        
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({
            success: false,
            error: 'Payment verification failed'
        });
    }
});

// Prepaid order creation function (similar to COD but with prepaid payment method)
async function createShiprocketOrderPrepaid(orderDetails) {
    try {
        const {
            customerName,
            customerPhone,
            customerEmail,
            address,
            pincode,
            city,
            state,
            cartItems,
            totalAmount,
            razorpayOrderId,
            razorpayPaymentId
        } = orderDetails;
        
        // Generate unique order ID
        const orderId = `HB${Date.now()}${Math.floor(Math.random() * 1000)}`;
        const orderDate = new Date().toISOString().split('T')[0];
        
        // Calculate total weight and dimensions (estimates for jewelry)
        const totalWeight = cartItems.length * 0.05; // 50g per item estimate
        const packageLength = 15;
        const packageBreadth = 10;
        const packageHeight = 5;

        // Prepare order data for Shiprocket (PREPAID)
        const orderData = {
            order_id: orderId,
            order_date: orderDate,
            pickup_location: process.env.PICKUP_LOCATION || "Primary",
            billing_customer_name: customerName,
            billing_last_name: "",
            billing_address: address,
            billing_address_2: "",
            billing_city: city || "Kolkata",
            billing_pincode: pincode,
            billing_state: state || "West Bengal",
            billing_country: "India",
            billing_email: customerEmail,
            billing_phone: customerPhone,
            shipping_is_billing: true,
            order_items: cartItems.map(item => ({
                name: item.name,
                sku: `HB-${item.id}`,
                units: item.quantity || 1,
                selling_price: item.price,
                discount: 0,
                tax: 0,
                hsn: 711311 // HSN code for jewelry
            })),
            payment_method: "Prepaid", // Different from COD
            shipping_charges: 0,
            giftwrap_charges: 0,
            transaction_charges: 0,
            total_discount: 0,
            sub_total: totalAmount,
            length: packageLength,
            breadth: packageBreadth,
            height: packageHeight,
            weight: totalWeight
        };

        console.log('Creating Prepaid Shiprocket order:', {
            orderId,
            customerName,
            itemCount: cartItems.length,
            totalAmount,
            razorpayOrderId,
            razorpayPaymentId
        });

        // Check if Shiprocket is properly configured
        const shiprocketToken = process.env.SHIPROCKET_TOKEN;
        const isShiprocketConfigured = shiprocketToken && 
            shiprocketToken !== 'your_shiprocket_jwt_token_here' && 
            shiprocketToken.length > 20;

        let shiprocketResponse = null;
        
        if (isShiprocketConfigured) {
            try {
                // Send request to Shiprocket API with auto retry on token expiration
                shiprocketResponse = await makeShiprocketRequest(
                    `${process.env.SHIPROCKET_API_URL}/orders/create/adhoc`,
                    orderData
                );
                console.log('Shiprocket Prepaid response:', shiprocketResponse.data);
            } catch (shiprocketError) {
                console.error('Shiprocket Prepaid API Error:', shiprocketError.response?.data || shiprocketError.message);
                throw new Error('Failed to create Prepaid order with Shiprocket');
            }
        } else {
            throw new Error('Shiprocket not configured properly');
        }

        // Return success response
        const orderResponse = {
            success: true,
            message: 'Prepaid order created successfully',
            orderId: orderId,
            shiprocketOrderId: shiprocketResponse?.data?.order_id,
            shipmentId: shiprocketResponse?.data?.shipment_id,
            razorpayOrderId: razorpayOrderId,
            razorpayPaymentId: razorpayPaymentId,
            orderDetails: {
                customerName,
                customerEmail,
                customerPhone,
                address: `${address}, ${city || 'Kolkata'}, ${state || 'West Bengal'} - ${pincode}`,
                items: cartItems,
                totalAmount,
                orderDate
            }
        };

        // Send order confirmation email
        try {
            const emailData = {
                orderId: orderId,
                shiprocketOrderId: shiprocketResponse?.data?.order_id,
                shipmentId: shiprocketResponse?.data?.shipment_id,
                customerName: customerName,
                customerEmail: customerEmail,
                amount: totalAmount,
                paymentMethod: 'Prepaid',
                razorpayOrderId: razorpayOrderId,
                razorpayPaymentId: razorpayPaymentId,
                trackingUrl: shiprocketResponse?.data?.shipment_id ? `https://shiprocket.in/tracking/${shiprocketResponse.data.shipment_id}` : null,
                cartItems: cartItems
            };
            
            const emailResult = await sendOrderConfirmationEmail(emailData);
            
            if (emailResult.success) {
                console.log('Order confirmation email sent successfully');
                orderResponse.emailSent = true;
                orderResponse.emailMessageId = emailResult.messageId;
            } else {
                console.error('Failed to send email:', emailResult.error);
                orderResponse.emailSent = false;
                orderResponse.emailError = emailResult.error;
            }
        } catch (emailError) {
            console.error('Email sending error:', emailError);
            orderResponse.emailSent = false;
            orderResponse.emailError = emailError.message;
        }

        // Save order to database
        try {
            const orderDataForDB = {
                orderId,
                customerName,
                customerPhone,
                customerEmail,
                address,
                pincode,
                city,
                state,
                cartItems,
                totalAmount,
                originalTotal: orderDetails.originalTotal,
                discountApplied: orderDetails.discountApplied,
                discountCoupon: orderDetails.discountCoupon,
                paymentMethod: 'Prepaid',
                shiprocketOrderId: shiprocketResponse?.data?.order_id,
                shipmentId: shiprocketResponse?.data?.shipment_id,
                razorpayOrderId: razorpayOrderId,
                razorpayPaymentId: razorpayPaymentId,
                trackingUrl: shiprocketResponse?.data?.shipment_id ? `https://shiprocket.in/tracking/${shiprocketResponse.data.shipment_id}` : null,
                emailSent: orderResponse.emailSent
            };
            
            const savedOrder = await saveOrderToDatabase(orderDataForDB);
            orderResponse.databaseOrderId = savedOrder._id;
            console.log('Order saved to database successfully');
            
        } catch (dbError) {
            console.error('Error saving order to database:', dbError);
            // Don't fail the order creation if database save fails
            orderResponse.databaseError = dbError.message;
        }

        return orderResponse;

    } catch (error) {
        console.error('Error creating Prepaid order:', error);
        throw error;
    }
}

// Internal Orders API (for admin use only - not exposed to frontend)
// Test endpoint to check database connection and order existence
app.get('/api/test-order/:orderId', async (req, res) => {
    try {
        console.log('Testing order lookup for:', req.params.orderId);
        
        // Check database connection
        const connectionState = mongoose.connection.readyState;
        console.log('Database connection state:', connectionState); // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
        
        // Try to find the order
        const order = await Order.findOne({ orderId: req.params.orderId });
        console.log('Order found:', order ? 'Yes' : 'No');
        
        // Get all orders count for debugging
        const totalOrders = await Order.countDocuments();
        console.log('Total orders in database:', totalOrders);
        
        // Get all order IDs for debugging
        const allOrderIds = await Order.find({}, { orderId: 1, _id: 0 }).limit(10);
        console.log('Recent order IDs:', allOrderIds.map(o => o.orderId));
        
        res.json({
            requestedOrderId: req.params.orderId,
            orderFound: !!order,
            order: order,
            databaseConnected: connectionState === 1,
            totalOrdersInDB: totalOrders,
            recentOrderIds: allOrderIds.map(o => o.orderId),
            databaseName: mongoose.connection.db.databaseName,
            collectionName: 'Orders'
        });
        
    } catch (err) {
        console.error('Error in test endpoint:', err);
        res.status(500).json({ 
            error: 'Test failed', 
            details: err.message,
            databaseConnected: mongoose.connection.readyState === 1
        });
    }
});

// Get all orders with pagination and filters
app.get('/admin/orders', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        
        // Build filter object
        const filter = {};
        if (req.query.paymentMethod) {
            filter.paymentMethod = req.query.paymentMethod;
        }
        if (req.query.orderStatus) {
            filter.orderStatus = req.query.orderStatus;
        }
        if (req.query.startDate && req.query.endDate) {
            filter.orderDate = {
                $gte: new Date(req.query.startDate),
                $lte: new Date(req.query.endDate)
            };
        }
        
        const orders = await Order.find(filter)
            .sort({ orderDate: -1 })
            .skip(skip)
            .limit(limit);
            
        const totalOrders = await Order.countDocuments(filter);
        const totalPages = Math.ceil(totalOrders / limit);
        
        res.json({
            orders,
            pagination: {
                currentPage: page,
                totalPages,
                totalOrders,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
        
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Get single order by ID
app.get('/admin/orders/:orderId', async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.orderId });
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(order);
    } catch (err) {
        console.error('Error fetching order:', err);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

// Get order statistics
app.get('/admin/orders/stats/summary', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        const stats = await Promise.all([
            // Total orders
            Order.countDocuments(),
            
            // Today's orders
            Order.countDocuments({ orderDate: { $gte: today } }),
            
            // This month's orders
            Order.countDocuments({ orderDate: { $gte: thisMonth } }),
            
            // Total revenue
            Order.aggregate([
                { $group: { _id: null, total: { $sum: '$orderTotal' } } }
            ]),
            
            // COD vs Prepaid breakdown
            Order.aggregate([
                { $group: { _id: '$paymentMethod', count: { $sum: 1 }, revenue: { $sum: '$orderTotal' } } }
            ]),
            
            // Orders with coupons
            Order.countDocuments({ 'discountCoupon.code': { $exists: true } }),
            
            // Average order value
            Order.aggregate([
                { $group: { _id: null, avg: { $avg: '$orderTotal' } } }
            ])
        ]);
        
        res.json({
            totalOrders: stats[0],
            todayOrders: stats[1],
            thisMonthOrders: stats[2],
            totalRevenue: stats[3][0]?.total || 0,
            paymentMethodBreakdown: stats[4],
            ordersWithCoupons: stats[5],
            averageOrderValue: Math.round(stats[6][0]?.avg || 0)
        });
        
    } catch (err) {
        console.error('Error fetching order stats:', err);
        res.status(500).json({ error: 'Failed to fetch order statistics' });
    }
});

// Update order status
app.patch('/admin/orders/:orderId/status', async (req, res) => {
    try {
        const { orderStatus, notes } = req.body;
        
        const updatedOrder = await Order.findOneAndUpdate(
            { orderId: req.params.orderId },
            { 
                orderStatus,
                ...(notes && { notes })
            },
            { new: true }
        );
        
        if (!updatedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        res.json(updatedOrder);
        
    } catch (err) {
        console.error('Error updating order status:', err);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// Serve static HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/products.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'products.html'));
});

app.get('/product-details.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'product-details.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Heritage Bengal Server running on port ${PORT}`);
    console.log(`Access the application at http://localhost:${PORT}`);
});

module.exports = app;
