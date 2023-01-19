const { StatusCodes } = require("http-status-codes");
// const { BadRequestError, UnauthenticatedError } = require("../errors");
const User = require("../models/User");
const validator = require("validator");
const jwt = require("jsonwebtoken");

function passwordIsValid(password) {
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9])(?=.*[a-z]).{8,}$/;
  return passwordRegex.test(password);
}

function emailIsValid(email) {
  if (!validator.isEmail(email)) {
    res.status(400).json({ message: "Invalid email address" });
    return false;
  }
  return true;
}

const register = async (req, res) => {
  const { email, password, name } = req.body;

  // Check if email and password are provided
  if (!email || !password || !name) {
    res.status(400).json({ message: "Email, password and name are required" });
    return;
  }

  // Check if email is valid
  if (!validator.isEmail(email)) {
    res.status(400).json({ message: "Invalid email address" });
    return;
  }

  // Check if password is valid
  if (!passwordIsValid(password)) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message:
        "Invalid password, password must have at least 8 characters, one special character, one integer, one uppercase letter, and one lowercase letter.",
    });
    return;
  }

  // Check if user already exists
  if (await User.findOne({ email })) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "User already exists" });
    return;
  }
  // Create new user
  const user = new User({ email, password, name });
  await user.save();

  res
    .status(StatusCodes.CREATED)
    .json({ message: "User created successfully" });
};

const authenticate = async (req, res) => {
  // console.log(req.body);
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Email and Password are required" });
    return;
  }

  // Check if email is valid
  if (!validator.isEmail(email)) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid email address" });
    return;
  }

  // Check if password is valid
  if (!passwordIsValid(password)) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error:
        "Invalid password, password must have at least 8 characters, one special character, one integer, one uppercase letter, and one lowercase letter.",
    });
    return;
  }

  // Find the user in the database
  let user = await User.findOne({ email });

  // If user does not exist, create a new user
  if (!user) {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: "Invalid Credentials" });
    return;
  }

  // Check if password is correct
  if (!(await user.isValidPassword(password))) {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ error: "Incorrect Password" });
    return;
  }

  // Create JWT token
  const token = jwt.sign({ email }, process.env.JWT_SECRET);
  res.status(StatusCodes.OK).json({ token });
};

const login = async (req, res) => {
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
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
      return;
    }
    // you can use populate method to get the followers and following count.
    // Populate followers and following fields
    const populatedUser = await User.findOne({ email })
      .populate({ path: "followers", select: "_id" })
      .populate({ path: "followings", select: "_id" });

    // Return user profile
    res.json({
      name: user.name,
      followers: populatedUser.followers.length,
      followings: populatedUser.followings.length,
    });
  } catch (err) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid token" });
  }
};

module.exports = { authenticate, login, register };
