import User from "../models/users.schema.js";
import bcrypt from "bcryptjs";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../middleware/asyncHandler.js";

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  ApiResponse.success(res, "Profile fetched", user);
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { fullname, avatar } = req.body;

  const user = await User.findById(req.user._id);

  if (fullname) user.fullname = fullname;
  if (avatar) user.avatar = avatar;

  await user.save();

  const updatedUser = await User.findById(req.user._id).select("-password");
  ApiResponse.success(res, "Profile updated", updatedUser);
});

// @route   PUT /api/users/password
// @desc    Change password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw ApiError.badRequest("Current and new password are required");
  }

  if (newPassword.length < 6) {
    throw ApiError.badRequest("New password must be at least 6 characters");
  }

  const user = await User.findById(req.user._id);

  // Check current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw ApiError.unauthorized("Current password is incorrect");
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  ApiResponse.success(res, "Password changed successfully");
});

// @route   GET /api/users (Admin/Teacher)
// @desc    Get all users (for teachers to see students)
// @access  Private (Teacher)
const getUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 20, search, isActive } = req.query;

  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) {
    filter.isActive = isActive === "true";
  }
  if (search) {
    filter.$or = [
      { fullname: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments(filter),
  ]);

  ApiResponse.success(res, "Users fetched", {
    users,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalUsers: total,
    },
  });
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (Teacher)
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  ApiResponse.success(res, "User fetched", user);
});

// @route   PATCH /api/users/:id/status
// @desc    Activate/Deactivate user
// @access  Private (Teacher)
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  // Prevent teachers from deactivating other teachers
  if (user.role === "teacher" && req.user.role === "teacher") {
    throw ApiError.forbidden("Cannot modify other teacher accounts");
  }

  user.isActive = !user.isActive;
  await user.save();

  const status = user.isActive ? "activated" : "deactivated";
  ApiResponse.success(res, `User ${status}`, { isActive: user.isActive });
});

export {
  getProfile,
  updateProfile,
  changePassword,
  getUsers,
  getUserById,
  toggleUserStatus,
};