import { Schema, model } from "mongoose";

const analyticsSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // Overall stats
    totalQuizzesTaken: { type: Number, default: 0 },
    totalQuestionsAnswered: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },

    // Category-wise performance (for AI)
    categoryPerformance: [
      {
        category: String,
        questionsAttempted: Number,
        correctAnswers: Number,
        averageDifficulty: Number,
        skillLevel: Number, // Category-specific skill
      },
    ],

    // Streak and engagement
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date },

    // Time analytics
    totalTimeSpent: { type: Number, default: 0 }, // seconds
    averageTimePerQuestion: { type: Number },
  },
  { timestamps: true },
);

export default model("Analytics", analyticsSchema);
