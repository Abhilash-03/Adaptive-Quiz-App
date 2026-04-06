import asyncHandler from "../middleware/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { BADGE_DEFINITIONS } from "../models/badges.schema.js";
import {
  getUserBadges,
  getRecentBadges,
  getBadgeLeaderboard,
} from "../services/badges.service.js";

// @route   GET /api/badges
// @desc    Get all badge definitions
// @access  Public
export const getAllBadgeDefinitions = asyncHandler(async (req, res) => {
  const badges = Object.values(BADGE_DEFINITIONS);
  
  // Group by category
  const grouped = badges.reduce((acc, badge) => {
    if (!acc[badge.category]) {
      acc[badge.category] = [];
    }
    acc[badge.category].push(badge);
    return acc;
  }, {});

  ApiResponse.success(res, "Badge definitions retrieved", {
    badges,
    grouped,
    totalBadges: badges.length,
  });
});

// @route   GET /api/badges/my
// @desc    Get current user's badges
// @access  Private
export const getMyBadges = asyncHandler(async (req, res) => {
  const result = await getUserBadges(req.user._id);
  ApiResponse.success(res, "User badges retrieved", result);
});

// @route   GET /api/badges/user/:userId
// @desc    Get a specific user's badges (public profile)
// @access  Private
export const getUserBadgesById = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const result = await getUserBadges(userId);
  
  // Only return earned badges for public view
  ApiResponse.success(res, "User badges retrieved", {
    earned: result.earned,
    stats: result.stats,
  });
});

// @route   GET /api/badges/recent
// @desc    Get recently earned badges (for notifications)
// @access  Private
export const getMyRecentBadges = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 7;
  const badges = await getRecentBadges(req.user._id, days);
  ApiResponse.success(res, "Recent badges retrieved", badges);
});

// @route   GET /api/badges/leaderboard
// @desc    Get badge leaderboard
// @access  Private
export const getLeaderboard = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const leaderboard = await getBadgeLeaderboard(limit);
  ApiResponse.success(res, "Badge leaderboard retrieved", leaderboard);
});
