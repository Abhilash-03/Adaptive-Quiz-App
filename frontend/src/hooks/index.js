// Auth hooks
export { useLogin, useRegister, useLogout } from "./useAuth";

// Quiz hooks
export {
  quizKeys,
  useQuizzes,
  useAvailableQuizzes,
  useQuiz,
  useQuizCategories,
  useCreateQuiz,
  useUpdateQuiz,
  useDeleteQuiz,
  useAddQuestionsToQuiz,
  useRemoveQuestionsFromQuiz,
  useToggleQuizPublish,
} from "./useQuizzes";

// Question hooks
export {
  questionKeys,
  useQuestions,
  useQuestion,
  useQuestionCategories,
  useQuestionTopics,
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
  useBulkDeleteQuestions,
} from "./useQuestions";

// Attempt hooks
export {
  attemptKeys,
  useMyAttempts,
  useAttempt,
  useLeaderboard,
  useStartAttempt,
  useSubmitAnswer,
  useSubmitQuiz,
} from "./useAttempts";

// Analytics hooks
export {
  analyticsKeys,
  useStudentDashboard,
  useStudentProgress,
  useTeacherDashboard,
  useQuizAnalytics,
} from "./useAnalytics";

// Notification hooks
export {
  notificationKeys,
  useNotifications,
  useUnreadNotificationsCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useDeleteReadNotifications,
  useSendNotification,
} from "./useNotifications";

// User hooks
export {
  userKeys,
  useProfile,
  useUpdateProfile,
  useChangePassword,
  useUsers,
  useUser,
  useToggleUserStatus,
} from "./useUsers";

// Badge hooks
export {
  useBadges,
  useMyBadges,
  useUserBadges,
  useRecentBadges,
  useBadgeLeaderboard,
} from "./useBadges";
