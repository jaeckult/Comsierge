const logger = require('./logger')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const getTokenFrom = (request, response, next) => {
  const auth = request.get('authorization');
  logger.info('Authorization header:', auth); // Debug
  if (auth && auth.toLowerCase().startsWith('bearer ')) {
    request.token = auth.slice(7);
    logger.info('Extracted token:', request.token); // Debug
  } else {
    logger.info('No valid Bearer token found');
  }
  next();
};

const identifyUser = async (req, res, next) => {
  const token = req.token; 

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - No token provided' });
  }
  
  

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; 

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized - Invalid user' });
    }

    req.user = {
      id: user.id,
      username: user.username
    };
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(403).json({ error: 'Forbidden - Invalid token' });
  } finally {
    await prisma.$disconnect();
  }
};

const requireVerification = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user.isVerified) {
      return res.status(403).json({ 
        error: 'Account not verified. Please verify your phone number to continue.',
        requiresVerification: true
      });
    }

    next();
  } catch (error) {
    console.error('Error checking verification status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
};

const errorHandler = (error, request, response, next) => {
  logger.error(error)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }else if(error.name === 'PasswordErr'){
    return response.status(400).json({ error: error.message })
  }else if (error.name === 'MongoServerError' && error.code === 11000) {
    return response.status(400).json({ error: 'Username Taken' });
  }else if (error.name === 'JsonWebTokenError'){
    return( response.status(401).json({
      error: 'inivalid token'
    }))
  }
  next(error)
};


module.exports = {
  requestLogger,
  getTokenFrom,
  unknownEndpoint,
  identifyUser,
  requireVerification,
  errorHandler,
}