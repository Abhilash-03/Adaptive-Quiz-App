import { Router } from "express";
import {
  createQuestion,
  getQuestions,
  getQuestion,
  updateQuestion,
  deleteQuestion,
  getCategories,
  getTopics,
} from "../controllers/questions.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(protect);

// All routes require teacher role
router.use(authorize("teacher"));

// Categories and topics
router.get("/categories", getCategories);
router.get("/topics/:category", getTopics);

// CRUD operations
router.route("/")
  .get(getQuestions)
  .post(createQuestion);

router.route("/:id")
  .get(getQuestion)
  .put(updateQuestion)
  .delete(deleteQuestion);

export default router;
