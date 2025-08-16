// Shiprocket API Management Solutions
// This file contains solutions for common Shiprocket API issues

/**
 * ISSUE 1: IP WHITELISTING
 * 
 * Problem: Shiprocket requires IP whitelisting for test tokens
 * Solutions:
 * 
 * A) Use Production Token (RECOMMENDED)
 *    - Production tokens don't require IP whitelisting
 *    - Work from any IP address
 *    - Contact Shiprocket support to get production token
 * 
 * B) Deploy on Static IP Server
 *    - Use VPS/Cloud hosting with static IP
 *    - Whitelist only server IP
 *    - All requests go through your server
 * 
 * C) Use Proxy/Load Balancer
 *    - Route all requests through a single IP
 *    - Whitelist that IP only
 */

/**
 * ISSUE 2: TOKEN EXPIRATION
 * 
 * Problem: Shiprocket tokens expire periodically
 * Solutions:
 * 
 * A) Auto Token Refresh (RECOMMENDED)
 *    - Implement automatic token renewal
 *    - Store refresh token securely
 *    - Handle 401 errors gracefully
 * 
 * B) Token Monitoring
 *    - Check token validity before API calls
 *    - Refresh when needed
 *    - Fallback mechanisms
 */

// Example implementation for token management
class ShiprocketTokenManager {
    constructor(email, password) {
        this.email = email;
        this.password = password;
        this.token = null;
        this.tokenExpiry = null;
    }

    async getValidToken() {
        // Check if current token is still valid
        if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.token;
        }

        // Token expired or doesn't exist, get new one
        return await this.refreshToken();
    }

    async refreshToken() {
        try {
            const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: this.email,
                    password: this.password
                })
            });

            const data = await response.json();
            
            if (data.token) {
                this.token = data.token;
                // Shiprocket tokens typically expire in 10 days
                this.tokenExpiry = Date.now() + (10 * 24 * 60 * 60 * 1000);
                
                // Update environment variable
                process.env.SHIPROCKET_TOKEN = this.token;
                
                console.log('✅ Shiprocket token refreshed successfully');
                return this.token;
            } else {
                throw new Error('Failed to get token from Shiprocket');
            }
        } catch (error) {
            console.error('❌ Error refreshing Shiprocket token:', error);
            throw error;
        }
    }
}

module.exports = ShiprocketTokenManager;
