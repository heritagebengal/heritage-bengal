require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

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
            orderData 
        } = req.body;

        // Verify Razorpay signature
        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({ error: 'Invalid payment signature' });
        }

        // Create Shiprocket order
        const shiprocketOrder = await createShiprocketOrder(orderData, razorpay_payment_id);

        res.json({
            success: true,
            payment_id: razorpay_payment_id,
            order_id: razorpay_order_id,
            shiprocket_order_id: shiprocketOrder.order_id,
            tracking_url: shiprocketOrder.tracking_url
        });

    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ error: 'Payment verification failed' });
    }
});

// Create Shiprocket order function
async function createShiprocketOrder(orderData, paymentId) {
    try {
        const shiprocketData = {
            order_id: `HB_${Date.now()}`,
            order_date: new Date().toISOString().split('T')[0],
            pickup_location: "Primary",
            billing_customer_name: orderData.customerName,
            billing_last_name: "",
            billing_address: orderData.address,
            billing_city: orderData.city,
            billing_pincode: orderData.pincode,
            billing_state: orderData.state,
            billing_country: "India",
            billing_email: orderData.email,
            billing_phone: orderData.phone,
            shipping_is_billing: true,
            order_items: orderData.items.map(item => ({
                name: item.name,
                sku: item.id || item.name.replace(/\s+/g, '_'),
                units: item.quantity,
                selling_price: item.price,
                discount: 0,
                tax: 0,
                hsn: 71131900
            })),
            payment_method: "Prepaid",
            shipping_charges: 0,
            giftwrap_charges: 0,
            transaction_charges: 0,
            total_discount: 0,
            sub_total: orderData.total,
            length: 15,
            breadth: 10,
            height: 5,
            weight: 0.5
        };

        const response = await axios.post(
            `${process.env.SHIPROCKET_API_URL}/orders/create/adhoc`,
            shiprocketData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.SHIPROCKET_TOKEN}`
                }
            }
        );

        if (response.data && response.data.order_id) {
            return {
                order_id: response.data.order_id,
                shipment_id: response.data.shipment_id,
                tracking_url: `https://shiprocket.in/tracking/${response.data.shipment_id}`
            };
        } else {
            throw new Error('Failed to create Shiprocket order');
        }

    } catch (error) {
        console.error('Shiprocket order creation error:', error);
        throw error;
    }
}

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
