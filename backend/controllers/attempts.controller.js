import QuizAttempt from "../models/quizAttempts.schema.js";
import Quiz from "../models/quizzes.schema.js";
import Question from "../models/questions.schema.js";
import Score from "../models/scores.schema.js";
import User from "../models/users.schema.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../middleware/asyncHandler.js";
import {
  calculateNextDifficulty,
  calculatePerformanceScore as calcPerfScore,
  selectQuestion,
  updateUserSkill,
  getDifficultyScore,
  calculateInitialDifficulty,
  analyzePerformance,
  generateRecommendations,
} from "../services/adaptiveDifficulty.service.js";
import { createResultNotification } from "./notifications.controller.js";
import { updateStreak } from "./analytics.controller.js";

// @route   POST /api/attempts/:quizId/start
// @desc    Start a quiz attempt
// @access  Private (Student only)
const startAttempt = asyncHandler(async (req, res) => {
  const { quizId } = req.params;

  const quiz = await Quiz.findById(quizId).populate("questions");

  if (!quiz) {
    throw ApiError.notFound("Quiz not found");
  }

  if (!quiz.isPublished) {
    throw ApiError.forbidden("This quiz is not available");
  }

  // Check if quiz is within date range
  const now = new Date();
  if (quiz.startDate && now < quiz.startDate) {
    throw ApiError.forbidden("Quiz has not started yet");
  }
  if (quiz.endDate && now > quiz.endDate) {
    throw ApiError.forbidden("Quiz has ended");
  }

  // Check allowed attempts
  const previousAttempts = await QuizAttempt.countDocuments({
    user: req.user._id,
    quiz: quizId,
    status: { $in: ["completed", "abandoned"] },
  });

  if (previousAttempts >= quiz.allowedAttempts) {
    throw ApiError.forbidden(`Maximum ${quiz.allowedAttempts} attempts allowed`);
  }

  // Check for in-progress attempt
  const inProgressAttempt = await QuizAttempt.findOne({
    user: req.user._id,
    quiz: quizId,
    status: "in-progress",
  });

  if (inProgressAttempt) {
    // Return existing attempt
    const remainingTime = Math.max(
      0,
      quiz.duration * 60 - Math.floor((now - inProgressAttempt.startTime) / 1000)
    );

    return ApiResponse.success(res, "Resuming existing attempt", {
      attempt: inProgressAttempt,
      remainingTime,
      quiz: {
        title: quiz.title,
        duration: quiz.duration,
        totalQuestions: quiz.totalQuestions,
        isAdaptive: quiz.isAdaptive,
      },
    });
  }

  // Prepare questions
  let selectedQuestions = [...quiz.questions];

  // Shuffle if enabled
  if (quiz.shuffleQuestions) {
    selectedQuestions = shuffleArray(selectedQuestions);
  }

  // Limit to totalQuestions
  selectedQuestions = selectedQuestions.slice(0, quiz.totalQuestions);

  // Create new attempt
  // Calculate initial difficulty based on user skill and quiz setting
  const user = await User.findById(req.user._id);
  const initialDifficulty = calculateInitialDifficulty(
    user.studentProfile?.skillLevel || 50,
    quiz.initialDifficulty
  );

  const attempt = await QuizAttempt.create({
    user: req.user._id,
    quiz: quizId,
    startTime: now,
    attemptNumber: previousAttempts + 1,
    totalMarks: quiz.totalMarks,
    answers: [],
    difficultyProgression: [initialDifficulty],
  });

  // Get first question (for adaptive) or all questions
  let response;
  if (quiz.isAdaptive) {
    // For adaptive quiz, use AI to select best first question
    const firstQuestion = selectQuestion(
      selectedQuestions,
      initialDifficulty,
      []
    );
    response = {
      attempt: attempt._id,
      currentQuestion: sanitizeQuestion(firstQuestion),
      questionNumber: 1,
      totalQuestions: quiz.totalQuestions,
      remainingTime: quiz.duration * 60,
      isAdaptive: true,
    };
  } else {
    // For non-adaptive, send all questions at once
    response = {
      attempt: attempt._id,
      questions: selectedQuestions.map(sanitizeQuestion),
      totalQuestions: quiz.totalQuestions,
      remainingTime: quiz.duration * 60,
      isAdaptive: false,
    };
  }

  // Store selected questions in attempt for reference
  attempt.answers = selectedQuestions.map((q) => ({
    question: q._id,
    selectedAnswer: null,
    isCorrect: null,
    timeTaken: 0,
    difficultyAtTime: q.difficultyScore,
  }));
  await attempt.save();

  ApiResponse.created(res, "Quiz started", {
    ...response,
    quiz: {
      title: quiz.title,
      duration: quiz.duration,
    },
  });
});

// @route   POST /api/attempts/:attemptId/answer
// @desc    Submit answer and get next question (for adaptive)
// @access  Private (Student only)
const submitAnswer = asyncHandler(async (req, res) => {
  const { attemptId } = req.params;
  const { questionId, answer, timeTaken } = req.body;

  const attempt = await QuizAttempt.findById(attemptId).populate({
    path: "quiz",
    populate: { path: "questions" },
  });

  if (!attempt) {
    throw ApiError.notFound("Attempt not found");
  }

  if (attempt.user.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden("Not authorized");
  }

  if (attempt.status !== "in-progress") {
    throw ApiError.badRequest("This attempt has already been completed");
  }

  // Check time limit
  const now = new Date();
  const elapsedSeconds = Math.floor((now - attempt.startTime) / 1000);
  if (elapsedSeconds > attempt.quiz.duration * 60) {
    // Auto-submit if time exceeded
    return await finishAttempt(attempt, res, "Time exceeded - quiz auto-submitted");
  }

  // Find the question
  const question = await Question.findById(questionId);
  if (!question) {
    throw ApiError.notFound("Question not found");
  }

  // Check if answer is correct
  const isCorrect = question.correctAnswer.toLowerCase() === answer?.toLowerCase();

  // Update the answer in attempt
  const answerIndex = attempt.answers.findIndex(
    (a) => a.question.toString() === questionId
  );

  if (answerIndex === -1) {
    throw ApiError.badRequest("Question not part of this attempt");
  }

  attempt.answers[answerIndex].selectedAnswer = answer;
  attempt.answers[answerIndex].isCorrect = isCorrect;
  attempt.answers[answerIndex].timeTaken = timeTaken || 0;

  // Count answered questions
  const answeredCount = attempt.answers.filter(
    (a) => a.selectedAnswer !== null
  ).length;

  // For adaptive quizzes, calculate next difficulty and get next question
  if (attempt.quiz.isAdaptive && answeredCount < attempt.quiz.totalQuestions) {
    // Get answered questions for AI analysis
    const answeredQuestions = attempt.answers
      .filter((a) => a.selectedAnswer !== null)
      .map((a) => ({
        isCorrect: a.isCorrect,
        timeTaken: a.timeTaken,
        difficultyAtTime: a.difficultyAtTime,
        timeLimit: 30, // default
      }));

    const currentDifficulty = attempt.difficultyProgression[attempt.difficultyProgression.length - 1];
    
    // Get user's skill level for better AI decisions
    const user = await User.findById(req.user._id);
    
    // Use AI service to calculate next difficulty
    const newDifficulty = calculateNextDifficulty(
      currentDifficulty,
      answeredQuestions,
      user.studentProfile?.skillLevel || 50
    );

    attempt.difficultyProgression.push(newDifficulty);

    // Get next question
    const answeredIds = attempt.answers
      .filter((a) => a.selectedAnswer !== null)
      .map((a) => a.question.toString());

    const unansweredQuestions = attempt.quiz.questions.filter(
      (q) => !answeredIds.includes(q._id.toString())
    );

    // Use AI service to select next question
    const nextQuestion = selectQuestion(
      unansweredQuestions,
      newDifficulty,
      answeredIds
    );

    await attempt.save();

    return ApiResponse.success(res, isCorrect ? "Correct!" : "Incorrect", {
      isCorrect,
      correctAnswer: attempt.quiz.showResultsImmediately ? question.correctAnswer : null,
      explanation: attempt.quiz.showResultsImmediately ? question.explanation : null,
      nextQuestion: sanitizeQuestion(nextQuestion),
      questionNumber: answeredCount + 1,
      totalQuestions: attempt.quiz.totalQuestions,
      currentDifficulty: newDifficulty,
    });
  }

  await attempt.save();

  // Check if all questions answered
  if (answeredCount >= attempt.quiz.totalQuestions) {
    return await finishAttempt(attempt, res, "Quiz completed");
  }

  ApiResponse.success(res, isCorrect ? "Correct!" : "Incorrect", {
    isCorrect,
    correctAnswer: attempt.quiz.showResultsImmediately ? question.correctAnswer : null,
    explanation: attempt.quiz.showResultsImmediately ? question.explanation : null,
    answeredCount,
    totalQuestions: attempt.quiz.totalQuestions,
  });
});

// @route   POST /api/attempts/:attemptId/submit
// @desc    Submit entire quiz (for non-adaptive)
// @access  Private (Student only)
const submitQuiz = asyncHandler(async (req, res) => {
  const { attemptId } = req.params;
  const { answers } = req.body; // Array of { questionId, answer, timeTaken }

  const attempt = await QuizAttempt.findById(attemptId).populate("quiz");

  if (!attempt) {
    throw ApiError.notFound("Attempt not found");
  }

  if (attempt.user.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden("Not authorized");
  }

  if (attempt.status !== "in-progress") {
    throw ApiError.badRequest("This attempt has already been completed");
  }

  // Process all answers
  if (answers && Array.isArray(answers)) {
    for (const ans of answers) {
      const question = await Question.findById(ans.questionId);
      if (question) {
        const isCorrect = question.correctAnswer.toLowerCase() === ans.answer?.toLowerCase();
        const answerIndex = attempt.answers.findIndex(
          (a) => a.question.toString() === ans.questionId
        );
        if (answerIndex !== -1) {
          attempt.answers[answerIndex].selectedAnswer = ans.answer;
          attempt.answers[answerIndex].isCorrect = isCorrect;
          attempt.answers[answerIndex].timeTaken = ans.timeTaken || 0;
        }
      }
    }
  }

  await attempt.save();
  return await finishAttempt(attempt, res, "Quiz submitted successfully");
});

// Helper function to finish attempt and calculate score
const finishAttempt = async (attempt, res, message) => {
  const now = new Date();

  // Calculate score
  const correctAnswers = attempt.answers.filter((a) => a.isCorrect === true).length;
  const wrongAnswers = attempt.answers.filter((a) => a.isCorrect === false).length;
  const unanswered = attempt.answers.filter((a) => a.selectedAnswer === null).length;

  // Calculate score based on correct answers (assuming equal marks per question)
  const marksPerQuestion = attempt.totalMarks / attempt.answers.length;
  const score = correctAnswers * marksPerQuestion;
  const percentage = (score / attempt.totalMarks) * 100;

  // Get quiz for passing marks
  const quiz = await Quiz.findById(attempt.quiz._id || attempt.quiz);
  const isPassed = score >= quiz.passingMarks;

  // Calculate average difficulty
  const avgDifficulty = attempt.difficultyProgression.length > 0
    ? attempt.difficultyProgression.reduce((a, b) => a + b, 0) / attempt.difficultyProgression.length
    : 50;

  // Update attempt
  attempt.endTime = now;
  attempt.timeSpent = Math.floor((now - attempt.startTime) / 1000);
  attempt.score = score;
  attempt.percentage = percentage;
  attempt.isPassed = isPassed;
  attempt.averageDifficulty = avgDifficulty;
  attempt.status = "completed";

  // Use AI service to calculate comprehensive performance score
  const answersForAnalysis = attempt.answers.map((a) => ({
    isCorrect: a.isCorrect,
    timeTaken: a.timeTaken,
    difficultyAtTime: a.difficultyAtTime,
    timeLimit: 30,
  }));
  const performanceScore = calcPerfScore(answersForAnalysis);
  attempt.performanceScore = performanceScore;

  await attempt.save();

  // Create score record
  const scoreRecord = await Score.create({
    user: attempt.user,
    quiz: attempt.quiz._id || attempt.quiz,
    attempt: attempt._id,
    score,
    totalMarks: attempt.totalMarks,
    percentage,
    correctAnswers,
    wrongAnswers,
    unanswered,
    isPassed,
    grade: calculateGrade(percentage),
    timeTaken: attempt.timeSpent,
    averageDifficultyFaced: avgDifficulty,
  });

  // Use AI service to update user's skill level
  const user = await User.findById(attempt.user);
  const newSkillLevel = updateUserSkill(user.studentProfile?.skillLevel || 50, {
    correctAnswers,
    totalQuestions: attempt.answers.length,
    avgDifficulty,
    timePerformance: attempt.timeSpent < quiz.duration * 60 * 0.7 ? 0.8 : 0.5,
  });
  
  // Update student profile
  if (!user.studentProfile) user.studentProfile = {};
  user.studentProfile.skillLevel = newSkillLevel;
  user.studentProfile.totalQuizzesTaken = (user.studentProfile.totalQuizzesTaken || 0) + 1;
  await user.save();

  // Use AI service to analyze performance and generate recommendations
  const performanceAnalysis = analyzePerformance(answersForAnalysis);
  const recommendations = generateRecommendations(performanceAnalysis, newSkillLevel);

  // Send result notification
  await createResultNotification(
    attempt.user,
    attempt.quiz._id || attempt.quiz,
    Math.round(percentage),
    isPassed
  );

  // Update user streak
  await updateStreak(attempt.user);

  ApiResponse.success(res, message, {
    score,
    totalMarks: attempt.totalMarks,
    percentage: percentage.toFixed(2),
    correctAnswers,
    wrongAnswers,
    unanswered,
    isPassed,
    grade: scoreRecord.grade,
    timeSpent: attempt.timeSpent,
    averageDifficulty: avgDifficulty.toFixed(2),
    skillLevel: newSkillLevel,
    analysis: performanceAnalysis,
    recommendations,
  });
};

// @route   GET /api/attempts/:attemptId
// @desc    Get attempt details
// @access  Private
const getAttempt = asyncHandler(async (req, res) => {
  const attempt = await QuizAttempt.findById(req.params.attemptId)
    .populate("quiz", "title category showResultsImmediately")
    .populate("answers.question", "questionText options correctAnswer explanation");

  if (!attempt) {
    throw ApiError.notFound("Attempt not found");
  }

  // Only allow user to see their own attempt, or teacher to see their quiz attempts
  if (attempt.user.toString() !== req.user._id.toString()) {
    const quiz = await Quiz.findById(attempt.quiz._id);
    if (req.user.role !== "teacher" || quiz.createdBy.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden("Not authorized");
    }
  }

  // Hide correct answers if results not shown immediately and quiz in progress
  if (attempt.status === "in-progress" || !attempt.quiz.showResultsImmediately) {
    attempt.answers = attempt.answers.map((a) => ({
      ...a.toObject(),
      question: {
        ...a.question.toObject(),
        correctAnswer: undefined,
        explanation: undefined,
      },
    }));
  }

  ApiResponse.success(res, "Attempt fetched", attempt);
});

// @route   GET /api/attempts/my-attempts
// @desc    Get user's attempt history
// @access  Private (Student)
const getMyAttempts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const filter = { user: req.user._id };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const [attempts, total] = await Promise.all([
    QuizAttempt.find(filter)
      .populate("quiz", "title category totalQuestions")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    QuizAttempt.countDocuments(filter),
  ]);

  ApiResponse.success(res, "Attempts fetched", {
    attempts,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalAttempts: total,
    },
  });
});

// @route   GET /api/attempts/quiz/:quizId/leaderboard
// @desc    Get quiz leaderboard
// @access  Private
const getLeaderboard = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const { limit = 10 } = req.query;

  const leaderboard = await Score.find({ quiz: quizId })
    .populate("user", "fullname avatar")
    .sort({ score: -1, timeTaken: 1 })
    .limit(parseInt(limit));

  // Add rank
  const rankedLeaderboard = leaderboard.map((entry, index) => ({
    rank: index + 1,
    user: entry.user,
    score: entry.score,
    percentage: entry.percentage,
    timeTaken: entry.timeTaken,
    grade: entry.grade,
  }));

  ApiResponse.success(res, "Leaderboard fetched", rankedLeaderboard);
});

// Helper functions
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const sanitizeQuestion = (question) => {
  if (!question) return null;
  return {
    _id: question._id,
    questionText: question.questionText,
    questionType: question.questionType,
    options: question.options,
    points: question.points,
    timeLimit: question.timeLimit,
    // Don't expose: correctAnswer, explanation, difficultyScore
  };
};

const calculateGrade = (percentage) => {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  return "F";
};

export {
  startAttempt,
  submitAnswer,
  submitQuiz,
  getAttempt,
  getMyAttempts,
  getLeaderboard,
};
