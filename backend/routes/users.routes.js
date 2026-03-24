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

const router = Router();

// All routes require authentication
router.use(protect);

// User profile routes
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/password", changePassword);

// Teacher routes - manage students
router.get("/", authorize("teacher"), getUsers);
router.get("/:id", authorize("teacher"), getUserById);
router.patch("/:id/status", authorize("teacher"), toggleUserStatus);

export default router;