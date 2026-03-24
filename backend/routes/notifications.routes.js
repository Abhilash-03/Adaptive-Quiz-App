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

const router = Router();

// All routes require authentication
router.use(protect);

// User notification routes
router.get("/", getNotifications);
router.patch("/read-all", markAllAsRead);
router.delete("/read", deleteReadNotifications);

router.patch("/:id/read", markAsRead);
router.delete("/:id", deleteNotification);

// Teacher/Admin can send notifications
router.post("/send", authorize("teacher"), sendNotification);

export default router;
