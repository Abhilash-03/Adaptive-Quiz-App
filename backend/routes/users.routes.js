import { Router } from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
  getUsers,
  getUserById,
  toggleUserStatus,
} from "../controllers/users.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { validate, validateObjectId } from "../middleware/validate.middleware.js";

const router = Router();

// All routes require authentication
router.use(protect);

// User profile routes
router.get("/profile", getProfile);
router.put("/profile", validate("updateProfile"), updateProfile);
router.put("/password", validate("changePassword"), changePassword);

// Teacher routes - manage students
router.get("/", authorize("teacher"), getUsers);
router.get("/:id", authorize("teacher"), validateObjectId("id"), getUserById);
router.patch("/:id/status", authorize("teacher"), validateObjectId("id"), toggleUserStatus);

export default router;