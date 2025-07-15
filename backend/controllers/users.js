const express = require('express');
const userRouter = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const {identifyUser} = require('../utils/middleware');

userRouter.get('/', identifyUser, async (req, res) => {
    const users = await prisma.user.findMany();
    res.json(users);
});

// List contacts for authenticated user
userRouter.get('/contacts', identifyUser, async (req, res) => {
  const userId = req.user.id;
  const contacts = await prisma.contact.findMany({
    where: { userId },
    orderBy: { name: 'asc' }
  });
  res.json(contacts);
});

// Create a new contact
userRouter.post('/contacts', identifyUser, async (req, res) => {
  const userId = req.user.id;
  const { name, phone } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required' });
  }
  try {
    const contact = await prisma.contact.create({
      data: { name, phone, userId }
    });
    res.status(201).json(contact);
  } catch (error) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Contact with this phone already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create contact', details: error.message });
    }
  }
});

// Update a contact
userRouter.put('/contacts/:id', identifyUser, async (req, res) => {
  const userId = req.user.id;
  const contactId = req.params.id;
  const { name, phone } = req.body;
  try {
    const contact = await prisma.contact.updateMany({
      where: { id: contactId, userId },
      data: { name, phone }
    });
    if (contact.count === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json({ message: 'Contact updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update contact', details: error.message });
  }
});

// Delete a contact
userRouter.delete('/contacts/:id', identifyUser, async (req, res) => {
  const userId = req.user.id;
  const contactId = req.params.id;
  try {
    const contact = await prisma.contact.deleteMany({
      where: { id: contactId, userId }
    });
    if (contact.count === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json({ message: 'Contact deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete contact', details: error.message });
  }
});

// Comprehensive user data endpoint - shows everything
userRouter.get('/comprehensive/:id', identifyUser, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            include: {
                twilioPhoneNumbers: true,
                messages: {
                    include: {
                        twilioPhoneNumber: true,
                        originalMessage: true,
                        forwardedMessages: true
                    },
                    orderBy: {
                        timestamp: 'desc'
                    }
                },
                scheduledMessages: {
                    include: {
                        twilioPhoneNumber: true
                    },
                    orderBy: {
                        sendAt: 'desc'
                    }
                },
                messageForwardings: {
                    include: {
                        originalMessage: true,
                        forwardedMessage: true
                    },
                    orderBy: {
                        forwardedAt: 'desc'
                    }
                },
                contacts: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Calculate some statistics
        const stats = {
            totalMessages: user.messages.length,
            inboundMessages: user.messages.filter(m => m.direction === 'inbound').length,
            outboundMessages: user.messages.filter(m => m.direction === 'outbound').length,
            totalContacts: user.contacts.length,
            totalScheduledMessages: user.scheduledMessages.length,
            pendingScheduledMessages: user.scheduledMessages.filter(m => !m.sent && !m.failed).length,
            totalForwardings: user.messageForwardings.length,
            twilioPhoneNumbers: user.twilioPhoneNumbers.length
        };

        res.json({
            user: {
                id: user.id,
                username: user.username,
                password: user.password, // Including password as requested
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            },
            twilioPhoneNumbers: user.twilioPhoneNumbers.map(phone => ({
                id: phone.id,
                twilioPhoneNumber: phone.twilioPhoneNumber,
                twilioAccountSid: phone.twilioAccountSid,
                twilioAuthToken: phone.twilioAuthToken, // Including auth token as requested
                isPrimary: phone.isPrimary,
                createdAt: phone.createdAt,
                updatedAt: phone.updatedAt
            })),
            messages: user.messages,
            scheduledMessages: user.scheduledMessages,
            messageForwardings: user.messageForwardings,
            contacts: user.contacts,
            statistics: stats
        });
    } catch (error) {
        console.error('Error fetching comprehensive user data:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// User by ID endpoint (should be last)
userRouter.get('/:id', identifyUser, async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.params.id }
    });
    if (user) {
        res.json(user);
    } else {
        res.status(404).send({ error: 'User not found' });
    }
});

module.exports = userRouter;