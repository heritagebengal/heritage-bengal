require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// MongoDB connection with correct database name
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://sadhu1616:NYhYajU4Qm7eFioB@cluster.xqikjxq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster';
const dbName = 'Heritage_Bengal_Jewellery'; // Correct database name

// Order schema
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
    originalTotal: { type: Number },
    discountApplied: { type: Number, default: 0 },
    paymentMethod: { type: String, enum: ['COD', 'Prepaid'], required: true },
    shiprocketOrderId: String,
    shipmentId: String,
    orderStatus: { type: String, default: 'Confirmed' },
    orderDate: { type: Date, default: Date.now }
}, { timestamps: true });

// Explicitly specify the collection name as 'Orders'
const Order = mongoose.model('Order', orderSchema, 'Orders');

// Connect to MongoDB
mongoose.connect(mongoUri, { dbName })
    .then(() => {
        console.log('Connected to MongoDB database:', dbName);
        startServer();
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Test endpoint to find your order
app.get('/find-order/:orderId', async (req, res) => {
    try {
        const orderId = req.params.orderId;
        console.log('Looking for order:', orderId);
        
        // Check database connection
        if (mongoose.connection.readyState !== 1) {
            return res.status(500).json({ error: 'Database not connected' });
        }
        
        // Get database info
        const dbInfo = {
            databaseName: mongoose.connection.db.databaseName,
            connectionState: mongoose.connection.readyState,
            collections: await mongoose.connection.db.listCollections().toArray()
        };
        
        // Look for the order
        const order = await Order.findOne({ orderId: orderId });
        
        // Get total count and recent orders
        const totalOrders = await Order.countDocuments();
        const recentOrders = await Order.find({}, { orderId: 1, customerName: 1, orderTotal: 1 })
            .sort({ createdAt: -1 })
            .limit(5);
        
        res.json({
            searchedOrderId: orderId,
            orderFound: !!order,
            order: order,
            databaseInfo: dbInfo,
            totalOrdersInDB: totalOrders,
            recentOrders: recentOrders
        });
        
    } catch (error) {
        console.error('Error finding order:', error);
        res.status(500).json({ 
            error: 'Database error', 
            details: error.message 
        });
    }
});

// Test endpoint to create a sample order for testing
app.post('/test-create-order', async (req, res) => {
    try {
        const testOrder = new Order({
            orderId: `TEST-${Date.now()}`,
            customerName: "Test Customer",
            customerPhone: "1234567890",
            customerEmail: "test@example.com",
            customerAddress: "Test Address",
            pincode: "700001",
            city: "Kolkata",
            state: "West Bengal",
            orderItems: [{
                productId: "test123",
                name: "Test Product",
                price: 1000,
                quantity: 1
            }],
            orderTotal: 1000,
            paymentMethod: "COD"
        });
        
        const savedOrder = await testOrder.save();
        res.json({ success: true, order: savedOrder });
        
    } catch (error) {
        console.error('Error creating test order:', error);
        res.status(500).json({ error: error.message });
    }
});

function startServer() {
    const PORT = 3001; // Different port to avoid conflicts
    app.listen(PORT, () => {
        console.log(`Test server running on http://localhost:${PORT}`);
        console.log(`\nTest your order: http://localhost:${PORT}/find-order/HB1755628121943347`);
        console.log(`Create test order: POST http://localhost:${PORT}/test-create-order`);
    });
}
