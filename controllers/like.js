const { StatusCodes } = require("http-status-codes");
// const { BadRequestError, UnauthenticatedError } = require("../errors");
const User = require("../models/User");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

const likePost = async (req, res) => {
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

    // Find the post to like
    const post = await Post.findById(id);

    // Check if post exists
    if (!post) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "Post not found" });
      return;
    }

    // Check if user has already liked the post
    if (post.likes.indexOf(user._id) !== -1) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: "User has already liked the post" });
      return;
    }

    // Add user id to post's likes array
    post.likes.push(user._id);
    await post.save();

    // Add post id to user's likes array
    user.likes.push(post._id);
    await user.save();

    res.status(StatusCodes.CREATED).json({ message: "Post liked" });
  } catch (err) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid token" });
  }
};

const unlikePost = async (req, res) => {
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

    // Find the post to unlike
    const post = await Post.findById(id);

    // Check if post exists
    if (!post) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "Post not found" });
      return;
    }

    // Check if user has already liked the post
    if (post.likes.indexOf(user._id) === -1) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: "User has not liked the post" });
      return;
    }

    // Remove user id from post's likes array
    post.likes.remove(user._id);
    await post.save();
    // Remove post id from user's likes array
    user.likes.remove(post._id);
    await user.save();

    res.status(StatusCodes.CREATED).json({ message: "Post unliked" });
  } catch (err) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid token" });
  }
};
module.exports = { likePost, unlikePost };
