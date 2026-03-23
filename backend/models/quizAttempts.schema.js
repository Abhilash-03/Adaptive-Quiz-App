import { model, Schema } from "mongoose";

const answerSchema = new Schema({
    question: {
        type: Schema.Types.ObjectId,
        ref: "Question",
        required: true,
    },
    selectedAnswer: String,
    isCorrect: Boolean,
    timeTaken: Number,
    difficultyAtTime: Number
})

const quizAttemptSchema = new Schema({
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
    answers: [answerSchema],
    score: {
        type: Number,
        default: 0,
    },
    totalMarks: Number,
    percentage: Number,
    isPassed: Boolean,

    startTime: {
        type: Date,
        required: true,
    },
    endTime: Date,
    timeSpent: Number, //total seconds
    difficultyProgression: [{
        type: Number,
    }],
    averageDifficulty: Number,
    performanceScore: Number,
    status: {
        type: String,
        enum: ['in-progress', 'completed', 'abandoned'],
        default: 'in-progress',
    },
    attemptNumber: {
        type: Number,
        default: 1,
    },
}, { timestamps: true });

export default model('QuizAttempt', quizAttemptSchema);