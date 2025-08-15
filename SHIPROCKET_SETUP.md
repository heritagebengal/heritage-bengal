# Heritage Bengal - Shiprocket Integration Setup

## 🚀 Complete Checkout Integration for Heritage Bengal Jewelry E-commerce

This implementation provides a complete checkout system with Shiprocket integration for your Heritage Bengal jewelry website.

## 📋 Features Implemented

### Backend Integration
- ✅ `/create-order` API endpoint for Shiprocket integration
- ✅ Secure token handling via environment variables
- ✅ Complete order data validation
- ✅ Error handling and logging
- ✅ Test endpoint for Shiprocket connection verification

### Frontend Enhancement
- ✅ Professional checkout form with customer details
- ✅ Order summary with cart items display
- ✅ Real-time form validation
- ✅ Coupon code system
- ✅ Loading states and user feedback
- ✅ Order confirmation modal with tracking

## 🛠️ Setup Instructions

### 1. Environment Configuration
Update your `.env` file with your Shiprocket credentials:

```env
# Shiprocket API Configuration
SHIPROCKET_TOKEN=your_actual_shiprocket_jwt_token_here
SHIPROCKET_API_URL=https://apiv2.shiprocket.in/v1/external
PICKUP_LOCATION=Primary

# Store Information
STORE_NAME=Heritage Bengal
STORE_EMAIL=info@heritagebengal.com
STORE_PHONE=+919876543210
```

### 2. Get Your Shiprocket Token
1. Login to your Shiprocket dashboard
2. Go to Settings > API
3. Generate a new API token
4. Copy the JWT token and replace `your_actual_shiprocket_jwt_token_here` in `.env`

### 3. Install Dependencies
```bash
npm install axios dotenv
```

### 4. Test Shiprocket Connection
Visit: `http://localhost:5000/test-shiprocket`
This will verify your token and show available pickup locations.

### 5. Start the Server
```bash
npm start
# or
node server.js
```

## 🔧 API Endpoints

### Create Order
- **POST** `/create-order`
- **Body:** JSON with customer and cart data
- **Response:** Order confirmation with tracking URL

### Test Connection
- **GET** `/test-shiprocket`
- **Response:** Connection status and pickup locations

## 📱 Frontend Usage

### Checkout Flow
1. Customer fills delivery details form
2. Reviews order summary and applies coupons
3. Clicks "Place Secure Order"
4. System validates data and creates Shiprocket order
5. Shows confirmation modal with tracking information
6. Cart is cleared and customer can track shipment

### Supported Features
- ✅ Form validation (name, phone, email, address, pincode)
- ✅ Coupon codes: `HERITAGE10`, `WELCOME15`, `NEWUSER20`
- ✅ Real-time order total calculation
- ✅ Mobile-responsive design
- ✅ Loading states and error handling

## 🔐 Security Features

- ✅ Shiprocket token stored securely in backend `.env`
- ✅ No sensitive data exposed to frontend
- ✅ Input validation and sanitization
- ✅ CORS protection
- ✅ Secure form data transmission

## 📦 Shiprocket Integration Details

### Order Data Sent to Shiprocket
```javascript
{
  order_id: "HB1723456789123",
  order_date: "2025-08-14",
  pickup_location: "Primary",
  billing_customer_name: "Customer Name",
  billing_address: "Complete Address",
  billing_city: "Kolkata",
  billing_pincode: "700001",
  billing_state: "West Bengal",
  billing_country: "India",
  billing_email: "customer@email.com",
  billing_phone: "9876543210",
  order_items: [
    {
      name: "Heritage Necklace",
      sku: "HB-001",
      units: 1,
      selling_price: 2499,
      hsn: 711311
    }
  ],
  payment_method: "Prepaid",
  weight: 0.05, // 50g per item
  length: 15,
  breadth: 10,
  height: 5
}
```

### Response from Shiprocket
```javascript
{
  success: true,
  order_id: "HB1723456789123",
  shiprocket_order_id: 12345,
  shipment_id: 67890,
  tracking_url: "https://shiprocket.in/tracking/67890",
  estimated_delivery: "3-7 business days"
}
```

## 🎨 Design Features

### Professional Checkout Page
- Modern two-column layout
- Customer details form with validation
- Order summary with item display
- Gradient backgrounds and shadows
- Mobile-responsive design
- Heritage Bengal color scheme

### User Experience
- Real-time form validation
- Loading states during order processing
- Success modal with tracking information
- Error handling with user-friendly messages
- Coupon system with instant feedback

## 🔧 Customization

### Adding New Coupons
Edit `js/heritage-checkout.js`:
```javascript
this.validCoupons = {
  'HERITAGE10': { discount: 0.10, type: 'percentage' },
  'NEWCODE25': { discount: 0.25, type: 'percentage' }
};
```

### Modifying Shipping Costs
Edit `server.js` in the `/create-order` route:
```javascript
shipping_charges: 50, // Add shipping cost
```

### Changing HSN Code
For different jewelry types, update HSN in `server.js`:
```javascript
hsn: 711311 // Current HSN for jewelry
```

## 🚨 Troubleshooting

### Common Issues

1. **Token Error (401)**
   - Verify Shiprocket token in `.env`
   - Check token expiry in Shiprocket dashboard

2. **Order Creation Failed (400)**
   - Verify all required fields are present
   - Check pincode serviceability in Shiprocket

3. **Connection Issues**
   - Test using `/test-shiprocket` endpoint
   - Verify internet connectivity
   - Check Shiprocket API status

### Debugging
- Check browser console for frontend errors
- Monitor server logs for backend issues
- Use `/test-shiprocket` for API connection testing

## 📞 Support

For Shiprocket API documentation: https://apidocs.shiprocket.in/
For Heritage Bengal support: info@heritagebengal.com

## 🎯 Next Steps

1. **Test with real orders** in Shiprocket sandbox
2. **Configure pickup locations** in Shiprocket dashboard
3. **Set up webhook notifications** for order updates
4. **Implement order tracking page** for customers
5. **Add email notifications** for order confirmations

---

Your Heritage Bengal checkout system is now ready for production! 🎉
