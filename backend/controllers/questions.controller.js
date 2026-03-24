import Question from "../models/questions.schema.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../middleware/asyncHandler.js";

// @route   POST /api/questions
// @desc    Create a new question
// @access  Private (Teacher only)
const createQuestion = asyncHandler(async (req, res) => {
  const {
    questionText,
    questionType,
    options,
    correctAnswer,
    difficultyLevel,
    difficultyScore,
    category,
    topic,
    tags,
    explanation,
    points,
    timeLimit,
  } = req.body;

  // Validate MCQ has options
  if (questionType === "mcq" && (!options || options.length < 2)) {
    throw ApiError.badRequest("MCQ questions must have at least 2 options");
  }

  // Validate correct answer is in options for MCQ
  if (questionType === "mcq" && !options.includes(correctAnswer)) {
    throw ApiError.badRequest("Correct answer must be one of the options");
  }

  // Validate true-false
  if (questionType === "true-false" && !["true", "false"].includes(correctAnswer.toLowerCase())) {
    throw ApiError.badRequest("True/False questions must have 'true' or 'false' as correct answer");
  }

  const question = await Question.create({
    questionText,
    questionType,
    options: questionType === "mcq" ? options : [],
    correctAnswer,
    difficultyLevel,
    difficultyScore: difficultyScore || getDifficultyScore(difficultyLevel),
    category,
    topic,
    tags,
    explanation,
    points,
    timeLimit,
    createdBy: req.user._id,
  });

  ApiResponse.created(res, "Question created successfully", question);
});

// Helper to convert difficulty level to score
const getDifficultyScore = (level) => {
  const scores = { easy: 25, medium: 50, hard: 75 };
  return scores[level] || 50;
};

// @route   GET /api/questions
// @desc    Get all questions (with filters)
// @access  Private (Teacher only)
const getQuestions = asyncHandler(async (req, res) => {
  const {
    category,
    topic,
    difficultyLevel,
    questionType,
    page = 1,
    limit = 10,
    search,
  } = req.query;

  // Build filter
  const filter = { createdBy: req.user._id };

  if (category) filter.category = category;
  if (topic) filter.topic = topic;
  if (difficultyLevel) filter.difficultyLevel = difficultyLevel;
  if (questionType) filter.questionType = questionType;
  if (search) {
    filter.questionText = { $regex: search, $options: "i" };
  }

  // Pagination
  const skip = (page - 1) * limit;

  const [questions, total] = await Promise.all([
    Question.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Question.countDocuments(filter),
  ]);

  ApiResponse.success(res, "Questions fetched successfully", {
    questions,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalQuestions: total,
      hasMore: skip + questions.length < total,
    },
  });
});

// @route   GET /api/questions/:id
// @desc    Get single question
// @access  Private
const getQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id);

  if (!question) {
    throw ApiError.notFound("Question not found");
  }

  // Check ownership (teachers can only see their own questions)
  if (question.createdBy.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden("Not authorized to access this question");
  }

  ApiResponse.success(res, "Question fetched successfully", question);
});

// @route   PUT /api/questions/:id
// @desc    Update question
// @access  Private (Teacher only)
const updateQuestion = asyncHandler(async (req, res) => {
  let question = await Question.findById(req.params.id);

  if (!question) {
    throw ApiError.notFound("Question not found");
  }

  // Check ownership
  if (question.createdBy.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden("Not authorized to update this question");
  }

  // Validate MCQ options if updating
  if (req.body.questionType === "mcq" || question.questionType === "mcq") {
    const options = req.body.options || question.options;
    const correctAnswer = req.body.correctAnswer || question.correctAnswer;
    
    if (options && options.length < 2) {
      throw ApiError.badRequest("MCQ questions must have at least 2 options");
    }
    if (correctAnswer && options && !options.includes(correctAnswer)) {
      throw ApiError.badRequest("Correct answer must be one of the options");
    }
  }

  // Update difficultyScore if difficultyLevel changed
  if (req.body.difficultyLevel && !req.body.difficultyScore) {
    req.body.difficultyScore = getDifficultyScore(req.body.difficultyLevel);
  }

  question = await Question.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  ApiResponse.success(res, "Question updated successfully", question);
});

// @route   DELETE /api/questions/:id
// @desc    Delete question
// @access  Private (Teacher only)
const deleteQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id);

  if (!question) {
    throw ApiError.notFound("Question not found");
  }

  // Check ownership
  if (question.createdBy.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden("Not authorized to delete this question");
  }

  await question.deleteOne();

  ApiResponse.success(res, "Question deleted successfully");
});

// @route   GET /api/questions/categories
// @desc    Get all unique categories
// @access  Private
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Question.distinct("category", { createdBy: req.user._id });
  ApiResponse.success(res, "Categories fetched", categories);
});

// @route   GET /api/questions/topics/:category
// @desc    Get topics for a category
// @access  Private
const getTopics = asyncHandler(async (req, res) => {
  const topics = await Question.distinct("topic", {
    createdBy: req.user._id,
    category: req.params.category,
  });
  ApiResponse.success(res, "Topics fetched", topics);
});

export {
  createQuestion,
  getQuestions,
  getQuestion,
  updateQuestion,
  deleteQuestion,
  getCategories,
  getTopics,
};
