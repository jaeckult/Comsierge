const express = require('express');
const signupRouter = express.Router();
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const twilio = require('twilio');

signupRouter.post('/', async (req, res) => {
  console.log('Received signup request:', req.body);
  const {
    twilioAuthToken,
    twilioSid,
    twilioPhoneNumber,
    username,
    password,
  } = req.body;

  // Validate required fields
  if (!password || !username || !twilioAuthToken || !twilioSid || !twilioPhoneNumber) {
    return res.status(400).json({ error: 'Username, password, and Twilio credentials are required' });
  }

  try {
    // Check for existing user
    const existingUser = await prisma.user.findFirst({
      where: {
        username: username
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        password: passwordHash,
        username,
        twilioPhoneNumbers: {
          create: {
            twilioAuthToken,
            twilioAccountSid: twilioSid,
            twilioPhoneNumber,
            isPrimary: true,
          }
        }
      },
      include: { twilioPhoneNumbers: true }
    });

    // Configure Twilio webhooks for the phone number
    try {
      // Create Twilio client with user's credentials
      const twilioClient = twilio(twilioSid, twilioAuthToken);
      
      // Get the phone number SID
      const phoneNumbers = await twilioClient.incomingPhoneNumbers.list({
        phoneNumber: twilioPhoneNumber
      });

      if (phoneNumbers.length > 0) {
        const phoneNumberSid = phoneNumbers[0].sid;
        
        // Configure webhooks
        await twilioClient.incomingPhoneNumbers(phoneNumberSid).update({
          smsUrl: `${process.env.TWILIO_SMS_WEBHOOK_URL}/api/smsWebhook`,
          smsMethod: 'POST',
          statusCallback: `${process.env.TWILIO_SMS_WEBHOOK_URL}/api/messageStatus`,
          statusCallbackMethod: 'POST'
        });

        console.log('Twilio webhooks configured successfully for:', twilioPhoneNumber);
      } else {
        console.warn('Phone number not found in Twilio account:', twilioPhoneNumber);
      }
    } catch (twilioError) {
      console.error('Failed to configure Twilio webhooks:', twilioError);
      // Don't fail the signup, just log the error
    }

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        twilioPhoneNumber: user.twilioPhoneNumbers[0]?.twilioPhoneNumber,
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

module.exports = signupRouter;
