// Express server for Heritage Bengal Jewellery
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const Razorpay = require('razorpay');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
const mongoUri = 'mongodb+srv://sadhu1616:NYhYajU4Qm7eFioB@cluster.xqikjxq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster';
const dbName = 'Hertiage_Bengal_Jewellery';

mongoose.connect(mongoUri, { dbName })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Product schema & routes
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  category: String,
  image: String,
  stock: Number
});

const Product = mongoose.model('Product', productSchema, 'Products');

app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: 'Failed to add product' });
  }
});

app.delete('/products/:id', async (req, res) => {
  try {
    const result = await Product.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete product' });
  }
});

// Coupons route
const couponsRouter = require('./routes/coupons');
app.use('/api/coupons', couponsRouter);

// === RAZORPAY INTEGRATION ===
// Route to create Razorpay order
app.post('/create-payment-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', customerDetails } = req.body;
    
    console.log('Creating Razorpay order for amount:', amount);
    
    // Create Razorpay order
    const orderOptions = {
      amount: Math.round(amount * 100), // Amount in paise
      currency: currency,
      receipt: `HB_${Date.now()}`,
      notes: {
        customer_name: customerDetails?.name || 'Heritage Bengal Customer',
        customer_email: customerDetails?.email || '',
        customer_phone: customerDetails?.phone || ''
      }
    };

    const razorpayOrder = await razorpay.orders.create(orderOptions);
    
    console.log('Razorpay order created:', razorpayOrder.id);
    
    res.json({
      success: true,
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
    
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment order',
      message: error.message
    });
  }
});

// Route to verify Razorpay payment
app.post('/verify-payment', async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      orderDetails 
    } = req.body;
    
    console.log('Verifying payment:', { razorpay_order_id, razorpay_payment_id });
    
    // Verify payment signature
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature'
      });
    }
    
    console.log('Payment verified successfully');
    
    // Payment is verified, now create Shiprocket order
    const shiprocketResponse = await createShiprocketOrder(orderDetails);
    
    res.json({
      success: true,
      payment_verified: true,
      razorpay_order_id,
      razorpay_payment_id,
      ...shiprocketResponse
    });
    
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Payment verification failed',
      message: error.message
    });
  }
});

// === SHIPROCKET INTEGRATION ===
// Function to create Shiprocket order
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
      payment_method: "Prepaid",
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

    console.log('Creating Shiprocket order:', {
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
        // Send request to Shiprocket API
        shiprocketResponse = await axios.post(
          `${process.env.SHIPROCKET_API_URL}/orders/create/adhoc`,
          orderData,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.SHIPROCKET_TOKEN}`
            }
          }
        );
        console.log('Shiprocket response:', shiprocketResponse.data);
      } catch (shiprocketError) {
        console.error('Shiprocket API Error:', shiprocketError.response?.data || shiprocketError.message);
        // Continue with local order processing if Shiprocket fails
        shiprocketResponse = null;
      }
    } else {
      console.log('Shiprocket not configured, processing order locally');
    }

    console.log('Shiprocket response:', shiprocketResponse?.data || 'No Shiprocket response');

    // Extract relevant information from Shiprocket response or create fallback
    let responseData = {
      success: true,
      order_id: orderId,
      message: 'Order created successfully!',
      estimated_delivery: '3-7 business days'
    };

    if (shiprocketResponse && shiprocketResponse.data) {
      const {
        order_id: shiprocketOrderId,
        shipment_id,
        status,
        onboarding_completed_now
      } = shiprocketResponse.data;

      // Create tracking URL
      const trackingUrl = shipment_id
        ? `https://shiprocket.in/tracking/${shipment_id}`
        : null;

      responseData = {
        ...responseData,
        shiprocket_order_id: shiprocketOrderId,
        shipment_id,
        status,
        tracking_url: trackingUrl,
        shipping_integrated: true
      };
    } else {
      responseData = {
        ...responseData,
        shipping_integrated: false,
        message: 'Order received! We will contact you for shipping details.',
        note: 'Shipping will be arranged manually'
      };
    }

    return responseData;
    
  } catch (error) {
    console.error('Shiprocket order creation error:', error);
    throw error;
  }
}

// Create order route for Shiprocket integration (for backward compatibility)
app.post('/create-order', async (req, res) => {
  console.log('=== CREATE ORDER REQUEST ===');
  console.log('Request body:', req.body);
  
  try {
    // Validate required fields
    const {
      customerName,
      customerPhone,
      customerEmail,
      address,
      pincode,
      cartItems,
      totalAmount
    } = req.body;

    if (!customerName || !customerPhone || !customerEmail || !address || !pincode || !cartItems || !totalAmount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['customerName', 'customerPhone', 'customerEmail', 'address', 'pincode', 'cartItems', 'totalAmount']
      });
    }

    // Create Shiprocket order using the extracted function
    const orderResponse = await createShiprocketOrder(req.body);
    
    // Send success response
    res.json(orderResponse);
    
  } catch (error) {
    console.error('=== ORDER CREATION ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Always return JSON response
    res.status(500).json({
      success: false,
      error: 'Failed to create order',
      message: 'Please try again or contact support',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
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
    } = req.body;

    // Validate required fields
    if (!customerName || !customerPhone || !customerEmail || !address || !pincode || !cartItems || !totalAmount) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['customerName', 'customerPhone', 'customerEmail', 'address', 'pincode', 'cartItems', 'totalAmount']
      });
    }

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
      payment_method: "Prepaid",
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

    console.log('Creating Shiprocket order:', {
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
        // Send request to Shiprocket API
        shiprocketResponse = await axios.post(
          `${process.env.SHIPROCKET_API_URL}/orders/create/adhoc`,
          orderData,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.SHIPROCKET_TOKEN}`
            }
          }
        );
        console.log('Shiprocket response:', shiprocketResponse.data);
      } catch (shiprocketError) {
        console.error('Shiprocket API Error:', shiprocketError.response?.data || shiprocketError.message);
        // Continue with local order processing if Shiprocket fails
        shiprocketResponse = null;
      }
    } else {
      console.log('Shiprocket not configured, processing order locally');
    }

    console.log('Shiprocket response:', shiprocketResponse?.data || 'No Shiprocket response');

    // Extract relevant information from Shiprocket response or create fallback
    let responseData = {
      success: true,
      order_id: orderId,
      message: 'Order created successfully!',
      estimated_delivery: '3-7 business days'
    };

    if (shiprocketResponse && shiprocketResponse.data) {
      const {
        order_id: shiprocketOrderId,
        shipment_id,
        status,
        onboarding_completed_now
      } = shiprocketResponse.data;

      // Create tracking URL
      const trackingUrl = shipment_id
        ? `https://shiprocket.in/tracking/${shipment_id}`
        : null;

      responseData = {
        ...responseData,
        shiprocket_order_id: shiprocketOrderId,
        shipment_id,
        status,
        tracking_url: trackingUrl,
        shipping_integrated: true
      };
    } else {
      responseData = {
        ...responseData,
        shipping_integrated: false,
        message: 'Order received! We will contact you for shipping details.',
        note: 'Shipping will be arranged manually'
      };
    }

    // Send success response
    res.json(responseData);  } catch (error) {
    console.error('=== ORDER CREATION ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Always return JSON response
    res.status(500).json({
      success: false,
      error: 'Failed to create order',
      message: 'Please try again or contact support',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Test route for Shiprocket connection
app.get('/test-shiprocket', async (req, res) => {
  try {
    const response = await axios.get(
      `${process.env.SHIPROCKET_API_URL}/settings/company/pickup`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.SHIPROCKET_TOKEN}`
        }
      }
    );
    res.json({ 
      status: 'Shiprocket connection successful',
      pickup_locations: response.data.data
    });
  } catch (error) {
    res.status(500).json({
      status: 'Shiprocket connection failed',
      error: error.response?.data || error.message
    });
  }
});

// === NEW STATIC FRONTEND SETUP ===

// Serve static files (CSS, JS, images, etc.)
app.use(express.static(path.join(__dirname)));

// Serve specific HTML files (adjust if needed)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/cart', (req, res) => {
  res.sendFile(path.join(__dirname, 'cart.html'));
});

app.get('/checkout', (req, res) => {
  res.sendFile(path.join(__dirname, 'checkout.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'contact.html'));
});

// Optional: catch-all route for 404 or SPA support
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'index.html'));
// });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
