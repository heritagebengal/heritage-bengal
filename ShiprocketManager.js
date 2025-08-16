const axios = require('axios');

class ShiprocketManager {
    constructor() {
        this.token = process.env.SHIPROCKET_TOKEN;
        this.email = process.env.SHIPROCKET_EMAIL;
        this.password = process.env.SHIPROCKET_PASSWORD;
        this.tokenExpiry = null;
        this.baseUrl = 'https://apiv2.shiprocket.in/v1/external';
    }

    // Get a valid token (refresh if needed)
    async getValidToken() {
        try {
            // If we have a token and it's not expired, use it
            if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
                return this.token;
            }

            // Otherwise, refresh the token
            console.log('🔄 Refreshing Shiprocket token...');
            return await this.refreshToken();
        } catch (error) {
            console.error('❌ Error getting valid token:', error);
            throw error;
        }
    }

    // Refresh the authentication token
    async refreshToken() {
        try {
            if (!this.email || !this.password) {
                throw new Error('Shiprocket email and password required for token refresh');
            }

            const response = await axios.post(`${this.baseUrl}/auth/login`, {
                email: this.email,
                password: this.password
            });

            if (response.data && response.data.token) {
                this.token = response.data.token;
                // Set expiry to 9 days from now (tokens typically last 10 days)
                this.tokenExpiry = Date.now() + (9 * 24 * 60 * 60 * 1000);
                
                console.log('✅ Shiprocket token refreshed successfully');
                console.log('🕐 Token expires at:', new Date(this.tokenExpiry).toLocaleString());
                
                return this.token;
            } else {
                throw new Error('Invalid response from Shiprocket auth API');
            }
        } catch (error) {
            console.error('❌ Error refreshing Shiprocket token:', error.message);
            throw error;
        }
    }

    // Make API call with automatic token retry
    async makeApiCall(endpoint, data, method = 'POST') {
        let retryCount = 0;
        const maxRetries = 2;

        while (retryCount <= maxRetries) {
            try {
                const token = await this.getValidToken();
                
                const response = await axios({
                    method: method,
                    url: `${this.baseUrl}${endpoint}`,
                    data: data,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                return response.data;
            } catch (error) {
                // If it's a 401 (unauthorized), try refreshing token
                if (error.response && error.response.status === 401 && retryCount < maxRetries) {
                    console.log('🔄 Token expired, refreshing and retrying...');
                    this.token = null; // Force token refresh
                    this.tokenExpiry = null;
                    retryCount++;
                    continue;
                }

                // If it's a 403 (forbidden), it might be IP whitelisting issue
                if (error.response && error.response.status === 403) {
                    console.error('🚫 Shiprocket API Access Forbidden (403)');
                    console.error('💡 This might be due to:');
                    console.error('   1. IP not whitelisted (if using test token)');
                    console.error('   2. Invalid token');
                    console.error('   3. API endpoint access restrictions');
                    console.error('🔧 Solutions:');
                    console.error('   1. Contact Shiprocket to get production token');
                    console.error('   2. Whitelist your server IP in Shiprocket dashboard');
                    console.error('   3. Deploy on a VPS with static IP');
                }

                throw error;
            }
        }
    }

    // Create order with improved error handling
    async createOrder(orderDetails, paymentId, paymentMethod = 'Prepaid') {
        try {
            const orderId = `HB_${Date.now()}`;
            
            const shiprocketData = {
                order_id: orderId,
                order_date: new Date().toISOString().split('T')[0],
                pickup_location: "Primary",
                billing_customer_name: orderDetails.customerName,
                billing_last_name: "",
                billing_address: orderDetails.address,
                billing_city: orderDetails.city || 'Kolkata',
                billing_pincode: orderDetails.pincode,
                billing_state: orderDetails.state || 'West Bengal',
                billing_country: "India",
                billing_email: orderDetails.customerEmail,
                billing_phone: orderDetails.customerPhone,
                shipping_is_billing: true,
                order_items: orderDetails.cartItems.map(item => ({
                    name: item.name,
                    sku: item.id || item.name.replace(/\s+/g, '_'),
                    units: item.quantity || 1,
                    selling_price: item.price,
                    discount: 0,
                    tax: 0,
                    hsn: 71131900
                })),
                payment_method: paymentMethod,
                shipping_charges: 0,
                giftwrap_charges: 0,
                transaction_charges: 0,
                total_discount: 0,
                sub_total: orderDetails.totalAmount,
                length: 15,
                breadth: 10,
                height: 5,
                weight: 0.5
            };

            console.log('📦 Creating Shiprocket order:', orderId);
            console.log('💳 Payment method:', paymentMethod);

            const response = await this.makeApiCall('/orders/create/adhoc', shiprocketData);

            if (response && response.order_id) {
                console.log('✅ Shiprocket order created successfully:', response.order_id);
                const estimatedDelivery = new Date();
                estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);
                
                return {
                    order_id: response.order_id,
                    shipment_id: response.shipment_id,
                    tracking_url: `https://shiprocket.in/tracking/${response.shipment_id}`,
                    estimated_delivery: estimatedDelivery.toDateString()
                };
            } else {
                throw new Error('Failed to create Shiprocket order - no order_id in response');
            }

        } catch (error) {
            console.error('❌ Shiprocket order creation error:', error.message);
            
            // Provide fallback for development/testing
            if (process.env.NODE_ENV === 'development' || error.message.includes('403')) {
                console.log('🔄 Using fallback order creation for development/testing');
                const estimatedDelivery = new Date();
                estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);
                
                return {
                    order_id: `HB_${Date.now()}`,
                    shipment_id: `SH_${Date.now()}`,
                    tracking_url: `https://shiprocket.in/tracking/SH_${Date.now()}`,
                    estimated_delivery: estimatedDelivery.toDateString(),
                    is_fallback: true
                };
            }
            
            throw error;
        }
    }

    // Check token validity
    async checkTokenValidity() {
        try {
            const token = await this.getValidToken();
            const response = await axios.get(`${this.baseUrl}/courier/company/pickup`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('✅ Shiprocket token is valid');
            return true;
        } catch (error) {
            console.error('❌ Shiprocket token is invalid:', error.message);
            return false;
        }
    }
}

module.exports = ShiprocketManager;
