const express = require('express');
const signupRouter = express.Router();
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { client } = require('../utils/twilioClient');

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
