import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  getAllBadgeDefinitions,
  getMyBadges,
  getUserBadgesById,
  getMyRecentBadges,
  getLeaderboard,
} from "../controllers/badges.controller.js";

const router = Router();

// Public route - get all badge definitions
router.get("/", getAllBadgeDefinitions);

// Protected routes
router.use(protect);

router.get("/my", getMyBadges);
router.get("/recent", getMyRecentBadges);
router.get("/leaderboard", getLeaderboard);
router.get("/user/:userId", getUserBadgesById);

export default router;
