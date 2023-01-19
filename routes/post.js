const express = require('express');
const { createPost, deletePost, getPost, getPosts } = require('../controllers/post');
const postRouter = express.Router();

postRouter.post('/posts',createPost);
postRouter.delete('/posts/:id',deletePost);
postRouter.get('/posts/:id',getPost);
postRouter.get('/all_posts',getPosts);

module.exports = postRouter;