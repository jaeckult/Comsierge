# Webhook Setup Guide

## 🔄 Correct Webhook Flow

### 1. **Sending SMS (Frontend → Backend → Twilio)**
```
Frontend → POST /api/messages/sendSMS → Backend → Twilio API
```

### 2. **Receiving Webhooks (Twilio → Backend)**
```
Twilio → POST /api/smsWebhook → Backend (Incoming SMS)
Twilio → POST /api/messageStatus → Backend (Status Updates)
```

## 🛠️ Backend Webhook Endpoints

### **Incoming SMS Webhook**
- **URL**: `https://your-domain.com/api/smsWebhook`
- **Method**: POST
- **Content-Type**: `application/x-www-form-urlencoded`
- **Purpose**: Handle incoming SMS messages

### **Message Status Webhook**
- **URL**: `https://your-domain.com/api/messageStatus`
- **Method**: POST
- **Content-Type**: `application/x-www-form-urlencoded`
- **Purpose**: Handle message status updates (delivered, failed, etc.)

## 📱 Twilio Configuration

### **1. Set Webhook URLs in Twilio Console**
1. Go to [Twilio Console](https://console.twilio.com/)
2. Navigate to Phone Numbers → Manage → Active numbers
3. Click on your phone number
4. Set webhook URLs:
   - **Webhook URL for incoming SMS**: `https://your-domain.com/api/smsWebhook`
   - **Status callback URL**: `https://your-domain.com/api/messageStatus`

### **2. For Development (ngrok)**
If testing locally:
```bash
# Install ngrok
npm install -g ngrok

# Start your backend server
cd backend && npm start

# In another terminal, expose your local server
ngrok http 3000

# Use the ngrok URL in Twilio webhook settings
# Example: https://abc123.ngrok.io/api/smsWebhook
```

## 🔒 Security Considerations

### **Webhook Signature Verification**
In production, verify webhook signatures:
```javascript
const twilio = require('twilio');

const validateRequest = (req, res, next) => {
  const twilioSignature = req.headers['x-twilio-signature'];
  const url = req.protocol + '://' + req.get('host') + req.originalUrl;
  const params = req.body;
  
  const requestIsValid = twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN,
    twilioSignature,
    url,
    params
  );
  
  if (!requestIsValid) {
    return res.status(403).json({ error: 'Invalid webhook signature' });
  }
  
  next();
};
```

## 🧪 Testing Webhooks

### **1. Test Incoming SMS**
Send an SMS to your Twilio number and check:
- Backend logs for webhook receipt
- Database for stored message
- Frontend inbox for new message

### **2. Test Status Updates**
Send an SMS and monitor:
- Backend logs for status webhook
- Database for status updates
- Frontend for status changes

## ❌ What NOT to Do

- ❌ **Don't call webhook endpoints from frontend**
- ❌ **Don't use webhook URLs for sending SMS**
- ❌ **Don't expose webhook endpoints without authentication**
- ❌ **Don't ignore webhook signature verification in production**

## ✅ What TO Do

- ✅ **Use `/api/messages/sendSMS` for sending SMS**
- ✅ **Let Twilio call webhook endpoints automatically**
- ✅ **Verify webhook signatures in production**
- ✅ **Handle webhook errors gracefully**
- ✅ **Log webhook events for debugging**

## 🔍 Debugging

### **Check Webhook Receipt**
```bash
# Backend logs should show:
"Received SMS webhook: { MessageSid: '...', From: '...', To: '...', Body: '...' }"
"Received message status webhook: { MessageSid: '...', MessageStatus: '...' }"
```

### **Check Database**
```sql
-- Check for stored messages
SELECT * FROM Message ORDER BY timestamp DESC LIMIT 10;

-- Check for status updates
SELECT messageSid, messageStatus, statusTimestamp FROM Message WHERE messageStatus != 'queued';
``` 