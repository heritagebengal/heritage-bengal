// Simple working server for Heritage Bengal with discount pricing
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const axios = require('axios');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

// MongoDB connection
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://sadhu1616:NYhYajU4Qm7eFioB@cluster.xqikjxq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster';
const dbName = process.env.DB_NAME || 'heritage-bengal';

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
    tls: {
        rejectUnauthorized: false
    }
});

// Email template function
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
