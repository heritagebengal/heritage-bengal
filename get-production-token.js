require('dotenv').config();
const axios = require('axios');

// Script to get production token from Shiprocket
async function getProductionToken() {
    try {
        console.log('🔑 Getting Production Token from Shiprocket...\n');
        
        // You need to provide your actual Shiprocket credentials
        const email = process.env.SHIPROCKET_EMAIL || 'heritagebengal25@gmail.com';
        const password = prompt('Enter your Shiprocket password: ') || process.env.SHIPROCKET_PASSWORD;
        
        if (!password || password === 'your_shiprocket_password_here') {
            console.log('❌ Please provide your actual Shiprocket password');
            console.log('💡 Update SHIPROCKET_PASSWORD in .env file or enter when prompted');
            return;
        }

        console.log('📧 Email:', email);
        console.log('🔐 Password: [HIDDEN]');
        console.log('🌐 Environment: Production\n');

        // Make API call to get production token
        const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
            email: email,
            password: password
        });

        if (response.data && response.data.token) {
            const token = response.data.token;
            const expiresIn = response.data.expires_in || '10 days';
            
            console.log('✅ PRODUCTION TOKEN RECEIVED!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🔑 Token:', token);
            console.log('⏰ Expires in:', expiresIn);
            console.log('🌍 Environment: Production (No IP whitelisting required)');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            
            console.log('📝 COPY THIS TOKEN TO YOUR .env FILE:');
            console.log(`SHIPROCKET_TOKEN=${token}\n`);
            
            console.log('🔧 Or update automatically...');
            
            // Offer to update .env file automatically
            const updateEnv = true; // You can change this to false if you don't want auto-update
            
            if (updateEnv) {
                const fs = require('fs');
                let envContent = fs.readFileSync('.env', 'utf8');
                
                // Replace the token in .env file
                if (envContent.includes('SHIPROCKET_TOKEN=')) {
                    envContent = envContent.replace(
                        /SHIPROCKET_TOKEN=.*/,
                        `SHIPROCKET_TOKEN=${token}`
                    );
                } else {
                    envContent += `\nSHIPROCKET_TOKEN=${token}`;
                }
                
                fs.writeFileSync('.env', envContent);
                console.log('✅ .env file updated with new production token!');
            }
            
            // Test the token
            console.log('\n🧪 Testing the new production token...');
            await testProductionToken(token);
            
        } else {
            console.log('❌ No token received in response');
            console.log('Response:', response.data);
        }

    } catch (error) {
        console.error('❌ Error getting production token:', error.message);
        
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
            
            if (error.response.status === 403) {
                console.log('\n💡 Possible solutions:');
                console.log('1. Check your email and password are correct');
                console.log('2. Try logging into Shiprocket dashboard first');
                console.log('3. Contact Shiprocket support if account is locked');
                console.log('4. Use Method 2: Get token from dashboard manually');
            }
        }
    }
}

// Test the production token
async function testProductionToken(token) {
    try {
        // Test API call with production token
        const testResponse = await axios.get('https://apiv2.shiprocket.in/v1/external/courier/company/pickup', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (testResponse.status === 200) {
            console.log('✅ Production token is working! No IP whitelisting required.');
            console.log('🎉 You can now use this token for live orders.');
        }
        
    } catch (testError) {
        if (testError.response && testError.response.status === 403) {
            console.log('⚠️ Token might still require IP whitelisting (test environment)');
            console.log('💡 Contact Shiprocket support to confirm production access');
        } else {
            console.log('❌ Token test failed:', testError.message);
        }
    }
}

// Alternative: Manual instructions
function showManualInstructions() {
    console.log('\n📖 MANUAL METHOD - Get Token from Dashboard:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. Go to: https://app.shiprocket.in/');
    console.log('2. Login with your credentials');
    console.log('3. Go to: Settings → API');
    console.log('4. Click "Generate API Token"');
    console.log('5. Select "Production" environment');
    console.log('6. Copy the token');
    console.log('7. Update your .env file: SHIPROCKET_TOKEN=your_production_token');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Run the script
console.log('🚀 Shiprocket Production Token Generator\n');
console.log('Choose method:');
console.log('1. Automatic (using credentials)');
console.log('2. Manual (dashboard instructions)\n');

// For now, let's show both options
showManualInstructions();
getProductionToken();
