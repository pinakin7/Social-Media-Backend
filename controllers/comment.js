const { StatusCodes } = require("http-status-codes");
// const { BadRequestError, UnauthenticatedError } = require("../errors");
const User = require("../models/User");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

const createComment = async (req, res) => {
  const token = req.headers.authorization;
  const { id } = req.params;
  const { comment } = req.body;
  // Check if token is provided
  if (!token) {
    res.status(401).json({ message: "Token is required" });
    return;
  }
  if (!comment) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: "Comment is required" });
    return;
  }
  // Verify token
  try {
    const { email } = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user in the database
    const user = await User.findOne({ email });

    // console.log(user);

    // Check if user exists
    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
      return;
    }

    // Find the post to add comment
    const post = await Post.findById(id);
    // console.log(post);

    // Check if post exists
    if (!post) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "Post not found" });
      return;
    }

    // Create new comment
    const newComment = new Comment({ comment, author: user._id, post:id });
    await newComment.save();
    // console.log(newComment);

    // Add comment to post's comments array
    post.comments.push(newComment._id);
    await post.save();
    // Add comment to user's comments array
    user.comments.push(newComment._id);
    await user.save();

    res.json({ commentId: newComment._id });
  } catch (err) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid token" });
  }
};

module.exports = { createComment };
