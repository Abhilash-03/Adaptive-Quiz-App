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
import { validate, validateObjectId } from "../middleware/validate.middleware.js";

const router = Router();

// All routes require authentication
router.use(protect);

// Student routes
router.get("/my-attempts", authorize("student"), getMyAttempts);
router.post("/:quizId/start", authorize("student"), validateObjectId("quizId"), startAttempt);
router.post("/:attemptId/answer", authorize("student"), validateObjectId("attemptId"), validate("submitAnswer"), submitAnswer);
router.post("/:attemptId/submit", authorize("student"), validateObjectId("attemptId"), submitQuiz);

// Get attempt details (student sees own, teacher sees their quiz attempts)
router.get("/:attemptId", validateObjectId("attemptId"), getAttempt);

// Leaderboard (accessible to all authenticated users)
router.get("/quiz/:quizId/leaderboard", validateObjectId("quizId"), getLeaderboard);

export default router;
