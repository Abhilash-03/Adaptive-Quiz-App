import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/users.schema.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../middleware/asyncHandler.js";

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// Set token cookie
const sendTokenResponse = (user, statusCode, res, message) => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  // Remove password from output
  const userResponse = {
    _id: user._id,
    fullname: user.fullname,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    skillLevel: user.skillLevel,
    isVerified: user.isVerified,
  };

  res.status(statusCode).cookie("token", token, cookieOptions).json({
    success: true,
    message,
    data: {
      user: userResponse,
      token,
    },
  });
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { fullname, email, password, role } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw ApiError.conflict("Email already registered");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    fullname,
    email,
    password: hashedPassword,
    role: role || "student",
  });

  sendTokenResponse(user, 201, res, "Registration successful");
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    throw ApiError.badRequest("Please provide email and password");
  }

  // Check for user
  const user = await User.findOne({ email });
  if (!user) {
    throw ApiError.unauthorized("Invalid credentials");
  }

  // Check if account is active
  if (!user.isActive) {
    throw ApiError.forbidden("Your account has been deactivated");
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw ApiError.unauthorized("Invalid credentials");
  }

  sendTokenResponse(user, 200, res, "Login successful");
});

// @route   POST /api/auth/logout
// @desc    Logout user / clear cookie
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000), // 10 seconds
    httpOnly: true,
  });

  ApiResponse.success(res, "Logged out successfully");
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  ApiResponse.success(res, "User fetched successfully", user);
});

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback - handle user creation/login
// @access  Public
const googleCallback = asyncHandler(async (req, res) => {
  // req.user is set by passport
  const { id, displayName, emails, photos } = req.user;

  const email = emails[0].value;
  const avatar = photos[0]?.value;

  // Check if user exists
  let user = await User.findOne({ email });

  if (user) {
    // User exists - update avatar if not set
    if (!user.avatar && avatar) {
      user.avatar = avatar;
      await user.save();
    }
  } else {
    // Create new user
    user = await User.create({
      fullname: displayName,
      email,
      password: await bcrypt.hash(id + process.env.JWT_SECRET, 10), // Random secure password
      avatar,
      isVerified: true, // Google accounts are verified
      role: "student",
    });
  }

  // Generate token and redirect to frontend
  const token = generateToken(user._id);
  
  // Redirect to frontend with token
  const frontendURL = process.env.FRONTEND_URL || "http://localhost:3000";
  res.redirect(`${frontendURL}/auth/callback?token=${token}`);
});

export { register, login, logout, getMe, googleCallback, generateToken };
