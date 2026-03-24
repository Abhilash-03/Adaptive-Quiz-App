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
  // Student-specific profile (only for students - removed for teachers via pre-save)
  studentProfile: {
    skillLevel: {
      type: Number,
      min: 0,
      max: 100,
    },
    totalQuizzesTaken: {
      type: Number,
    },
    averageScore: {
      type: Number,
    },
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

// Pre-save hook to handle role-specific fields
userSchema.pre('save', async function() {
  if (this.role === 'teacher') {
    // Teachers don't need studentProfile - remove it
    this.studentProfile = undefined;
  } else if (this.role === 'student') {
    // Initialize studentProfile with defaults for students
    if (!this.studentProfile) {
      this.studentProfile = {};
    }
    if (this.studentProfile.skillLevel === undefined) {
      this.studentProfile.skillLevel = 50;
    }
    if (this.studentProfile.totalQuizzesTaken === undefined) {
      this.studentProfile.totalQuizzesTaken = 0;
    }
    if (this.studentProfile.averageScore === undefined) {
      this.studentProfile.averageScore = 0;
    }
  }
});

export default model('User', userSchema);