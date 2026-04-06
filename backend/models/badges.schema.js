import { Schema, model } from "mongoose";

// Badge definitions - all possible badges in the system
export const BADGE_DEFINITIONS = {
  // Quiz Milestones
  first_quiz: {
    id: "first_quiz",
    name: "First Steps",
    description: "Completed your first quiz",
    icon: "rocket",
    category: "milestone",
    tier: "bronze",
    requirement: { type: "quizzes_completed", value: 1 },
  },
  quiz_5: {
    id: "quiz_5",
    name: "Getting Started",
    description: "Completed 5 quizzes",
    icon: "target",
    category: "milestone",
    tier: "bronze",
    requirement: { type: "quizzes_completed", value: 5 },
  },
  quiz_10: {
    id: "quiz_10",
    name: "Quiz Enthusiast",
    description: "Completed 10 quizzes",
    icon: "flame",
    category: "milestone",
    tier: "silver",
    requirement: { type: "quizzes_completed", value: 10 },
  },
  quiz_25: {
    id: "quiz_25",
    name: "Quiz Master",
    description: "Completed 25 quizzes",
    icon: "crown",
    category: "milestone",
    tier: "gold",
    requirement: { type: "quizzes_completed", value: 25 },
  },
  quiz_50: {
    id: "quiz_50",
    name: "Quiz Legend",
    description: "Completed 50 quizzes",
    icon: "trophy",
    category: "milestone",
    tier: "platinum",
    requirement: { type: "quizzes_completed", value: 50 },
  },

  // Accuracy Badges
  perfect_score: {
    id: "perfect_score",
    name: "Perfect!",
    description: "Scored 100% on a quiz",
    icon: "star",
    category: "accuracy",
    tier: "gold",
    requirement: { type: "perfect_score", value: 1 },
  },
  perfect_streak_3: {
    id: "perfect_streak_3",
    name: "Hat Trick",
    description: "Got 3 perfect scores",
    icon: "stars",
    category: "accuracy",
    tier: "platinum",
    requirement: { type: "perfect_score", value: 3 },
  },
  high_achiever: {
    id: "high_achiever",
    name: "High Achiever",
    description: "Maintain 90%+ average score",
    icon: "medal",
    category: "accuracy",
    tier: "gold",
    requirement: { type: "average_score", value: 90 },
  },
  consistent: {
    id: "consistent",
    name: "Consistent Performer",
    description: "Maintain 70%+ average score over 10+ quizzes",
    icon: "check-circle",
    category: "accuracy",
    tier: "silver",
    requirement: { type: "consistent_score", value: 70, minQuizzes: 10 },
  },

  // Streak Badges
  streak_3: {
    id: "streak_3",
    name: "On Fire",
    description: "3-day quiz streak",
    icon: "flame",
    category: "streak",
    tier: "bronze",
    requirement: { type: "streak", value: 3 },
  },
  streak_7: {
    id: "streak_7",
    name: "Week Warrior",
    description: "7-day quiz streak",
    icon: "zap",
    category: "streak",
    tier: "silver",
    requirement: { type: "streak", value: 7 },
  },
  streak_14: {
    id: "streak_14",
    name: "Dedicated Learner",
    description: "14-day quiz streak",
    icon: "award",
    category: "streak",
    tier: "gold",
    requirement: { type: "streak", value: 14 },
  },
  streak_30: {
    id: "streak_30",
    name: "Unstoppable",
    description: "30-day quiz streak",
    icon: "crown",
    category: "streak",
    tier: "platinum",
    requirement: { type: "streak", value: 30 },
  },

  // Difficulty Badges
  hard_conqueror: {
    id: "hard_conqueror",
    name: "Hard Mode Hero",
    description: "Passed a hard difficulty quiz",
    icon: "shield",
    category: "difficulty",
    tier: "silver",
    requirement: { type: "hard_quiz_passed", value: 1 },
  },
  hard_master: {
    id: "hard_master",
    name: "Difficulty Master",
    description: "Passed 5 hard difficulty quizzes",
    icon: "swords",
    category: "difficulty",
    tier: "gold",
    requirement: { type: "hard_quiz_passed", value: 5 },
  },

  // Speed Badges
  speed_demon: {
    id: "speed_demon",
    name: "Speed Demon",
    description: "Complete a quiz in under 50% of allotted time",
    icon: "timer",
    category: "speed",
    tier: "silver",
    requirement: { type: "fast_completion", value: 50 },
  },
  lightning: {
    id: "lightning",
    name: "Lightning Fast",
    description: "Complete a quiz in under 25% of allotted time with 80%+ score",
    icon: "bolt",
    category: "speed",
    tier: "gold",
    requirement: { type: "fast_accurate", value: 25, minScore: 80 },
  },

  // Questions Answered
  questions_100: {
    id: "questions_100",
    name: "Century",
    description: "Answered 100 questions",
    icon: "hash",
    category: "milestone",
    tier: "bronze",
    requirement: { type: "questions_answered", value: 100 },
  },
  questions_500: {
    id: "questions_500",
    name: "Knowledge Seeker",
    description: "Answered 500 questions",
    icon: "book-open",
    category: "milestone",
    tier: "silver",
    requirement: { type: "questions_answered", value: 500 },
  },
  questions_1000: {
    id: "questions_1000",
    name: "Scholar",
    description: "Answered 1000 questions",
    icon: "graduation-cap",
    category: "milestone",
    tier: "gold",
    requirement: { type: "questions_answered", value: 1000 },
  },

  // Special Badges
  comeback: {
    id: "comeback",
    name: "Comeback Kid",
    description: "Improved score by 20%+ from previous attempt on same quiz",
    icon: "trending-up",
    category: "special",
    tier: "silver",
    requirement: { type: "improvement", value: 20 },
  },
  adaptive_master: {
    id: "adaptive_master",
    name: "Adaptive Master",
    description: "Reached hard difficulty in an adaptive quiz",
    icon: "brain",
    category: "special",
    tier: "gold",
    requirement: { type: "adaptive_hard", value: 1 },
  },
};

// User's earned badges
const userBadgeSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    
    // Array of earned badges
    badges: [
      {
        badgeId: { type: String, required: true }, // References BADGE_DEFINITIONS key
        earnedAt: { type: Date, default: Date.now },
        // For badges that can be earned multiple times (e.g., perfect_score)
        count: { type: Number, default: 1 },
        // Context of when badge was earned
        context: {
          quizId: { type: Schema.Types.ObjectId, ref: "Quiz" },
          attemptId: { type: Schema.Types.ObjectId, ref: "QuizAttempt" },
          score: Number,
        },
      },
    ],

    // Stats for badge calculations
    stats: {
      perfectScores: { type: Number, default: 0 },
      hardQuizzesPassed: { type: Number, default: 0 },
      fastCompletions: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Ensure one document per user
userBadgeSchema.index({ user: 1 }, { unique: true });

export default model("UserBadge", userBadgeSchema);
