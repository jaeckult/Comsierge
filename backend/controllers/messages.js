const express = require('express');
const messagesRouter = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const twilio = require('twilio');
const { identifyUser } = require('../utils/middleware');

// Send SMS message
messagesRouter.post('/sendSMS', identifyUser, async (req, res) => {
  try {
    const { to, body, mediaUrl } = req.body;
    const userId = req.user.id;

    if (!to || !body) {
      return res.status(400).json({ error: 'To and body are required' });
    }

    // Get user's Twilio credentials
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

    // Send SMS via Twilio with status callback
    const messageData = {
      body: body,
      from: twilioPhone.twilioPhoneNumber,
      to: to,
      statusCallback: `${process.env.TWILIO_SMS_WEBHOOK_URL}/api/messageStatus`,
      statusCallbackMethod: 'POST'
    };

    if (mediaUrl) {
      messageData.mediaUrl = [mediaUrl];
    }

    console.log('Sending SMS with data:', messageData);

    const twilioMessage = await twilioClient.messages.create(messageData);

    console.log('Twilio response:', twilioMessage);

    // Store message in database with initial status from Twilio
    const message = await prisma.message.create({
      data: {
        messageSid: twilioMessage.sid,
        accountSid: twilioMessage.accountSid,
        from: twilioMessage.from,
        to: twilioMessage.to,
        body: twilioMessage.body,
        numMedia: parseInt(twilioMessage.numMedia) || 0,
        mediaUrl: mediaUrl || null,
        messageStatus: twilioMessage.status, // Initial status from Twilio
        timestamp: new Date(),
        userId: userId,
        direction: 'outbound-api',
        twilioPhoneNumberId: twilioPhone.id
      }
    });

    res.status(201).json({
      message: 'SMS sent successfully',
      messageSid: twilioMessage.sid,
      status: twilioMessage.status,
      statusCallbackUrl: `${process.env.TWILIO_SMS_WEBHOOK_URL}/api/messageStatus`,
      data: message
    });

  } catch (error) {
    console.error('Send SMS error:', error);
    
    // Provide more specific error messages
    if (error.code === 21211) {
      res.status(400).json({ error: 'Invalid phone number format' });
    } else if (error.code === 21608) {
      res.status(400).json({ error: 'Invalid phone number' });
    } else if (error.code === 21614) {
      res.status(400).json({ error: 'Phone number is not mobile' });
    } else if (error.code === 21610) {
      res.status(400).json({ error: 'Message body is required' });
    } else if (error.code === 21612) {
      res.status(400).json({ error: 'Message body too long' });
    } else {
      res.status(500).json({ 
        error: 'Failed to send SMS', 
        details: error.message,
        code: error.code 
      });
    }
  }
});

// Get message history
messagesRouter.get('/', identifyUser, async (req, res) => {
  
  try {
    const userId = req.user.id;
    const { 
      limit = 50, 
      offset = 0, 
      direction, 
      status,
      from,
      to,
      startDate,
      endDate 
    } = req.query;

    // Build where clause
    const where = { userId: userId };

    if (direction) where.direction = direction;
    if (status) where.messageStatus = status;
    if (from) where.from = from;
    if (to) where.to = to;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    const messages = await prisma.message.findMany({
      where: where,
      orderBy: { timestamp: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
      include: {
        twilioPhoneNumber: true
      }
    });

    const total = await prisma.message.count({ where: where });

    res.json({
      messages,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + messages.length
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages', details: error.message });
  }
});

// Get message by ID
messagesRouter.get('/:id', identifyUser, async (req, res) => {
  try {
    const messageId = req.params.id; // Remove parseInt - IDs are strings
    const userId = req.user.id;

    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        userId: userId
      },
      include: {
        twilioPhoneNumber: true
      }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json(message);

  } catch (error) {
    console.error('Get message error:', error);
    res.status(500).json({ error: 'Failed to fetch message', details: error.message });
  }
});

// Update message status
messagesRouter.put('/:id/status', identifyUser, async (req, res) => {
  try {
    const messageId = req.params.id; // Remove parseInt - IDs are strings
    const userId = req.user.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const message = await prisma.message.updateMany({
      where: {
        id: messageId,
        userId: userId
      },
      data: {
        messageStatus: status,
        statusTimestamp: new Date()
      }
    });

    if (message.count === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ message: 'Status updated successfully' });

  } catch (error) {
    console.error('Update message status error:', error);
    res.status(500).json({ error: 'Failed to update message status', details: error.message });
  }
});

// Delete message
messagesRouter.delete('/:id', identifyUser, async (req, res) => {
  try {
    const messageId = req.params.id; // Remove parseInt - IDs are strings
    const userId = req.user.id;

    const message = await prisma.message.deleteMany({
      where: {
        id: messageId,
        userId: userId
      }
    });

    if (message.count === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ message: 'Message deleted successfully' });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Failed to delete message', details: error.message });
  }
});

// Check message status from Twilio
messagesRouter.get('/:id/check-status', identifyUser, async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.user.id;

    // Get the message from database
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        userId: userId
      },
      include: {
        twilioPhoneNumber: true
      }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Create Twilio client with user's credentials
    const twilioClient = twilio(
      message.twilioPhoneNumber.twilioAccountSid,
      message.twilioPhoneNumber.twilioAuthToken
    );

    // Fetch current status from Twilio
    const twilioMessage = await twilioClient.messages(message.messageSid).fetch();

    // Update message status in database
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        messageStatus: twilioMessage.status,
        errorCode: twilioMessage.errorCode || null,
        errorMessage: twilioMessage.errorMessage || null,
        statusTimestamp: new Date()
      }
    });

    res.json({
      message: 'Status checked and updated',
      messageSid: message.messageSid,
      previousStatus: message.messageStatus,
      currentStatus: twilioMessage.status,
      errorCode: twilioMessage.errorCode,
      errorMessage: twilioMessage.errorMessage,
      data: updatedMessage
    });

  } catch (error) {
    console.error('Check message status error:', error);
    res.status(500).json({ error: 'Failed to check message status', details: error.message });
  }
});

// Get message status summary
messagesRouter.get('/status/summary', identifyUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get status counts for user's messages
    const statusSummary = await prisma.message.groupBy({
      by: ['messageStatus'],
      where: { userId: userId },
      _count: {
        messageStatus: true
      }
    });

    // Get recent status updates
    const recentUpdates = await prisma.message.findMany({
      where: { 
        userId: userId,
        statusTimestamp: {
          not: null
        }
      },
      orderBy: { statusTimestamp: 'desc' },
      take: 10,
      select: {
        id: true,
        messageSid: true,
        from: true,
        to: true,
        messageStatus: true,
        statusTimestamp: true,
        errorCode: true,
        errorMessage: true
      }
    });

    res.json({
      statusSummary: statusSummary.map(item => ({
        status: item.messageStatus,
        count: item._count.messageStatus
      })),
      recentUpdates
    });

  } catch (error) {
    console.error('Get status summary error:', error);
    res.status(500).json({ error: 'Failed to get status summary', details: error.message });
  }
});

module.exports = messagesRouter; 