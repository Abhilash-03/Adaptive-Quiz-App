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
