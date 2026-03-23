import { model, Schema } from "mongoose";

const notificationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String, 
        enum: ['quiz-reminder', 'result', 'announcement', 'system'],
        required: true
    },
    relatedQuiz: {
        type: Schema.Types.ObjectId,
        ref: "Quiz",
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: Date,

}, { timestamps: true });

export default model("Notification", notificationSchema);