import { Router } from "express";
import {
  startAttempt,
  submitAnswer,
  submitQuiz,
  getAttempt,
  getMyAttempts,
  getLeaderboard,
} from "../controllers/attempts.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(protect);

// Student routes
router.get("/my-attempts", authorize("student"), getMyAttempts);
router.post("/:quizId/start", authorize("student"), startAttempt);
router.post("/:attemptId/answer", authorize("student"), submitAnswer);
router.post("/:attemptId/submit", authorize("student"), submitQuiz);

// Get attempt details (student sees own, teacher sees their quiz attempts)
router.get("/:attemptId", getAttempt);

// Leaderboard (accessible to all authenticated users)
router.get("/quiz/:quizId/leaderboard", getLeaderboard);

export default router;
