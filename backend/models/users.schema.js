import { model, Schema } from 'mongoose';

const userSchema = new Schema({
  fullname: {
    type: String,
    minlength: [3, "Minimum length of fullname must be 3"],
    maxlength: [25, "Maximum length of fullname must be 25"],
    required: true,
    trim: true,
  },
  email : {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: [6, "Minimum length of password must be 6"],
  },
  role: {
    type: String,
    enum: ["student", "teacher"],
    default: "student",
  },
  avatar: String,
  skillLevel: {
    type: Number,
    default: 50,
    min: 0,
    max: 100,
  },
  isVerified: {
     type: Boolean,
     default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, { timestamps: true });

export default model('User', userSchema);