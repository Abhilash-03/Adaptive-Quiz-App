import Notification from "../models/notification.schema.js";
import Quiz from "../models/quizzes.schema.js";
import User from "../models/users.schema.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../middleware/asyncHandler.js";

// @route   GET /api/notifications
// @desc    Get user's notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly } = req.query;

  const filter = { user: req.user._id };
  if (unreadOnly === "true") {
    filter.isRead = false;
  }

  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .populate("relatedQuiz", "title")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: req.user._id, isRead: false }),
  ]);

  ApiResponse.success(res, "Notifications fetched", {
    notifications,
    unreadCount,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalNotifications: total,
    },
  });
});

// @route   PATCH /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    throw ApiError.notFound("Notification not found");
  }

  if (notification.user.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden("Not authorized");
  }

  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();

  ApiResponse.success(res, "Notification marked as read", notification);
});

// @route   PATCH /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  ApiResponse.success(res, "All notifications marked as read");
});

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    throw ApiError.notFound("Notification not found");
  }

  if (notification.user.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden("Not authorized");
  }

  await notification.deleteOne();

  ApiResponse.success(res, "Notification deleted");
});

// @route   DELETE /api/notifications
// @desc    Delete all read notifications
// @access  Private
const deleteReadNotifications = asyncHandler(async (req, res) => {
  const result = await Notification.deleteMany({
    user: req.user._id,
    isRead: true,
  });

  ApiResponse.success(res, `${result.deletedCount} notifications deleted`);
});

// @route   POST /api/notifications/send
// @desc    Send notification (Teacher to students or system)
// @access  Private (Teacher/Admin)
const sendNotification = asyncHandler(async (req, res) => {
  const { title, message, type, userIds, quizId } = req.body;

  if (!title || !message || !type) {
    throw ApiError.badRequest("Title, message, and type are required");
  }

  let recipients = [];

  // If userIds provided, send to specific users
  if (userIds && Array.isArray(userIds) && userIds.length > 0) {
    recipients = userIds;
  } else if (quizId) {
    // If quizId provided, could send to all students (for announcements)
    const students = await User.find({ role: "student" }).select("_id");
    recipients = students.map((s) => s._id);
  } else {
    throw ApiError.badRequest("Provide userIds or quizId");
  }

  // Create notifications for all recipients
  const notifications = recipients.map((userId) => ({
    user: userId,
    title,
    message,
    type,
    relatedQuiz: quizId || null,
  }));

  await Notification.insertMany(notifications);

  ApiResponse.created(res, `Notification sent to ${recipients.length} users`);
});

// Helper function to create quiz reminder notification
const createQuizReminder = async (quizId, hoursBeforeStart = 24) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz || !quiz.startDate) return;

  const students = await User.find({ role: "student" }).select("_id");

  const notifications = students.map((student) => ({
    user: student._id,
    title: "Quiz Reminder",
    message: `Quiz "${quiz.title}" starts in ${hoursBeforeStart} hours!`,
    type: "quiz-reminder",
    relatedQuiz: quizId,
  }));

  await Notification.insertMany(notifications);
};

// Helper function to create result notification
const createResultNotification = async (userId, quizId, score, isPassed) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) return;

  await Notification.create({
    user: userId,
    title: isPassed ? "Quiz Passed!" : "Quiz Completed",
    message: `You scored ${score}% on "${quiz.title}". ${isPassed ? "Congratulations!" : "Keep practicing!"}`,
    type: "result",
    relatedQuiz: quizId,
  });
};

export {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications,
  sendNotification,
  createQuizReminder,
  createResultNotification,
};
