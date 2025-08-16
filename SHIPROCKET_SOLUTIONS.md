# 🚀 Shiprocket API Solutions Guide

## 📋 **Problems & Solutions**

### **1. IP Whitelisting Issue**

**Problem**: Shiprocket requires IP whitelisting for test tokens, but you can't whitelist every customer's IP.

**Solutions**:

#### **🎯 Solution A: Get Production Token (RECOMMENDED)**
1. Contact Shiprocket support at support@shiprocket.in
2. Request production API token
3. Production tokens don't require IP whitelisting
4. Works from any IP address

#### **🎯 Solution B: Deploy on Static IP Server**
1. Use cloud hosting (AWS, Google Cloud, Azure, DigitalOcean)
2. Get static IP address
3. Whitelist only your server's IP
4. All customer requests go through your server

#### **🎯 Solution C: Use VPS/Hosting with Static IP**
Popular options:
- **DigitalOcean Droplet**: $5/month, static IP included
- **AWS EC2**: From $3.5/month
- **Google Cloud Compute**: From $4.28/month
- **Heroku**: Free tier available, static IP add-on

### **2. Token Expiration Issue**

**Problem**: Shiprocket tokens expire every 10 days.

**Solutions**:

#### **🎯 Solution A: Automatic Token Refresh (IMPLEMENTED)**
- Our new `ShiprocketManager` class handles this automatically
- Detects expired tokens (401 errors)
- Automatically refreshes using email/password
- Retries failed requests with new token

#### **🎯 Solution B: Token Monitoring**
- Health check endpoint: `/api/shiprocket/health`
- Manual refresh endpoint: `/api/shiprocket/refresh-token`
- Proactive token renewal before expiry

## 🛠️ **Implementation Steps**

### **Step 1: Update Environment Variables**

Add these to your `.env` file:
```env
SHIPROCKET_EMAIL=your_shiprocket_email@gmail.com
SHIPROCKET_PASSWORD=your_shiprocket_password
```

### **Step 2: Test Token Health**
Visit: `http://localhost:5000/api/shiprocket/health`

### **Step 3: Manual Token Refresh**
POST to: `http://localhost:5000/api/shiprocket/refresh-token`

## 🔧 **Advanced Solutions**

### **Option 1: Use Webhook Instead of Direct API**
- Set up webhook endpoint in your server
- Shiprocket sends updates to your webhook
- No IP restrictions for webhooks
- More reliable for tracking updates

### **Option 2: Use Shiprocket Partner API**
- Apply for partner status
- Get higher API limits
- Better support for production use
- No IP whitelisting requirements

### **Option 3: Use Third-party Integration Services**
- Zapier integration
- Third-party logistics APIs
- Multi-carrier shipping solutions

## 📞 **Contact Shiprocket Support**

When contacting Shiprocket support, mention:

1. **Request Production Token**:
   ```
   Subject: Request for Production API Token
   
   Dear Shiprocket Team,
   
   I am developing an e-commerce website for Heritage Bengal Jewellery and need a production API token that doesn't require IP whitelisting.
   
   Current issues:
   - Test token requires IP whitelisting
   - Cannot whitelist customer IPs
   - Need production-ready solution
   
   Website: [Your domain]
   Business: Heritage Bengal Jewellery
   Contact: [Your phone]
   
   Please provide production API credentials.
   
   Thanks,
   [Your name]
   ```

2. **Request Higher API Limits**
3. **Ask about Partner Program**

## 🚀 **Deployment Recommendations**

### **For Production**:

1. **Deploy on cloud hosting** with static IP
2. **Use production Shiprocket token**
3. **Set up monitoring** for token expiry
4. **Use environment variables** for sensitive data
5. **Implement proper error handling**

### **Hosting Options**:

1. **Heroku** (Easy deployment)
   - Free tier available
   - Easy Git-based deployment
   - Add-ons for static IP

2. **DigitalOcean** (Cost-effective)
   - $5/month droplet
   - Static IP included
   - Full server control

3. **Vercel/Netlify** (Serverless)
   - For frontend deployment
   - API routes support
   - Global CDN

## 📊 **Monitoring & Maintenance**

### **Daily Checks**:
- Monitor token expiry
- Check API response times
- Verify order creation success

### **Weekly Tasks**:
- Review error logs
- Update token if needed
- Test backup systems

### **Monthly Reviews**:
- Analyze API usage
- Review Shiprocket billing
- Update integration if needed

## 🆘 **Emergency Procedures**

### **If Shiprocket API Fails**:
1. Check token validity: `/api/shiprocket/health`
2. Refresh token: `/api/shiprocket/refresh-token`
3. Check IP whitelisting in Shiprocket dashboard
4. Use fallback order processing
5. Contact Shiprocket support

### **Fallback Options**:
1. Manual order processing
2. Alternative shipping providers
3. Direct courier booking
4. Customer notification system

---

## ✅ **What We've Implemented**

✅ Automatic token refresh  
✅ Error handling and retries  
✅ Health check endpoints  
✅ Fallback mechanisms  
✅ Comprehensive logging  
✅ Production-ready code  

## 🎯 **Next Steps**

1. **Add your Shiprocket password** to `.env`
2. **Test the new system** with a COD order
3. **Contact Shiprocket** for production token
4. **Deploy to cloud hosting** with static IP
5. **Monitor and maintain** the integration
