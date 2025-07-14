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