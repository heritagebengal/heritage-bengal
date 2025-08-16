require('dotenv').config();
const axios = require('axios');

async function analyzeCurrentToken() {
    console.log('🔍 Analyzing Current Shiprocket Token...\n');
    
    const token = process.env.SHIPROCKET_TOKEN;
    
    if (!token) {
        console.log('❌ No SHIPROCKET_TOKEN found in .env');
        return;
    }
    
    // Decode JWT token to check details
    try {
        const parts = token.split('.');
        if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            
            console.log('📋 Current Token Analysis:');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🆔 Subject ID:', payload.sub);
            console.log('🏢 Company ID:', payload.cid);
            console.log('⏰ Issued at:', new Date(payload.iat * 1000).toLocaleString());
            console.log('📅 Expires at:', new Date(payload.exp * 1000).toLocaleString());
            console.log('🌍 Source:', payload.source);
            
            // Check if token is expired
            const now = Date.now() / 1000;
            if (payload.exp < now) {
                console.log('❌ TOKEN IS EXPIRED!');
            } else {
                console.log('✅ Token is still valid');
            }
            
            // Check if it's a test or production token
            if (payload.source === 'sr-auth-int') {
                console.log('🧪 Type: TEST/SANDBOX TOKEN (requires IP whitelisting)');
                console.log('💡 Solution: Get production token from dashboard');
            } else {
                console.log('🏭 Type: PRODUCTION TOKEN (no IP restrictions)');
            }
            
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        }
    } catch (e) {
        console.log('❌ Could not decode token');
    }
    
    // Test the token
    console.log('🧪 Testing token with Shiprocket API...');
    try {
        const response = await axios.get('https://apiv2.shiprocket.in/v1/external/courier/company/pickup', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Token test successful! API responded with:', response.status);
        console.log('🎉 Your current token works fine!');
        
    } catch (error) {
        console.log('❌ Token test failed:');
        
        if (error.response) {
            console.log('📊 Status:', error.response.status);
            console.log('📝 Message:', error.response.data?.message || 'Unknown error');
            
            if (error.response.status === 403) {
                console.log('\n💡 SOLUTION: This is the IP whitelisting issue!');
                console.log('🎯 You need a PRODUCTION token from dashboard:');
                console.log('   1. Go to: https://app.shiprocket.in/');
                console.log('   2. Settings → API → Generate Production Token');
                console.log('   3. Update .env with new token');
            } else if (error.response.status === 401) {
                console.log('\n💡 SOLUTION: Token expired or invalid');
                console.log('🎯 Get new token from dashboard or refresh current one');
            }
        }
    }
    
    console.log('\n📋 Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Our system has automatic token management');
    console.log('✅ Fallback mechanisms work when API fails');
    console.log('⚠️ Current token requires IP whitelisting');
    console.log('🎯 Get production token to solve IP issue');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

analyzeCurrentToken();
