import Analytics from "../models/analytics.schema.js";
import QuizAttempt from "../models/quizAttempts.schema.js";
import Quiz from "../models/quizzes.schema.js";
import Score from "../models/scores.schema.js";
import User from "../models/users.schema.js";
import Question from "../models/questions.schema.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../middleware/asyncHandler.js";

// @route   GET /api/analytics/student/dashboard
// @desc    Get student dashboard analytics
// @access  Private (Student)
const getStudentDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get or create analytics record
  let analytics = await Analytics.findOne({ user: userId });
  if (!analytics) {
    analytics = await Analytics.create({ user: userId });
  }

  // Get recent attempts
  const recentAttempts = await QuizAttempt.find({ user: userId, status: "completed" })
    .populate("quiz", "title category")
    .sort({ createdAt: -1 })
    .limit(5);

  // Get available quizzes count
  const availableQuizzes = await Quiz.countDocuments({
    isPublished: true,
    $or: [
      { startDate: { $exists: false } },
      { startDate: null },
      { startDate: { $lte: new Date() } },
    ],
  });

  // Calculate stats from attempts
  const allAttempts = await QuizAttempt.find({ user: userId, status: "completed" });
  
  const stats = {
    totalQuizzesTaken: allAttempts.length,
    averageScore: 0,
    totalTimeSpent: 0,
    quizzesPassed: 0,
    currentStreak: analytics.currentStreak,
    longestStreak: analytics.longestStreak,
  };

  if (allAttempts.length > 0) {
    const totalPercentage = allAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0);
    stats.averageScore = Math.round(totalPercentage / allAttempts.length);
    stats.totalTimeSpent = allAttempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0);
    stats.quizzesPassed = allAttempts.filter((a) => a.isPassed).length;
  }

  // Get performance by category
  const categoryStats = await QuizAttempt.aggregate([
    { $match: { user: userId, status: "completed" } },
    {
      $lookup: {
        from: "quizzes",
        localField: "quiz",
        foreignField: "_id",
        as: "quizData",
      },
    },
    { $unwind: "$quizData" },
    {
      $group: {
        _id: "$quizData.category",
        attempts: { $sum: 1 },
        avgScore: { $avg: "$percentage" },
        passed: { $sum: { $cond: ["$isPassed", 1, 0] } },
      },
    },
    { $sort: { attempts: -1 } },
  ]);

  // Get skill progression (last 10 quizzes)
  const skillProgression = allAttempts
    .slice(-10)
    .map((a) => ({
      date: a.createdAt,
      score: a.percentage,
      difficulty: a.averageDifficulty,
    }));

  ApiResponse.success(res, "Dashboard data fetched", {
    user: {
      fullname: req.user.fullname,
      skillLevel: req.user.studentProfile?.skillLevel || 50,
      avatar: req.user.avatar,
    },
    stats,
    recentAttempts,
    availableQuizzes,
    categoryPerformance: categoryStats,
    skillProgression,
  });
});

// @route   GET /api/analytics/teacher/dashboard
// @desc    Get teacher dashboard analytics
// @access  Private (Teacher)
const getTeacherDashboard = asyncHandler(async (req, res) => {
  const teacherId = req.user._id;

  // Get teacher's quizzes
  const quizzes = await Quiz.find({ createdBy: teacherId })
    .sort({ createdAt: -1 });
  const quizIds = quizzes.map((q) => q._id);

  // Quiz stats
  const totalQuizzes = quizzes.length;
  const publishedQuizzes = quizzes.filter((q) => q.isPublished).length;

  // Question stats
  const totalQuestions = await Question.countDocuments({ createdBy: teacherId });

  // Total students count
  const totalStudents = await User.countDocuments({ role: "student" });

  // Attempt stats across all teacher's quizzes
  const attemptStats = await QuizAttempt.aggregate([
    { $match: { quiz: { $in: quizIds }, status: "completed" } },
    {
      $group: {
        _id: null,
        totalAttempts: { $sum: 1 },
        avgScore: { $avg: "$percentage" },
        passCount: { $sum: { $cond: ["$isPassed", 1, 0] } },
      },
    },
  ]);

  const stats = attemptStats[0] || { totalAttempts: 0, avgScore: 0, passCount: 0 };
  const passRate = stats.totalAttempts > 0 
    ? Math.round((stats.passCount / stats.totalAttempts) * 100) 
    : 0;

  // Recent quizzes (last 5)
  const recentQuizzes = quizzes.slice(0, 5);

  // Recent student attempts
  const recentAttempts = await QuizAttempt.find({ quiz: { $in: quizIds }, status: "completed" })
    .populate("user", "fullname email avatar")
    .populate("quiz", "title")
    .sort({ createdAt: -1 })
    .limit(10);

  // Quiz performance breakdown
  const quizPerformance = await QuizAttempt.aggregate([
    { $match: { quiz: { $in: quizIds }, status: "completed" } },
    {
      $group: {
        _id: "$quiz",
        attempts: { $sum: 1 },
        avgScore: { $avg: "$percentage" },
        passRate: { $avg: { $cond: ["$isPassed", 1, 0] } },
      },
    },
    {
      $lookup: {
        from: "quizzes",
        localField: "_id",
        foreignField: "_id",
        as: "quiz",
      },
    },
    { $unwind: "$quiz" },
    {
      $project: {
        quizTitle: "$quiz.title",
        attempts: 1,
        avgScore: { $round: ["$avgScore", 1] },
        passRate: { $round: [{ $multiply: ["$passRate", 100] }, 1] },
      },
    },
    { $sort: { attempts: -1 } },
    { $limit: 10 },
  ]);

  // Difficulty distribution of questions
  const difficultyDistribution = await Question.aggregate([
    { $match: { createdBy: teacherId } },
    { $group: { _id: "$difficultyLevel", count: { $sum: 1 } } },
  ]);

  ApiResponse.success(res, "Teacher dashboard fetched", {
    totalQuizzes,
    publishedQuizzes,
    totalQuestions,
    totalStudents,
    totalAttempts: stats.totalAttempts,
    averageScore: Math.round(stats.avgScore || 0),
    passRate,
    recentQuizzes,
    recentAttempts,
    quizPerformance,
    difficultyDistribution,
  });
});

// @route   GET /api/analytics/quiz/:quizId
// @desc    Get detailed quiz analytics
// @access  Private (Teacher - quiz owner)
const getQuizAnalytics = asyncHandler(async (req, res) => {
  const { quizId } = req.params;

  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    throw ApiError.notFound("Quiz not found");
  }

  if (quiz.createdBy.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden("Not authorized");
  }

  // Get all attempts for this quiz
  const attempts = await QuizAttempt.find({ quiz: quizId, status: "completed" })
    .populate("user", "fullname email");

  // Basic stats
  const totalAttempts = attempts.length;
  const scores = attempts.map((a) => a.percentage);
  const avgScore = scores.length > 0 
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
    : 0;
  const passCount = attempts.filter((a) => a.isPassed).length;
  const passRate = totalAttempts > 0 ? Math.round((passCount / totalAttempts) * 100) : 0;

  // Score distribution
  const scoreDistribution = {
    "0-20": scores.filter((s) => s <= 20).length,
    "21-40": scores.filter((s) => s > 20 && s <= 40).length,
    "41-60": scores.filter((s) => s > 40 && s <= 60).length,
    "61-80": scores.filter((s) => s > 60 && s <= 80).length,
    "81-100": scores.filter((s) => s > 80).length,
  };

  // Grade distribution
  const gradeDistribution = await Score.aggregate([
    { $match: { quiz: quiz._id } },
    { $group: { _id: "$grade", count: { $sum: 1 } } },
  ]);

  // Question performance analysis
  const questionPerformance = await analyzeQuestionPerformance(quizId);

  // Time analysis
  const avgTimeSpent = attempts.length > 0
    ? Math.round(attempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0) / attempts.length)
    : 0;

  // Difficulty progression analysis (for adaptive quizzes)
  const avgDifficultyFaced = attempts.length > 0
    ? Math.round(attempts.reduce((sum, a) => sum + (a.averageDifficulty || 50), 0) / attempts.length)
    : 50;

  // Top performers
  const topPerformers = await Score.find({ quiz: quizId })
    .populate("user", "fullname avatar")
    .sort({ score: -1, timeTaken: 1 })
    .limit(5);

  ApiResponse.success(res, "Quiz analytics fetched", {
    quiz: {
      title: quiz.title,
      category: quiz.category,
      totalQuestions: quiz.totalQuestions,
      passingMarks: quiz.passingMarks,
      isAdaptive: quiz.isAdaptive,
    },
    stats: {
      totalAttempts,
      avgScore,
      passRate,
      avgTimeSpent,
      avgDifficultyFaced,
    },
    scoreDistribution,
    gradeDistribution,
    questionPerformance,
    topPerformers,
  });
});

// Helper function to analyze question performance
const analyzeQuestionPerformance = async (quizId) => {
  const attempts = await QuizAttempt.find({ quiz: quizId, status: "completed" });

  const questionStats = {};

  for (const attempt of attempts) {
    for (const answer of attempt.answers) {
      const qId = answer.question.toString();
      if (!questionStats[qId]) {
        questionStats[qId] = { attempts: 0, correct: 0, totalTime: 0 };
      }
      questionStats[qId].attempts++;
      if (answer.isCorrect) questionStats[qId].correct++;
      questionStats[qId].totalTime += answer.timeTaken || 0;
    }
  }

  // Get question details and calculate stats
  const questionIds = Object.keys(questionStats);
  const questions = await Question.find({ _id: { $in: questionIds } })
    .select("questionText difficultyLevel");

  return questions.map((q) => {
    const stats = questionStats[q._id.toString()];
    return {
      questionId: q._id,
      questionText: q.questionText.substring(0, 50) + "...",
      difficultyLevel: q.difficultyLevel,
      attempts: stats.attempts,
      correctRate: Math.round((stats.correct / stats.attempts) * 100),
      avgTime: Math.round(stats.totalTime / stats.attempts),
    };
  });
};

// @route   GET /api/analytics/student/progress
// @desc    Get detailed student progress
// @access  Private (Student)
const getStudentProgress = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { period = "30" } = req.query; // Days

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(period));

  // Get attempts in period
  const attempts = await QuizAttempt.find({
    user: userId,
    status: "completed",
    createdAt: { $gte: startDate },
  })
    .populate("quiz", "title category")
    .sort({ createdAt: 1 });

  // Calculate daily activity
  const dailyActivity = {};
  attempts.forEach((a) => {
    const date = a.createdAt.toISOString().split("T")[0];
    if (!dailyActivity[date]) {
      dailyActivity[date] = { quizzes: 0, avgScore: 0, scores: [] };
    }
    dailyActivity[date].quizzes++;
    dailyActivity[date].scores.push(a.percentage);
  });

  // Calculate averages
  Object.keys(dailyActivity).forEach((date) => {
    const scores = dailyActivity[date].scores;
    dailyActivity[date].avgScore = Math.round(
      scores.reduce((a, b) => a + b, 0) / scores.length
    );
    delete dailyActivity[date].scores;
  });

  // Skill level history
  const skillHistory = attempts.map((a) => ({
    date: a.createdAt,
    quiz: a.quiz.title,
    score: a.percentage,
    difficulty: a.averageDifficulty,
  }));

  // Strengths and weaknesses by category
  const categoryAnalysis = await QuizAttempt.aggregate([
    { $match: { user: userId, status: "completed" } },
    {
      $lookup: {
        from: "quizzes",
        localField: "quiz",
        foreignField: "_id",
        as: "quizData",
      },
    },
    { $unwind: "$quizData" },
    {
      $group: {
        _id: "$quizData.category",
        attempts: { $sum: 1 },
        avgScore: { $avg: "$percentage" },
        avgDifficulty: { $avg: "$averageDifficulty" },
      },
    },
    { $sort: { avgScore: -1 } },
  ]);

  const strengths = categoryAnalysis.filter((c) => c.avgScore >= 70);
  const weaknesses = categoryAnalysis.filter((c) => c.avgScore < 50);

  ApiResponse.success(res, "Progress data fetched", {
    period: parseInt(period),
    totalQuizzes: attempts.length,
    dailyActivity,
    skillHistory,
    categoryAnalysis,
    strengths,
    weaknesses,
    currentSkillLevel: req.user.studentProfile?.skillLevel || 50,
  });
});

// @route   POST /api/analytics/update-streak
// @desc    Update user streak (called after quiz completion)
// @access  Private
const updateStreak = async (userId) => {
  let analytics = await Analytics.findOne({ user: userId });
  if (!analytics) {
    analytics = await Analytics.create({ user: userId });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActive = analytics.lastActiveDate 
    ? new Date(analytics.lastActiveDate) 
    : null;

  if (lastActive) {
    lastActive.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Same day, no streak change
    } else if (diffDays === 1) {
      // Consecutive day, increase streak
      analytics.currentStreak++;
    } else {
      // Streak broken
      analytics.currentStreak = 1;
    }
  } else {
    analytics.currentStreak = 1;
  }

  // Update longest streak
  if (analytics.currentStreak > analytics.longestStreak) {
    analytics.longestStreak = analytics.currentStreak;
  }

  analytics.lastActiveDate = new Date();
  await analytics.save();

  return analytics.currentStreak;
};

export {
  getStudentDashboard,
  getTeacherDashboard,
  getQuizAnalytics,
  getStudentProgress,
  updateStreak,
};
