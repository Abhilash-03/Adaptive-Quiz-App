import Joi from "joi";
import ApiError from "../utils/ApiError.js";

// Common field schemas for reuse
const commonFields = {
  objectId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
    "string.pattern.base": "Invalid ID format",
  }),
  email: Joi.string().email().trim().lowercase().messages({
    "string.email": "Please provide a valid email",
    "string.empty": "Email is required",
  }),
  password: Joi.string().min(6).messages({
    "string.min": "Password must be at least 6 characters",
    "string.empty": "Password is required",
  }),
};

// Validation schemas
const schemas = {
  // Auth schemas
  register: Joi.object({
    fullname: Joi.string().trim().min(3).max(25).required().messages({
      "string.min": "Full name must be at least 3 characters",
      "string.max": "Full name cannot exceed 25 characters",
      "string.empty": "Full name is required",
      "any.required": "Full name is required",
    }),
    email: commonFields.email.required(),
    password: commonFields.password.required(),
    role: Joi.string().valid("student", "teacher").default("student").messages({
      "any.only": "Role must be either 'student' or 'teacher'",
    }),
  }),

  login: Joi.object({
    email: commonFields.email.required(),
    password: Joi.string().required().messages({
      "string.empty": "Password is required",
      "any.required": "Password is required",
    }),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required().messages({
      "string.empty": "Current password is required",
      "any.required": "Current password is required",
    }),
    newPassword: commonFields.password.required().messages({
      "string.min": "New password must be at least 6 characters",
      "string.empty": "New password is required",
      "any.required": "New password is required",
    }),
  }),

  updateProfile: Joi.object({
    fullname: Joi.string().trim().min(3).max(25).messages({
      "string.min": "Full name must be at least 3 characters",
      "string.max": "Full name cannot exceed 25 characters",
    }),
    avatar: Joi.string().uri().allow("", null).messages({
      "string.uri": "Avatar must be a valid URL",
    }),
  }),

  // Question schemas
  createQuestion: Joi.object({
    questionText: Joi.string().trim().min(10).required().messages({
      "string.min": "Question text must be at least 10 characters",
      "string.empty": "Question text is required",
      "any.required": "Question text is required",
    }),
    questionType: Joi.string().valid("mcq", "true-false", "short-answer").required().messages({
      "any.only": "Question type must be 'mcq', 'true-false', or 'short-answer'",
      "any.required": "Question type is required",
    }),
    options: Joi.when("questionType", {
      is: "mcq",
      then: Joi.array().min(2).items(Joi.string().trim()).required().messages({
        "array.min": "MCQ questions require at least 2 options",
        "any.required": "Options are required for MCQ questions",
      }),
      otherwise: Joi.array().items(Joi.string().trim()).optional(),
    }),
    correctAnswer: Joi.string().trim().required().messages({
      "string.empty": "Correct answer is required",
      "any.required": "Correct answer is required",
    }),
    explanation: Joi.string().trim().allow("").max(500).messages({
      "string.max": "Explanation cannot exceed 500 characters",
    }),
    category: Joi.string().trim().required().messages({
      "string.empty": "Category is required",
      "any.required": "Category is required",
    }),
    topic: Joi.string().trim().allow(""),
    difficultyLevel: Joi.string().valid("easy", "medium", "hard").required().messages({
      "any.only": "Difficulty level must be 'easy', 'medium', or 'hard'",
      "any.required": "Difficulty level is required",
    }),
    difficultyScore: Joi.number().min(0).max(100),
    points: Joi.number().min(1).default(1).messages({
      "number.min": "Points must be at least 1",
    }),
    timeLimit: Joi.number().min(0),
    tags: Joi.array().items(Joi.string().trim()).default([]),
  }),

  updateQuestion: Joi.object({
    questionText: Joi.string().trim().min(10).messages({
      "string.min": "Question text must be at least 10 characters",
    }),
    questionType: Joi.string().valid("mcq", "true-false", "short-answer").messages({
      "any.only": "Question type must be 'mcq', 'true-false', or 'short-answer'",
    }),
    options: Joi.array().items(Joi.string().trim()),
    correctAnswer: Joi.string().trim(),
    explanation: Joi.string().trim().allow("").max(500),
    category: Joi.string().trim(),
    topic: Joi.string().trim().allow(""),
    difficultyLevel: Joi.string().valid("easy", "medium", "hard"),
    difficultyScore: Joi.number().min(0).max(100),
    points: Joi.number().min(1),
    timeLimit: Joi.number().min(0),
    tags: Joi.array().items(Joi.string().trim()),
  }),

  // Quiz schemas
  createQuiz: Joi.object({
    title: Joi.string().trim().min(3).max(100).required().messages({
      "string.min": "Quiz title must be at least 3 characters",
      "string.max": "Quiz title cannot exceed 100 characters",
      "string.empty": "Quiz title is required",
      "any.required": "Quiz title is required",
    }),
    description: Joi.string().trim().max(500).allow("").messages({
      "string.max": "Description cannot exceed 500 characters",
    }),
    category: Joi.string().trim().required().messages({
      "string.empty": "Category is required",
      "any.required": "Category is required",
    }),
    duration: Joi.number().min(1).max(180).required().messages({
      "number.min": "Duration must be at least 1 minute",
      "number.max": "Duration cannot exceed 180 minutes",
      "any.required": "Duration is required",
    }),
    totalQuestions: Joi.number().min(1).required().messages({
      "number.min": "Total questions must be at least 1",
      "any.required": "Total questions is required",
    }),
    passingMarks: Joi.number().min(0).required().messages({
      "number.min": "Passing marks cannot be negative",
      "any.required": "Passing marks is required",
    }),
    totalMarks: Joi.number().min(1).required().messages({
      "number.min": "Total marks must be at least 1",
      "any.required": "Total marks is required",
    }),
    isAdaptive: Joi.boolean().default(false),
    initialDifficulty: Joi.string().valid("easy", "medium", "hard").default("medium"),
    maxAttempts: Joi.number().min(1).default(3),
    shuffleQuestions: Joi.boolean().default(true),
    showResults: Joi.boolean().default(true),
    scheduledFor: Joi.date().greater("now").allow(null).messages({
      "date.greater": "Scheduled date must be in the future",
    }),
    expiresAt: Joi.date().greater(Joi.ref("scheduledFor")).allow(null).messages({
      "date.greater": "Expiry date must be after scheduled date",
    }),
  }),

  updateQuiz: Joi.object({
    title: Joi.string().trim().min(3).max(100),
    description: Joi.string().trim().max(500).allow(""),
    category: Joi.string().trim(),
    duration: Joi.number().min(1).max(180),
    totalQuestions: Joi.number().min(1),
    passingMarks: Joi.number().min(0),
    totalMarks: Joi.number().min(1),
    isAdaptive: Joi.boolean(),
    initialDifficulty: Joi.string().valid("easy", "medium", "hard"),
    maxAttempts: Joi.number().min(1),
    shuffleQuestions: Joi.boolean(),
    showResults: Joi.boolean(),
    scheduledFor: Joi.date().allow(null),
    expiresAt: Joi.date().allow(null),
  }),

  addQuestions: Joi.object({
    questionIds: Joi.array().items(commonFields.objectId).min(1).required().messages({
      "array.min": "At least one question ID is required",
      "any.required": "Question IDs are required",
    }),
  }),

  removeQuestions: Joi.object({
    questionIds: Joi.array().items(commonFields.objectId).min(1).required().messages({
      "array.min": "At least one question ID is required",
      "any.required": "Question IDs are required",
    }),
  }),

  // Notification schemas
  sendNotification: Joi.object({
    title: Joi.string().trim().min(3).max(100).required().messages({
      "string.min": "Title must be at least 3 characters",
      "string.max": "Title cannot exceed 100 characters",
      "string.empty": "Title is required",
      "any.required": "Title is required",
    }),
    message: Joi.string().trim().min(5).required().messages({
      "string.min": "Message must be at least 5 characters",
      "string.empty": "Message is required",
      "any.required": "Message is required",
    }),
    type: Joi.string().valid("info", "warning", "success", "error", "quiz-reminder", "result", "announcement").default("info").messages({
      "any.only": "Invalid notification type",
    }),
    recipients: Joi.alternatives().try(
      Joi.string().valid("all", "students", "teachers"),
      Joi.array().items(commonFields.objectId)
    ).default("all"),
    quizId: commonFields.objectId.optional(),
  }),

  // Attempt schemas
  submitAnswer: Joi.object({
    questionId: commonFields.objectId.required().messages({
      "any.required": "Question ID is required",
    }),
    answer: Joi.string().required().allow("").messages({
      "any.required": "Answer is required",
    }),
    timeTaken: Joi.number().min(0).optional(),
  }),
};

// Main validation middleware
export const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    
    if (!schema) {
      console.warn(`No validation schema found for: ${schemaName}`);
      return next();
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors
      stripUnknown: true, // Remove unknown fields
      errors: {
        wrap: {
          label: false, // Don't wrap field names in quotes
        },
      },
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      throw ApiError.badRequest(messages.join(", "));
    }

    // Replace body with sanitized values
    req.body = value;
    next();
  };
};

// Validate params middleware
export const validateParams = (paramRules) => {
  return (req, res, next) => {
    const schema = Joi.object(paramRules);
    
    const { error } = schema.validate(req.params, { abortEarly: false });
    
    if (error) {
      const messages = error.details.map((detail) => detail.message);
      throw ApiError.badRequest(messages.join(", "));
    }
    
    next();
  };
};

// Validate MongoDB ObjectId in params
export const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;

    if (!objectIdRegex.test(id)) {
      throw ApiError.badRequest(`Invalid ${paramName.replace(/Id$/, "")} ID format`);
    }

    next();
  };
};

// Validate query params
export const validateQuery = (querySchema) => {
  return (req, res, next) => {
    const { error, value } = querySchema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      throw ApiError.badRequest(messages.join(", "));
    }

    req.query = value;
    next();
  };
};

// Export schemas for potential reuse
export { schemas };

export default validate;
