const express = require('express');
const { createComment} = require('../controllers/comment');
const commentRouter = express.Router();

commentRouter.post('/comment/:id',createComment);

module.exports = commentRouter;