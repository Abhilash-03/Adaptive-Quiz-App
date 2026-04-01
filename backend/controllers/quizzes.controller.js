import Quiz from "../models/quizzes.schema.js";
import Question from "../models/questions.schema.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../middleware/asyncHandler.js";

// @route   POST /api/quizzes
// @desc    Create a new quiz
// @access  Private (Teacher only)
const createQuiz = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    questions,
    totalQuestions,
    totalMarks,
    passingMarks,
    duration,
    isAdaptive,
    initialDifficulty,
    startDate,
    endDate,
    allowedAttempts,
    shuffleQuestions,
    showResultsImmediately,
  } = req.body;

  // Validate passing marks
  if (passingMarks > totalMarks) {
    throw ApiError.badRequest("Passing marks cannot exceed total marks");
  }

  // Validate dates
  if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
    throw ApiError.badRequest("End date must be after start date");
  }

  // Validate questions if provided
  if (questions && questions.length > 0) {
    const validQuestions = await Question.find({ _id: { $in: questions } });
    if (validQuestions.length !== questions.length) {
      throw ApiError.badRequest("Some questions are invalid");
    }
  }

  const quiz = await Quiz.create({
    title,
    description,
    category,
    questions: questions || [],
    totalQuestions,
    totalMarks,
    passingMarks,
    duration,
    isAdaptive,
    initialDifficulty,
    startDate,
    endDate,
    allowedAttempts,
    shuffleQuestions,
    showResultsImmediately,
    createdBy: req.user._id,
  });

  // Populate questions for response
  await quiz.populate("questions", "questionText difficultyLevel points");

  ApiResponse.created(res, "Quiz created successfully", quiz);
});

// @route   GET /api/quizzes
// @desc    Get all quizzes (teacher gets own quizzes)
// @access  Private (Teacher)
const getQuizzes = asyncHandler(async (req, res) => {
  const { category, isPublished, page = 1, limit = 10, search } = req.query;

  const filter = { createdBy: req.user._id };

  if (category) filter.category = category;
  if (isPublished !== undefined) filter.isPublished = isPublished === "true";
  if (search) {
    filter.title = { $regex: search, $options: "i" };
  }

  const skip = (page - 1) * limit;

  const [quizzes, total] = await Promise.all([
    Quiz.find(filter)
      .populate("questions", "questionText difficultyLevel")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Quiz.countDocuments(filter),
  ]);

  ApiResponse.success(res, "Quizzes fetched successfully", {
    quizzes,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalQuizzes: total,
      hasMore: skip + quizzes.length < total,
    },
  });
});

// @route   GET /api/quizzes/available
// @desc    Get all available quizzes for students
// @access  Private (Student)
const getAvailableQuizzes = asyncHandler(async (req, res) => {
  const { category, page = 1, limit = 10 } = req.query;
  const now = new Date();

  const filter = {
    isPublished: true,
    $or: [
      { startDate: { $exists: false } },
      { startDate: null },
      { startDate: { $lte: now } },
    ],
    $and: [
      {
        $or: [
          { endDate: { $exists: false } },
          { endDate: null },
          { endDate: { $gte: now } },
        ],
      },
    ],
  };

  if (category) filter.category = category;

  const skip = (page - 1) * limit;

  const [quizzes, total] = await Promise.all([
    Quiz.find(filter)
      .select("-questions") // Don't expose questions list
      .populate("createdBy", "fullname")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Quiz.countDocuments(filter),
  ]);

  ApiResponse.success(res, "Available quizzes fetched", {
    quizzes,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalQuizzes: total,
      hasMore: skip + quizzes.length < total,
    },
  });
});

// @route   GET /api/quizzes/:id
// @desc    Get single quiz
// @access  Private
const getQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id)
    .populate("questions")
    .populate("createdBy", "fullname email");

  if (!quiz) {
    throw ApiError.notFound("Quiz not found");
  }

  // Teachers can only see their own quizzes, students can see published ones
  if (req.user.role === "teacher") {
    if (quiz.createdBy._id.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden("Not authorized to access this quiz");
    }
  } else {
    // Students can only see published quizzes
    if (!quiz.isPublished) {
      throw ApiError.forbidden("This quiz is not available");
    }
  }

  ApiResponse.success(res, "Quiz fetched successfully", quiz);
});

// @route   PUT /api/quizzes/:id
// @desc    Update quiz
// @access  Private (Teacher only)
const updateQuiz = asyncHandler(async (req, res) => {
  let quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    throw ApiError.notFound("Quiz not found");
  }

  if (quiz.createdBy.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden("Not authorized to update this quiz");
  }

  // Validate passing marks if updating
  const totalMarks = req.body.totalMarks || quiz.totalMarks;
  const passingMarks = req.body.passingMarks || quiz.passingMarks;
  if (passingMarks > totalMarks) {
    throw ApiError.badRequest("Passing marks cannot exceed total marks");
  }

  // Validate questions if provided
  if (req.body.questions && req.body.questions.length > 0) {
    const validQuestions = await Question.find({ _id: { $in: req.body.questions } });
    if (validQuestions.length !== req.body.questions.length) {
      throw ApiError.badRequest("Some questions are invalid");
    }
  }

  quiz = await Quiz.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate("questions", "questionText difficultyLevel points");

  ApiResponse.success(res, "Quiz updated successfully", quiz);
});

// @route   DELETE /api/quizzes/:id
// @desc    Delete quiz
// @access  Private (Teacher only)
const deleteQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    throw ApiError.notFound("Quiz not found");
  }

  if (quiz.createdBy.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden("Not authorized to delete this quiz");
  }

  await quiz.deleteOne();

  ApiResponse.success(res, "Quiz deleted successfully");
});

// @route   POST /api/quizzes/:id/questions
// @desc    Add questions to quiz
// @access  Private (Teacher only)
const addQuestions = asyncHandler(async (req, res) => {
  const { questionIds } = req.body;

  if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
    throw ApiError.badRequest("Please provide question IDs");
  }

  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    throw ApiError.notFound("Quiz not found");
  }

  if (quiz.createdBy.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden("Not authorized to modify this quiz");
  }

  // Verify all questions exist and belong to the teacher
  const questions = await Question.find({
    _id: { $in: questionIds },
    createdBy: req.user._id,
  });

  if (questions.length !== questionIds.length) {
    throw ApiError.badRequest("Some questions not found or not authorized");
  }

  // Add questions (avoid duplicates)
  const existingIds = quiz.questions.map((q) => q.toString());
  const newQuestions = questionIds.filter((id) => !existingIds.includes(id));

  quiz.questions.push(...newQuestions);
  await quiz.save();

  const updatedQuiz = await Quiz.findById(req.params.id).populate("questions");

  ApiResponse.success(res, `${newQuestions.length} questions added`, updatedQuiz);
});

// @route   DELETE /api/quizzes/:id/questions
// @desc    Remove questions from quiz
// @access  Private (Teacher only)
const removeQuestions = asyncHandler(async (req, res) => {
  const { questionIds } = req.body;

  if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
    throw ApiError.badRequest("Please provide question IDs");
  }

  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    throw ApiError.notFound("Quiz not found");
  }

  if (quiz.createdBy.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden("Not authorized to modify this quiz");
  }

  quiz.questions = quiz.questions.filter(
    (q) => !questionIds.includes(q.toString())
  );
  await quiz.save();

  const updatedQuiz = await Quiz.findById(req.params.id).populate("questions");

  ApiResponse.success(res, "Questions removed", updatedQuiz);
});

// @route   PATCH /api/quizzes/:id/publish
// @desc    Publish or unpublish quiz
// @access  Private (Teacher only)
const togglePublish = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    throw ApiError.notFound("Quiz not found");
  }

  if (quiz.createdBy.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden("Not authorized to modify this quiz");
  }

  // Validate before publishing
  if (!quiz.isPublished) {
    if (quiz.questions.length === 0) {
      throw ApiError.badRequest("Cannot publish quiz without questions");
    }
    if (quiz.questions.length < quiz.totalQuestions) {
      throw ApiError.badRequest(
        `Quiz needs at least ${quiz.totalQuestions} questions. Currently has ${quiz.questions.length}`
      );
    }
  }

  quiz.isPublished = !quiz.isPublished;
  await quiz.save();

  const status = quiz.isPublished ? "published" : "unpublished";
  ApiResponse.success(res, `Quiz ${status} successfully`, quiz);
});

// @route   GET /api/quizzes/categories
// @desc    Get all unique quiz categories
// @access  Private
const getCategories = asyncHandler(async (req, res) => {
  let filter = {};
  
  if (req.user.role === "teacher") {
    filter.createdBy = req.user._id;
  } else {
    filter.isPublished = true;
  }

  const categories = await Quiz.distinct("category", filter);
  ApiResponse.success(res, "Categories fetched", categories);
});

export {
  createQuiz,
  getQuizzes,
  getAvailableQuizzes,
  getQuiz,
  updateQuiz,
  deleteQuiz,
  addQuestions,
  removeQuestions,
  togglePublish,
  getCategories,
};
