// Badge Service - Handles badge checking and awarding logic
import UserBadge, { BADGE_DEFINITIONS } from "../models/badges.schema.js";
import Analytics from "../models/analytics.schema.js";
import User from "../models/users.schema.js";
import QuizAttempt from "../models/quizAttempts.schema.js";

// Check and award badges after a quiz attempt
export const checkAndAwardBadges = async (userId, attemptData) => {
  const {
    attemptId,
    quizId,
    percentage,
    timeTaken, // in seconds
    duration, // quiz duration in minutes
    isAdaptive,
    maxDifficultyReached,
    quizDifficulty,
    isPassed,
  } = attemptData;

  // Get or create user badge document
  let userBadge = await UserBadge.findOne({ user: userId });
  if (!userBadge) {
    userBadge = new UserBadge({ user: userId, badges: [], stats: {} });
  }

  // Get user analytics and profile
  const analytics = await Analytics.findOne({ user: userId });
  const user = await User.findById(userId);

  const newBadges = [];

  // Helper to check if badge is already earned
  const hasBadge = (badgeId) => userBadge.badges.some((b) => b.badgeId === badgeId);

  // Helper to award a badge
  const awardBadge = (badgeId, context = {}) => {
    if (!hasBadge(badgeId)) {
      userBadge.badges.push({
        badgeId,
        earnedAt: new Date(),
        count: 1,
        context: {
          quizId,
          attemptId,
          score: percentage,
          ...context,
        },
      });
      newBadges.push({ ...BADGE_DEFINITIONS[badgeId], earnedAt: new Date() });
    }
  };

  // Helper to increment badge count (for repeatable badges)
  const incrementBadge = (badgeId, context = {}) => {
    const existing = userBadge.badges.find((b) => b.badgeId === badgeId);
    if (existing) {
      existing.count += 1;
    } else {
      userBadge.badges.push({
        badgeId,
        earnedAt: new Date(),
        count: 1,
        context: {
          quizId,
          attemptId,
          score: percentage,
          ...context,
        },
      });
      newBadges.push({ ...BADGE_DEFINITIONS[badgeId], earnedAt: new Date() });
    }
  };

  const totalQuizzesTaken = user?.studentProfile?.totalQuizzesTaken || 0;
  const avgScore = user?.studentProfile?.averageScore || 0;
  const currentStreak = analytics?.currentStreak || 0;
  const longestStreak = analytics?.longestStreak || 0;
  const totalQuestionsAnswered = analytics?.totalQuestionsAnswered || 0;

  // ===== QUIZ MILESTONE BADGES =====
  if (totalQuizzesTaken >= 1) awardBadge("first_quiz");
  if (totalQuizzesTaken >= 5) awardBadge("quiz_5");
  if (totalQuizzesTaken >= 10) awardBadge("quiz_10");
  if (totalQuizzesTaken >= 25) awardBadge("quiz_25");
  if (totalQuizzesTaken >= 50) awardBadge("quiz_50");

  // ===== ACCURACY BADGES =====
  // Perfect score
  if (percentage === 100) {
    userBadge.stats.perfectScores = (userBadge.stats.perfectScores || 0) + 1;
    incrementBadge("perfect_score");

    if (userBadge.stats.perfectScores >= 3) {
      awardBadge("perfect_streak_3");
    }
  }

  // High achiever (90%+ average)
  if (avgScore >= 90 && totalQuizzesTaken >= 3) {
    awardBadge("high_achiever");
  }

  // Consistent performer (70%+ over 10+ quizzes)
  if (avgScore >= 70 && totalQuizzesTaken >= 10) {
    awardBadge("consistent");
  }

  // ===== STREAK BADGES =====
  const streakToCheck = Math.max(currentStreak, longestStreak);
  if (streakToCheck >= 3) awardBadge("streak_3");
  if (streakToCheck >= 7) awardBadge("streak_7");
  if (streakToCheck >= 14) awardBadge("streak_14");
  if (streakToCheck >= 30) awardBadge("streak_30");

  // ===== DIFFICULTY BADGES =====
  if (quizDifficulty === "hard" && isPassed) {
    userBadge.stats.hardQuizzesPassed = (userBadge.stats.hardQuizzesPassed || 0) + 1;
    
    if (userBadge.stats.hardQuizzesPassed >= 1) awardBadge("hard_conqueror");
    if (userBadge.stats.hardQuizzesPassed >= 5) awardBadge("hard_master");
  }

  // ===== SPEED BADGES =====
  if (duration && timeTaken) {
    const durationSeconds = duration * 60;
    const percentageTime = (timeTaken / durationSeconds) * 100;

    if (percentageTime <= 50 && isPassed) {
      userBadge.stats.fastCompletions = (userBadge.stats.fastCompletions || 0) + 1;
      awardBadge("speed_demon");
    }

    if (percentageTime <= 25 && percentage >= 80) {
      awardBadge("lightning");
    }
  }

  // ===== QUESTIONS ANSWERED BADGES =====
  if (totalQuestionsAnswered >= 100) awardBadge("questions_100");
  if (totalQuestionsAnswered >= 500) awardBadge("questions_500");
  if (totalQuestionsAnswered >= 1000) awardBadge("questions_1000");

  // ===== SPECIAL BADGES =====
  // Adaptive master - reached hard in adaptive quiz
  if (isAdaptive && maxDifficultyReached === "hard") {
    awardBadge("adaptive_master");
  }

  // Comeback kid - check improvement from previous attempt
  if (quizId) {
    const previousAttempt = await QuizAttempt.findOne({
      user: userId,
      quiz: quizId,
      _id: { $ne: attemptId },
      status: "completed",
    }).sort({ completedAt: -1 });

    if (previousAttempt && previousAttempt.percentage !== undefined) {
      const improvement = percentage - previousAttempt.percentage;
      if (improvement >= 20) {
        awardBadge("comeback", { previousScore: previousAttempt.percentage });
      }
    }
  }

  // Save updated badges
  await userBadge.save();

  return {
    newBadges,
    totalBadges: userBadge.badges.length,
  };
};

// Get all badges for a user
export const getUserBadges = async (userId) => {
  const userBadge = await UserBadge.findOne({ user: userId });
  
  if (!userBadge) {
    return {
      earned: [],
      available: Object.values(BADGE_DEFINITIONS),
      stats: { total: 0, bronze: 0, silver: 0, gold: 0, platinum: 0 },
    };
  }

  // Map earned badges with full definitions
  const earned = userBadge.badges.map((badge) => ({
    ...BADGE_DEFINITIONS[badge.badgeId],
    earnedAt: badge.earnedAt,
    count: badge.count,
    context: badge.context,
  }));

  // Get badges not yet earned
  const earnedIds = new Set(userBadge.badges.map((b) => b.badgeId));
  const available = Object.values(BADGE_DEFINITIONS).filter(
    (b) => !earnedIds.has(b.id)
  );

  // Calculate stats by tier
  const stats = {
    total: earned.length,
    bronze: earned.filter((b) => b.tier === "bronze").length,
    silver: earned.filter((b) => b.tier === "silver").length,
    gold: earned.filter((b) => b.tier === "gold").length,
    platinum: earned.filter((b) => b.tier === "platinum").length,
  };

  return { earned, available, stats };
};

// Get recent badges (for notifications)
export const getRecentBadges = async (userId, days = 7) => {
  const userBadge = await UserBadge.findOne({ user: userId });
  if (!userBadge) return [];

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return userBadge.badges
    .filter((b) => b.earnedAt >= cutoff)
    .map((badge) => ({
      ...BADGE_DEFINITIONS[badge.badgeId],
      earnedAt: badge.earnedAt,
    }))
    .sort((a, b) => b.earnedAt - a.earnedAt);
};

// Get badge leaderboard
export const getBadgeLeaderboard = async (limit = 10) => {
  const leaderboard = await UserBadge.aggregate([
    {
      $project: {
        user: 1,
        badgeCount: { $size: "$badges" },
        // Calculate weighted score (platinum=4, gold=3, silver=2, bronze=1)
        badges: 1,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    { $unwind: "$userInfo" },
    {
      $project: {
        user: "$userInfo",
        badgeCount: 1,
      },
    },
    { $sort: { badgeCount: -1 } },
    { $limit: limit },
  ]);

  return leaderboard.map((entry) => ({
    userId: entry.user._id,
    fullname: entry.user.fullname,
    avatar: entry.user.avatar,
    badgeCount: entry.badgeCount,
  }));
};
