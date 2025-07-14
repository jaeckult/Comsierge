const express = require('express');
const smsWebhookRouter = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const twilio = require('twilio');

// Handle incoming SMS webhook from Twilio
smsWebhookRouter.post('/', async (req, res) => {
  try {
    console.log('Received SMS webhook:', req.body);
    
    const {
      MessageSid,
      AccountSid,
      From,
      To,
      Body,
      NumMedia,
      MediaUrl0,
      MessageStatus,
      Timestamp
    } = req.body;

    // Validate required fields
    if (!MessageSid || !From || !To || !Body) {
      console.error('Missing required webhook parameters:', req.body);
      return res.status(400).json({ error: 'Missing required webhook parameters' });
    }

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
      console.error('No user found for phone number:', To);
      return res.status(404).json({ error: 'User not found for this phone number' });
    }

    console.log('Found user:', user.username, 'for phone number:', To);

    // Store the incoming message in database
    const message = await prisma.message.create({
      data: {
        messageSid: MessageSid,
        accountSid: AccountSid,
        from: From,
        to: To,
        body: Body,
        numMedia: NumMedia ? parseInt(NumMedia) : 0,
        mediaUrl: MediaUrl0 || null,
        messageStatus: MessageStatus || 'received',
        timestamp: Timestamp ? new Date(Timestamp) : new Date(),
        userId: user.id,
        direction: 'inbound',
        twilioPhoneNumberId: user.twilioPhoneNumbers.find(p => p.twilioPhoneNumber === To)?.id
      }
    });

    console.log('Message stored:', message);

    // Send TwiML response (optional auto-reply)
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Message received! We'll get back to you soon.</Message>
</Response>`;

    res.set('Content-Type', 'text/xml');
    res.send(twimlResponse);

  } catch (error) {
    console.error('SMS webhook error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

module.exports = smsWebhookRouter; 