import { model, Schema } from "mongoose";

const questionSchema = new Schema(
  {
    questionText: {
      type: String,
      required: true,
    },
    questionType: {
      type: String,
      enum: ["mcq", "true-false", "short-answer"],
      default: "mcq",
    },
    options: [
      {
        type: String, // for MCQ
      },
    ],
    correctAnswer: {
      type: String,
      required: true,
    },
    // For adaptive AI
    difficultyLevel: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    difficultyScore: {
      type: Number,
      min: 1,
      max: 100,
      default: 50,
    }, // Numeric for AI calculation

    category: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
    },
    tags: [
      {
        type: String,
      },
    ],
    explanation: {
      type: String,
    },
    points: {
      type: Number,
      default: 1,
    },
    timeLimit: {
      type: Number,
      default: 30,
    }, // seconds per questions
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export default model("Question", questionSchema);
