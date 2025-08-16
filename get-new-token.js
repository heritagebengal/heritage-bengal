require('dotenv').config();
const axios = require('axios');

async function getTokenWithExistingCredentials() {
    try {
        console.log('🔄 Generating production token with your API user credentials...\n');
        
        const email = process.env.SHIPROCKET_EMAIL;
        const password = process.env.SHIPROCKET_PASSWORD;
        
        console.log('📧 API User Email:', email);
        console.log('🔐 API User Password: [HIDDEN]');
        
        if (!email || !password || password === 'your_new_api_user_password') {
            console.log('❌ Please update SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD in .env file');
            return;
        }
        
        console.log('\n🔄 Calling Shiprocket auth API...');
        
        const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
            email: email,
            password: password
        }, {
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Heritage Bengal API Client'
            }
        });
        
        console.log('📊 Response status:', response.status);
        
        if (response.data && response.data.token) {
            const token = response.data.token;
            
            console.log('\n✅ SUCCESS! Production Token Generated:');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🔑 New Token:', token.substring(0, 50) + '...');
            console.log('📅 Generated:', new Date().toLocaleString());
            console.log('⏰ Valid for: 10 days (240 hours)');
            console.log('🌍 Type: PRODUCTION');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            
            // Update .env file
            const fs = require('fs');
            let envContent = fs.readFileSync('.env', 'utf8');
            
            // Update token
            envContent = envContent.replace(
                /SHIPROCKET_TOKEN=.*/,
                `SHIPROCKET_TOKEN=${token}`
            );
            
            fs.writeFileSync('.env', envContent);
            console.log('✅ .env file updated with new production token!');
            
            console.log('\n🎯 IMPORTANT: Restart your server now!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('1. Stop current server (Ctrl+C)');
            console.log('2. Run: node server.js');
            console.log('3. Test your COD order again');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            
        } else {
            console.log('❌ No token received in response');
            console.log('Response data:', response.data);
        }
        
    } catch (error) {
        console.log('❌ Error generating token:', error.message);
        
        if (error.response) {
            console.log('� Status:', error.response.status);
            console.log('📝 Response:', error.response.data);
            
            if (error.response.status === 403) {
                console.log('\n💡 403 Forbidden - Possible issues:');
                console.log('1. API user credentials incorrect');
                console.log('2. API user not properly created in dashboard');
                console.log('3. Account access restrictions');
            } else if (error.response.status === 400) {
                console.log('\n💡 400 Bad Request - Possible issues:');
                console.log('1. Invalid email format');
                console.log('2. Missing required fields');
                console.log('3. API user not found');
            }
        } else {
            console.log('Network or connection error');
        }
        
        console.log('\n🔧 Fallback: Your current system works with mock orders');
        console.log('Your order HB_1755372699780 was processed with fallback system');
        console.log('Contact Shiprocket support for API access issues');
    }
}

getTokenWithExistingCredentials();
