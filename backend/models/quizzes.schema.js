import { model, Schema } from "mongoose";

const quizSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    questions: [
        {
            type: Schema.Types.ObjectId,
            ref: "Question",
        }
    ],
    category: {
        type: String, 
        required: true,
    },
    totalQuestions: {
        type: Number,
        required: true,
    },
    totalMarks: {
        type: Number,
        required:true,
    },
    passingMarks: {
        type: Number,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    isAdaptive: {
        type: Boolean,
        default: true,
    },
    initialDifficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium',
    },
    startDate: Date,
    endDate: Date,
    isPublished: {
        type: Boolean,
        default: false,
    },
    allowedAttempts: {
        type: Number,
        default: 1,
    },
    shuffleQuestions: {
        type: Boolean,
        default: true,
    },
    showResultsImmediately: {
        type: Boolean,
        default: true,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

export default model("Quiz", quizSchema);