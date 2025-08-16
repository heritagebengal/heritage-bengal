# 🎯 How to Get Shiprocket Production Token

## 📖 **Step-by-Step Guide**

### **Method 1: Shiprocket Dashboard (RECOMMENDED)**

1. **Go to Shiprocket Dashboard**
   - Visit: https://app.shiprocket.in/
   - Login with your credentials

2. **Navigate to API Settings**
   - Click on **"Settings"** (gear icon) in left sidebar
   - Click on **"API"** or **"Integrations"**

3. **Generate Production Token**
   - Look for **"API Token"** section
   - Click **"Generate New Token"** or **"Create Token"**
   - **IMPORTANT**: Select **"Production"** environment (NOT Test/Sandbox)

4. **Copy the Token**
   - Copy the generated token (long string starting with "eyJ...")
   - This is your production token!

5. **Update Your .env File**
   ```env
   SHIPROCKET_TOKEN=your_new_production_token_here
   ```

### **Method 2: Contact Shiprocket Support**

If you can't find the API section in dashboard:

**Email**: support@shiprocket.in  
**Phone**: +91-11-43595149

**Email Template**:
```
Subject: Request Production API Token for Heritage Bengal Jewellery

Dear Shiprocket Team,

I need a production API token for my e-commerce website "Heritage Bengal Jewellery".

Account Details:
- Email: heritagebengal25@gmail.com
- Business: Heritage Bengal Jewellery
- Phone: +917439543717

Requirements:
- Production environment token (not test/sandbox)
- No IP whitelisting restrictions
- For live order processing

Current Issue:
- Test token requires IP whitelisting
- Cannot whitelist all customer IPs
- Need production-ready solution

Please provide production API credentials or guide me to generate them.

Thank you!
```

### **Method 3: Shiprocket Partner Program**

For high-volume businesses:
1. Apply for Shiprocket Partner status
2. Get dedicated account manager
3. Access to production APIs without restrictions
4. Better rates and support

## 🔍 **Token Types Comparison**

| Type | IP Whitelisting | Usage | Best For |
|------|----------------|-------|----------|
| **Test/Sandbox** | ✅ Required | Testing only | Development |
| **Production** | ❌ Not required | Live orders | Production websites |
| **Partner** | ❌ Not required | High volume | Enterprise |

## 🎯 **What You Need**

### **Production Token Benefits**:
✅ No IP whitelisting required  
✅ Works from any server/hosting  
✅ Real order processing  
✅ Live tracking integration  
✅ Customer email notifications  

### **Current Setup Issues**:
❌ Test token requires IP whitelisting  
❌ 403 Forbidden errors from different IPs  
❌ Cannot whitelist all customer IPs  

## 🚀 **After Getting Production Token**

1. **Update .env file**:
   ```env
   SHIPROCKET_TOKEN=your_production_token
   ```

2. **Restart your server**:
   ```bash
   node server.js
   ```

3. **Test with real order**:
   - Place a COD order
   - Check if Shiprocket order is created
   - Verify email notifications

4. **Monitor health**:
   - Visit: http://localhost:5000/api/shiprocket/health
   - Should show: "token_valid: true"

## 🆘 **Troubleshooting**

### **If you still get 403 errors with production token**:
1. Verify token is actually production (not test)
2. Check if token has expired
3. Contact Shiprocket to confirm account status
4. Try refreshing token from dashboard

### **If you can't find API section in dashboard**:
1. Check if your account has API access enabled
2. Contact Shiprocket support
3. May need to upgrade account plan

### **Alternative: Manual Order Management**
If API access is limited:
1. Use Shiprocket dashboard for manual order processing
2. Export customer data from your website
3. Import orders manually to Shiprocket
4. Send tracking info to customers via email

## 📞 **Shiprocket Support Contacts**

- **Email**: support@shiprocket.in
- **Phone**: +91-11-43595149
- **Chat**: Available on dashboard
- **Hours**: Mon-Fri 10 AM - 7 PM IST

---

## ✅ **Quick Action Items**

1. **Login to Shiprocket dashboard** → Settings → API
2. **Generate production token** (not test/sandbox)
3. **Copy token** to .env file
4. **Restart server** and test
5. **If issues persist** → Contact Shiprocket support

Your production token will solve the IP whitelisting issue permanently! 🎉
