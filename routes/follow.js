const express = require('express');
const { follow, unfollow } = require('../controllers/follow');
const followRouter = express.Router();

followRouter.post('/follow/:id',follow);
followRouter.post('/unfollow/:id',unfollow);

module.exports = followRouter;