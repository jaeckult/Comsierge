const express = require('express');
const app = express();
const cors = require('cors');
const userRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');
const signupRouter = require('./controllers/signup');
const smsWebhookRouter = require('./controllers/smsWebhook');
const messageStatusRouter = require('./controllers/messageStatus');
const messagesRouter = require('./controllers/messages');
// const conversationsRouter = require('./controllers/conversations')
const scheduleMessageRouter = require('./controllers/schedule');
const { getTokenFrom, identifyUser } = require('./utils/middleware');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const twilio = require('twilio');

app.use(express.json());
app.use(cors())
app.use(getTokenFrom);

app.use('/api/users', userRouter);
app.use('/api/login', loginRouter);
app.use('/api/signup', signupRouter);
app.use('/api/smsWebhook', smsWebhookRouter);
app.use('/api/messageStatus', messageStatusRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/schedule', scheduleMessageRouter);
// app.use('/api/contacts', contactRouter);

app.get('/', (req, res)=>{
    res.send('<h1>Welcome to the API</h1>')
});

// Test endpoint to check JWT_SECRET
app.get('/api/test-auth', (req, res) => {
  const hasJwtSecret = !!process.env.JWT_SECRET;
  const token = req.token;
  
  res.json({
    hasJwtSecret,
    jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
    jwtSecretPreview: process.env.JWT_SECRET ? `${process.env.JWT_SECRET.substring(0, 10)}...` : 'None',
    tokenProvided: !!token,
    tokenLength: token ? token.length : 0,
    tokenPreview: token ? `${token.substring(0, 20)}...` : 'None',
    authHeader: req.get('authorization'),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint to check user's Twilio credentials
app.get('/api/test-twilio', identifyUser, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        twilioPhoneNumbers: {
          where: { isPrimary: true }
        }
      }
    });

    if (!user || !user.twilioPhoneNumbers.length) {
      return res.status(400).json({ error: 'No Twilio phone number configured' });
    }

    const twilioPhone = user.twilioPhoneNumbers[0];
    
    res.json({
      user: {
        id: user.id,
        username: user.username
      },
      twilioPhone: {
        id: twilioPhone.id,
        phoneNumber: twilioPhone.twilioPhoneNumber,
        accountSid: twilioPhone.twilioAccountSid,
        hasAuthToken: !!twilioPhone.twilioAuthToken,
        authTokenLength: twilioPhone.twilioAuthToken ? twilioPhone.twilioAuthToken.length : 0,
        isPrimary: twilioPhone.isPrimary
      }
    });
  } catch (error) {
    console.error('Test Twilio error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Test webhook endpoint for debugging
app.post('/api/test-webhook', async (req, res) => {
  try {
    console.log('Test webhook received:', req.body);
    
    // Simulate the SMS webhook processing
    const {
      MessageSid,
      From,
      To,
      Body,
      MessageStatus
    } = req.body;

    // Find the user by Twilio phone number
    const user = await prisma.user.findFirst({
      where: {
        twilioPhoneNumbers: {
          some: {
            twilioPhoneNumber: To
          }
        }
      },
      include: {
        twilioPhoneNumbers: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found for this phone number' });
    }

    // Store the test message in database
    const message = await prisma.message.create({
      data: {
        messageSid: MessageSid,
        accountSid: 'TEST_ACCOUNT_SID',
        from: From,
        to: To,
        body: Body,
        numMedia: 0,
        mediaUrl: null,
        messageStatus: MessageStatus || 'received',
        timestamp: new Date(),
        userId: user.id,
        direction: 'inbound',
        twilioPhoneNumberId: user.twilioPhoneNumbers.find(p => p.twilioPhoneNumber === To)?.id
      }
    });

    res.json({
      success: true,
      message: 'Test webhook processed successfully',
      storedMessage: message
    });

  } catch (error) {
    console.error('Test webhook error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Configure webhooks for existing user
app.post('/api/configure-webhooks', identifyUser, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        twilioPhoneNumbers: {
          where: { isPrimary: true }
        }
      }
    });

    if (!user || !user.twilioPhoneNumbers.length) {
      return res.status(400).json({ error: 'No Twilio phone number configured' });
    }

    const twilioPhone = user.twilioPhoneNumbers[0];
    
    // Create Twilio client with user's credentials
    const twilioClient = twilio(twilioPhone.twilioAccountSid, twilioPhone.twilioAuthToken);
    
    // Get the phone number SID
    const phoneNumbers = await twilioClient.incomingPhoneNumbers.list({
      phoneNumber: twilioPhone.twilioPhoneNumber
    });

    if (phoneNumbers.length === 0) {
      return res.status(400).json({ error: 'Phone number not found in Twilio account' });
    }

    const phoneNumberSid = phoneNumbers[0].sid;
    
    // Configure webhooks
    await twilioClient.incomingPhoneNumbers(phoneNumberSid).update({
      smsUrl: `${process.env.TWILIO_SMS_WEBHOOK_URL}/api/smsWebhook`,
      smsMethod: 'POST',
      statusCallback: `${process.env.TWILIO_SMS_WEBHOOK_URL}/api/messageStatus`,
      statusCallbackMethod: 'POST'
    });

    res.json({
      success: true,
      message: 'Webhooks configured successfully',
      webhookUrl: `${process.env.TWILIO_SMS_WEBHOOK_URL}/api/smsWebhook`,
      statusCallbackUrl: `${process.env.TWILIO_SMS_WEBHOOK_URL}/api/messageStatus`
    });

  } catch (error) {
    console.error('Configure webhooks error:', error);
    res.status(500).json({ error: 'Failed to configure webhooks', details: error.message });
  }
});

app.listen(3000, () => {
  console.log(`Example app listening at http://localhost:3000`);    
});