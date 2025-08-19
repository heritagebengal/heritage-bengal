const mongoose = require('mongoose');

// MongoDB connection
const mongoUri = 'mongodb+srv://sadhu1616:NYhYajU4Qm7eFioB@cluster.xqikjxq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster';
const dbName = 'Heritage_Bengal_Jewellery';

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

async function testOrderLookup() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri, { dbName });
        console.log('Connected to database:', mongoose.connection.db.databaseName);
        
        // Check connection
        console.log('Connection state:', mongoose.connection.readyState);
        
        // List all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Available collections:', collections.map(c => c.name));
        
        // Count total orders
        const totalOrders = await Order.countDocuments();
        console.log('Total orders in Orders collection:', totalOrders);
        
        // Look for the specific order
        const targetOrderId = 'HB1755628121943347';
        console.log(`\nLooking for order: ${targetOrderId}`);
        
        const order = await Order.findOne({ orderId: targetOrderId });
        if (order) {
            console.log('Order found:', {
                orderId: order.orderId,
                customerName: order.customerName,
                customerEmail: order.customerEmail,
                orderTotal: order.orderTotal,
                paymentMethod: order.paymentMethod,
                createdAt: order.createdAt
            });
        } else {
            console.log('Order NOT found');
        }
        
        // Get all order IDs for reference
        const allOrders = await Order.find({}, { orderId: 1, customerName: 1, orderTotal: 1, createdAt: 1 }).sort({ createdAt: -1 }).limit(10);
        console.log('\nRecent orders in database:');
        allOrders.forEach(o => {
            console.log(`- ${o.orderId} | ${o.customerName} | ₹${o.orderTotal} | ${o.createdAt}`);
        });
        
        // Also check if there are documents in the default 'orders' collection (lowercase)
        const defaultOrdersCount = await mongoose.connection.db.collection('orders').countDocuments();
        console.log('\nDocuments in lowercase "orders" collection:', defaultOrdersCount);
        
        if (defaultOrdersCount > 0) {
            const defaultOrders = await mongoose.connection.db.collection('orders').find({}, { projection: { orderId: 1, customerName: 1 }}).limit(5).toArray();
            console.log('Sample from lowercase collection:', defaultOrders);
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

testOrderLookup();
