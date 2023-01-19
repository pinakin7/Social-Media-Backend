const express = require('express');
const { authenticate, login, register } = require('../controllers/auth');
const authRouter = express.Router();

authRouter.post('/authenticate',authenticate);
authRouter.post('/user',register);
authRouter.get('/user',login);

module.exports = authRouter;