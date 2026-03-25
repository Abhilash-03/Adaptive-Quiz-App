import { Router } from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications,
  sendNotification,
} from "../controllers/notifications.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { validate, validateObjectId } from "../middleware/validate.middleware.js";

const router = Router();

// All routes require authentication
router.use(protect);

// User notification routes
router.get("/", getNotifications);
router.patch("/read-all", markAllAsRead);
router.delete("/read", deleteReadNotifications);

router.patch("/:id/read", validateObjectId("id"), markAsRead);
router.delete("/:id", validateObjectId("id"), deleteNotification);

// Teacher/Admin can send notifications
router.post("/send", authorize("teacher"), validate("sendNotification"), sendNotification);

export default router;
