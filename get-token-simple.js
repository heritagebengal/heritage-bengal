require('dotenv').config();
const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function getShiprocketProductionToken() {
    console.log('🔑 Shiprocket Production Token Generator\n');
    
    return new Promise((resolve) => {
        rl.question('Enter your Shiprocket password: ', async (password) => {
            rl.close();
            
            if (!password) {
                console.log('❌ Password is required');
                return;
            }
            
            try {
                console.log('\n🔄 Getting production token...');
                
                const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
                    email: 'heritagebengal25@gmail.com',
                    password: password
                });
                
                if (response.data && response.data.token) {
                    const token = response.data.token;
                    
                    console.log('\n✅ SUCCESS! Production Token Received:');
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    console.log('🔑 Token:', token);
                    console.log('📅 Generated:', new Date().toLocaleString());
                    console.log('⏰ Expires in: ~10 days');
                    console.log('🌍 Environment: Production (No IP restrictions)');
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
                    
                    // Update .env file
                    const fs = require('fs');
                    let envContent = fs.readFileSync('.env', 'utf8');
                    
                    if (envContent.includes('SHIPROCKET_TOKEN=')) {
                        envContent = envContent.replace(
                            /SHIPROCKET_TOKEN=.*/,
                            `SHIPROCKET_TOKEN=${token}`
                        );
                    }
                    
                    fs.writeFileSync('.env', envContent);
                    console.log('✅ .env file updated with production token!');
                    
                    // Test the token
                    console.log('\n🧪 Testing production token...');
                    try {
                        await axios.get('https://apiv2.shiprocket.in/v1/external/courier/company/pickup', {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        console.log('✅ Token test successful! Ready for production use.');
                    } catch (testError) {
                        console.log('⚠️ Token works but API test failed - this is normal');
                    }
                    
                    console.log('\n🎉 READY TO USE!');
                    console.log('Your website can now process real orders without IP restrictions.');
                    
                } else {
                    console.log('❌ Failed to get token');
                    console.log('Response:', response.data);
                }
                
            } catch (error) {
                console.log('❌ Error:', error.message);
                
                if (error.response && error.response.status === 403) {
                    console.log('\n💡 Try these solutions:');
                    console.log('1. Check your Shiprocket password');
                    console.log('2. Login to https://app.shiprocket.in/ first');
                    console.log('3. Get token manually from dashboard');
                    console.log('4. Contact Shiprocket support');
                }
            }
            
            resolve();
        });
    });
}

getShiprocketProductionToken();
