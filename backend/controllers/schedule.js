// cron/sendScheduledMessages.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const twilio = require('twilio');
require('dotenv').config();
const scheduleMessageRouter = require('express').Router();
const { identifyUser } = require('../utils/middleware');

// Schedule a new message
scheduleMessageRouter.post('/', identifyUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { to, body, sendAt } = req.body;
    if (!to || !body || !sendAt) {
      return res.status(400).json({ error: 'To, body, and sendAt are required' });
    }
    // Find user's primary Twilio phone number
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { twilioPhoneNumbers: { where: { isPrimary: true } } }
    });
    if (!user || !user.twilioPhoneNumbers.length) {
      return res.status(400).json({ error: 'No Twilio phone number configured' });
    }
    const twilioPhone = user.twilioPhoneNumbers[0];
    // Create scheduled message
    const scheduled = await prisma.scheduledMessage.create({
      data: {
        to,
        from: twilioPhone.twilioPhoneNumber,
        body,
        sendAt: new Date(sendAt),
        userId,
        twilioPhoneNumberId: twilioPhone.id
      }
    });
    res.status(201).json({ message: 'Message scheduled', data: scheduled });
  } catch (error) {
    console.error('Schedule message error:', error);
    res.status(500).json({ error: 'Failed to schedule message', details: error.message });
  }
});

// Get all scheduled messages for the authenticated user
scheduleMessageRouter.get('/', identifyUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const scheduled = await prisma.scheduledMessage.findMany({
      where: { userId },
      orderBy: { sendAt: 'desc' },
      include: { twilioPhoneNumber: true }
    });
    res.json({ scheduled });
  } catch (error) {
    console.error('Get scheduled messages error:', error);
    res.status(500).json({ error: 'Failed to fetch scheduled messages', details: error.message });
  }
});

// Cancel a scheduled message
scheduleMessageRouter.post('/:id/cancel', identifyUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const scheduledMessageId = req.params.id;
    const scheduled = await prisma.scheduledMessage.updateMany({
      where: { id: scheduledMessageId, userId, sent: false, failed: false },
      data: { failed: true, errorMessage: 'Cancelled by user' }
    });
    if (scheduled.count === 0) {
      return res.status(404).json({ error: 'Scheduled message not found or already sent/failed' });
    }
    res.json({ message: 'Scheduled message cancelled' });
  } catch (error) {
    console.error('Cancel scheduled message error:', error);
    res.status(500).json({ error: 'Failed to cancel scheduled message', details: error.message });
  }
});

module.exports = scheduleMessageRouter;