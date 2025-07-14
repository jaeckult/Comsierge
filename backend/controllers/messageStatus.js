const express = require('express');
const messageStatusRouter = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Handle message status webhook from Twilio
messageStatusRouter.post('/', async (req, res) => {
  try {
    console.log('Received message status webhook:', req.body);
    
    const {
      MessageSid,
      MessageStatus,
      ErrorCode,
      ErrorMessage,
      Timestamp,
      AccountSid,
      From,
      To,
      Body,
      NumMedia,
      MediaUrl0
    } = req.body;

    // Validate required fields
    if (!MessageSid || !MessageStatus) {
      console.error('Missing required status parameters:', req.body);
      return res.status(400).json({ error: 'Missing required status parameters' });
    }

    // Check if message exists in database
    let message = await prisma.message.findUnique({
      where: { messageSid: MessageSid }
    });

    if (!message) {
      console.log('Message not found in database, creating new entry for status update');
      
      // If message doesn't exist, try to find user by phone number
      const user = await prisma.user.findFirst({
        where: {
          twilioPhoneNumbers: {
            some: {
              twilioPhoneNumber: From || To
            }
          }
        },
        include: {
          twilioPhoneNumbers: true
        }
      });

      if (!user) {
        console.error('No user found for phone number:', From || To);
        return res.status(404).json({ error: 'User not found for this phone number' });
      }

      // Create message entry for status update
      message = await prisma.message.create({
        data: {
          messageSid: MessageSid,
          accountSid: AccountSid || 'UNKNOWN',
          from: From || 'UNKNOWN',
          to: To || 'UNKNOWN',
          body: Body || '',
          numMedia: NumMedia ? parseInt(NumMedia) : 0,
          mediaUrl: MediaUrl0 || null,
          messageStatus: MessageStatus,
          errorCode: ErrorCode || null,
          errorMessage: ErrorMessage || null,
          timestamp: Timestamp ? new Date(Timestamp) : new Date(),
          statusTimestamp: new Date(),
          direction: 'outbound', // Assume outbound for status updates
          userId: user.id,
          twilioPhoneNumberId: user.twilioPhoneNumbers.find(p => 
            p.twilioPhoneNumber === From || p.twilioPhoneNumber === To
          )?.id
        }
      });
    } else {
      // Update existing message status
      message = await prisma.message.update({
        where: { messageSid: MessageSid },
        data: {
          messageStatus: MessageStatus,
          errorCode: ErrorCode || null,
          errorMessage: ErrorMessage || null,
          statusTimestamp: Timestamp ? new Date(Timestamp) : new Date()
        }
      });
    }

    console.log('Message status updated:', {
      messageSid: MessageSid,
      status: MessageStatus,
      errorCode: ErrorCode,
      errorMessage: ErrorMessage
    });

    // Send success response
    res.status(200).json({ 
      message: 'Status updated successfully',
      messageSid: MessageSid,
      status: MessageStatus,
      errorCode: ErrorCode,
      errorMessage: ErrorMessage
    });

  } catch (error) {
    console.error('Message status webhook error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

module.exports = messageStatusRouter; 