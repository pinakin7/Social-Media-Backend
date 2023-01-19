const express = require('express');
const { likePost, unlikePost } = require('../controllers/like');
const likeRouter = express.Router();

likeRouter.post('/like/:id',likePost);
likeRouter.post('/unlike/:id',unlikePost);

module.exports = likeRouter;