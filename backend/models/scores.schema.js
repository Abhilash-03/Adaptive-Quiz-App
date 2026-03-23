import { model, Schema } from "mongoose";

const scoreSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    quiz: {
        type: Schema.Types.ObjectId,
        ref: "Quiz",
        required: true,
    },
    attempt: {
        type: Schema.Types.ObjectId,
        ref: "QuizAttempt",
        required: true,
    },

    score: {
        type: Number,
        required: true,
    },
    totalMarks: {
        type: Number,
        required: true,
    },
    percentage: {
        type: Number,
        required: true,
    },
    correctAnswers: {
        type: Number,
        required: true,
    },
    wrongAnswers: {
        type: Number,
        required: true,
    },
    unanswered: {
        type: Number,
        default: 0
    },

    isPassed: {
        type: Boolean,
        required: true,
    },
    grade: String,
    rank: Number,
    timeTaken: Number,
    averageDifficultyFaced: Number,
    adaptiveBonus: {
        type: Number,
        default: 0
    }

}, { timestamps: true });

scoreSchema.index({ quiz: 1, score: -1 });
scoreSchema.index({ user: 1, createdAt: -1 });

export default model("Score", scoreSchema);