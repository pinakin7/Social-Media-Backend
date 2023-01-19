const { StatusCodes } = require("http-status-codes");
// const { BadRequestError, UnauthenticatedError } = require("../errors");
const User = require("../models/User");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const Post = require("../models/Post");

const createPost = async (req, res) => {
  const token = req.headers.authorization;
  const { title, description } = req.body;
  //   console.log(token, title, description);
  // Check if token is provided
  if (!token) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "Token is required" });
    return;
  }
  if (!title || !description) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: "Title and Description are required" });
    return;
  }
  // Verify token
  try {
    const { email } = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user in the database
    const user = await User.findOne({ email });
    // console.log(user)
    // Check if user exists
    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
      return;
    }

    // Create new post
    const post = new Post({ title, description, author: user._id });
    await post.save();

    // Add post to user's posts array
    user.posts.push(post._id);
    await user.save();

    // console.log(post, user);

    res.status(StatusCodes.CREATED).json({
      postId: post._id,
      title: post.title,
      description: post.description,
      created_at: post.created_at,
    });
  } catch (err) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid token" });
  }
};

const deletePost = async (req, res) => {
  const token = req.headers.authorization;
  const { id } = req.params;
  // Check if token is provided
  if (!token) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "Token is required" });
    return;
  }

  // Verify token
  try {
    const { email } = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user in the database
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
      return;
    }

    // Find the post to delete
    const post = await Post.findById(id);

    // Check if post exists
    if (!post) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "Post not found" });
      return;
    }

    // Check if user is the author of the post
    if (!post.author.equals(user._id)) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: "Not authorized to delete this post" });
      return;
    }

    // Remove post from user's posts array
    user.posts.pull(post._id);
    await user.save();

    // Delete post
    await post.remove();

    res.json({ message: "Successfully deleted the post" });
  } catch (err) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid token" });
  }
};

const getPost = async (req, res) => {
  const { id } = req.params;

  // Find the post
  const post = await Post.findById(id)
    .populate("likes")
    .populate({
      path: "comments",
      populate: {
        path: "author",
        select: "name",
      },
    });

  // Check if post exists
  if (!post) {
    res.status(StatusCodes.NOT_FOUND).json({ message: "Post not found" });
    return;
  }

  res.json({
    id: post._id,
    title: post.title,
    description: post.description,
    created_at: post.created_at,
    likes: post.likes.length,
    comments: post.comments,
  });
};

const getPosts = async (req, res) => {
  const token = req.headers.authorization;

  // Check if token is provided
  if (!token) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "Token is required" });
    return;
  }

  // Verify token
  try {
    const { email } = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user in the database
    const user = await User.findOne({ email }).populate({
      path: "posts",
      options: {
        sort: { created_at: -1 },
      },
      populate: {
        path: "likes comments",
        select: "comments.author comments.comment likes.author",
        populate: {
          path: "author",
          select: "name",
        },
      },
    });

    // Check if user exists
    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
      return;
    }

    // Check if user has any posts
    if (!user.posts.length) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "User has no posts" });
      return;
    }

    const posts = user.posts.map((post) => {
      return {
        id: post._id,
        title: post.title,
        desc: post.description,
        created_at: post.created_at,
        comments: post.comments,
        likes: post.likes.length,
      };
    });

    res.status(StatusCodes.OK).json({ posts });
  } catch (err) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid token" });
  }
};

module.exports = { createPost, deletePost, getPost, getPosts };
