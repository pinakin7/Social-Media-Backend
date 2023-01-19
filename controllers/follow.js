const { StatusCodes } = require("http-status-codes");
// const { BadRequestError, UnauthenticatedError } = require("../errors");
const User = require("../models/User");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const follow = async (req, res) => {
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

    // Check if user is trying to follow itself
    if (user._id.equals(id)) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: "Cannot follow yourself" });
      return;
    }

    // Find the user to follow
    const userToFollow = await User.findById(id);

    // Check if user to follow exists
    if (!userToFollow) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: "User to follow not found" });
      return;
    }

    // Check if user is already following the user to follow
    if (user.followings.includes(id)) {
      res.status(StatusCodes.OK).json({ message: "User is already following this user" });
      return;
    }

    // Add user to follow to the current user's followings array
    user.followings.push(id);
    await user.save();

    // Add current user to the user to follow's followers array
    userToFollow.followers.push(user._id);
    await userToFollow.save();

    res.status(StatusCodes.OK).json({ message: "Successfully followed the user" });
  } catch (err) {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: "Invalid token" });
  }
};

const unfollow = async (req, res) => {
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
      res.status(StatusCodes.UNAUTHORIZED).json({ message: "User not found" });
      return;
    }

    // Find the user to unfollow
    const userToUnfollow = await User.findById(id);

    // Check if user to unfollow exists
    if (!userToUnfollow) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: "User to unfollow not found" });
      return;
    }

    // Check if user is already following the user to unfollow
    if (!user.followings.includes(id)) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: "User is not following this user" });
      return;
    }
    // Remove the user to unfollow from the current user's followings array
    user.followings.pull(id);
    await user.save();

    // Remove the current user from the user to unfollow's followers array
    userToUnfollow.followers.pull(user._id);
    await userToUnfollow.save();

    res.json({ message: "Successfully unfollowed the user" });
  } catch (err) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid token" });
  }
};

module.exports = { follow, unfollow };
