import { Router } from "express";
import {
  getStudentDashboard,
  getTeacherDashboard,
  getQuizAnalytics,
  getStudentProgress,
} from "../controllers/analytics.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(protect);

// Student analytics
router.get("/student/dashboard", authorize("student"), getStudentDashboard);
router.get("/student/progress", authorize("student"), getStudentProgress);

// Teacher analytics
router.get("/teacher/dashboard", authorize("teacher"), getTeacherDashboard);
router.get("/quiz/:quizId", authorize("teacher"), getQuizAnalytics);

export default router;
