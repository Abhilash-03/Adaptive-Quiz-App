import jwt from "jsonwebtoken";
import User from "../models/users.schema.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "./asyncHandler.js";

// Protect routes - verify JWT token
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in header or cookies
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw ApiError.unauthorized("Not authorized, no token");
  }

  // Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Get user from token
  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    throw ApiError.unauthorized("User not found");
  }

  if (!user.isActive) {
    throw ApiError.forbidden("Your account has been deactivated");
  }

  req.user = user;
  next();
});

// Authorize by role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden(`Role '${req.user.role}' is not authorized to access this route`);
    }
    next();
  };
};

// Optional auth - attach user if token exists but don't require it
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
    } catch (err) {
      // Token invalid, but we don't throw error for optional auth
      req.user = null;
    }
  }

  next();
});

export { protect, authorize, optionalAuth };
