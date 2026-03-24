import { Router } from "express";
import {
  createQuiz,
  getQuizzes,
  getAvailableQuizzes,
  getQuiz,
  updateQuiz,
  deleteQuiz,
  addQuestions,
  removeQuestions,
  togglePublish,
  getCategories,
} from "../controllers/quizzes.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(protect);

// Get categories (available to both teachers and students)
router.get("/categories", getCategories);

// Student route - get available quizzes
router.get("/available", authorize("student"), getAvailableQuizzes);

// Teacher routes
router.route("/")
  .get(authorize("teacher"), getQuizzes)
  .post(authorize("teacher"), createQuiz);

router.route("/:id")
  .get(getQuiz) // Both teacher and student can access (with different permissions)
  .put(authorize("teacher"), updateQuiz)
  .delete(authorize("teacher"), deleteQuiz);

// Question management for quiz
router.route("/:id/questions")
  .post(authorize("teacher"), addQuestions)
  .delete(authorize("teacher"), removeQuestions);

// Publish/unpublish quiz
router.patch("/:id/publish", authorize("teacher"), togglePublish);

export default router;
