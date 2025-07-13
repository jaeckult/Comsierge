const userRouter = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const {identifyUser} = require('../utils/middleware');

userRouter.get('/', identifyUser, async (req, res) => {
    const users = await prisma.user.findMany();
    res.json(users);
});
userRouter.get('/:id', identifyUser, async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: parseInt(req.params.id) }
    });
    if (user) {
        res.json(user);
    } else {
        res.status(404).send({ error: 'User not found' });
    }
});

module.exports = userRouter;