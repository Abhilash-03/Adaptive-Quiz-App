// Adaptive Difficulty Service
// Implements AI-based difficulty adjustment using IRT-inspired algorithms

// Constants for algorithm tuning
const CONFIG = {
  // Difficulty bounds (1-100 scale)
  MIN_DIFFICULTY: 1,
  MAX_DIFFICULTY: 100,

  // Performance window - how many recent answers to consider
  SLIDING_WINDOW_SIZE: 5,

  // K-factor for ELO-like adjustments (higher = more volatile)
  K_FACTOR: 32,

  // Target success rate for optimal learning (70% is ideal for learning)
  TARGET_SUCCESS_RATE: 0.7,

  // Difficulty level thresholds
  DIFFICULTY_THRESHOLDS: {
    easy: { min: 1, max: 33 },
    medium: { min: 34, max: 66 },
    hard: { min: 67, max: 100 },
  },

  // Weight factors for performance calculation
  WEIGHTS: {
    accuracy: 0.5,
    timePerformance: 0.2,
    streak: 0.15,
    difficultyBonus: 0.15,
  },
};

// Calculate the probability of correct answer based on user skill and question difficulty
// Based on Item Response Theory (IRT) logistic model
const calculateProbability = (userSkill, questionDifficulty) => {
  // Logistic function: P(correct) = 1 / (1 + e^(-(skill - difficulty)/scale))
  const scale = 25; // Controls steepness of the curve
  const exponent = -(userSkill - questionDifficulty) / scale;
  return 1 / (1 + Math.exp(exponent));
};

// Calculate new difficulty based on recent performance
const calculateNextDifficulty = (currentDifficulty, recentAnswers, userSkill) => {
  if (!recentAnswers || recentAnswers.length === 0) {
    return currentDifficulty;
  }

  // Get sliding window of answers
  const windowAnswers = recentAnswers.slice(-CONFIG.SLIDING_WINDOW_SIZE);

  // Calculate current success rate
  const correctCount = windowAnswers.filter((a) => a.isCorrect).length;
  const successRate = correctCount / windowAnswers.length;

  // Calculate weighted performance score
  const performanceScore = calculatePerformanceScore(windowAnswers);

  // Determine adjustment based on deviation from target success rate
  const deviation = successRate - CONFIG.TARGET_SUCCESS_RATE;

  // Calculate adjustment magnitude using ELO-inspired formula
  let adjustment;
  if (deviation > 0.15) {
    // Performing too well, increase difficulty
    adjustment = CONFIG.K_FACTOR * (deviation * 2);
  } else if (deviation < -0.15) {
    // Struggling, decrease difficulty
    adjustment = CONFIG.K_FACTOR * (deviation * 2);
  } else {
    // In optimal zone, make small adjustments
    adjustment = CONFIG.K_FACTOR * deviation;
  }

  // Apply streak bonus/penalty
  const streak = calculateStreak(windowAnswers);
  if (streak >= 3) {
    adjustment += streak * 3; // Bonus increase for winning streak
  } else if (streak <= -3) {
    adjustment += streak * 3; // Extra decrease for losing streak
  }

  // Calculate new difficulty
  let newDifficulty = currentDifficulty + adjustment;

  // Ensure difficulty stays within bounds
  newDifficulty = Math.max(CONFIG.MIN_DIFFICULTY, Math.min(CONFIG.MAX_DIFFICULTY, newDifficulty));

  return Math.round(newDifficulty);
};

// Calculate weighted performance score from answers
const calculatePerformanceScore = (answers) => {
  if (!answers || answers.length === 0) return 50;

  let totalScore = 0;
  let totalWeight = 0;

  answers.forEach((answer, index) => {
    // More recent answers have higher weight
    const recencyWeight = (index + 1) / answers.length;

    // Accuracy component
    const accuracyScore = answer.isCorrect ? 100 : 0;

    // Time performance component (faster = better, but cap it)
    const expectedTime = answer.timeLimit || 30;
    const timeTaken = answer.timeTaken || expectedTime;
    const timeRatio = Math.min(timeTaken / expectedTime, 2);
    const timeScore = answer.isCorrect ? Math.max(0, 100 * (1 - timeRatio * 0.5)) : 0;

    // Difficulty bonus (harder questions worth more)
    const difficultyBonus = answer.isCorrect ? (answer.difficultyAtTime || 50) : 0;

    // Calculate weighted score for this answer
    const answerScore =
      accuracyScore * CONFIG.WEIGHTS.accuracy +
      timeScore * CONFIG.WEIGHTS.timePerformance +
      difficultyBonus * CONFIG.WEIGHTS.difficultyBonus;

    totalScore += answerScore * recencyWeight;
    totalWeight += recencyWeight;
  });

  return totalWeight > 0 ? totalScore / totalWeight : 50;
};

// Calculate streak (positive for correct streak, negative for incorrect)
const calculateStreak = (answers) => {
  if (!answers || answers.length === 0) return 0;

  let streak = 0;
  const lastResult = answers[answers.length - 1].isCorrect;

  for (let i = answers.length - 1; i >= 0; i--) {
    if (answers[i].isCorrect === lastResult) {
      streak += lastResult ? 1 : -1;
    } else {
      break;
    }
  }

  return streak;
};

// Select the best question based on current difficulty target
const selectQuestion = (questions, targetDifficulty, answeredIds = []) => {
  // Filter out already answered questions
  const available = questions.filter(
    (q) => !answeredIds.includes(q._id.toString())
  );

  if (available.length === 0) return null;

  // Find questions within acceptable range
  const range = 15; // Accept questions within ±15 of target
  const inRange = available.filter(
    (q) => Math.abs(q.difficultyScore - targetDifficulty) <= range
  );

  // If we have questions in range, pick randomly from them for variety
  if (inRange.length > 0) {
    // Sort by closeness to target, then add some randomness
    inRange.sort((a, b) => {
      const diffA = Math.abs(a.difficultyScore - targetDifficulty);
      const diffB = Math.abs(b.difficultyScore - targetDifficulty);
      return diffA - diffB;
    });

    // Pick from top 3 closest (if available) for variety
    const topCandidates = inRange.slice(0, Math.min(3, inRange.length));
    return topCandidates[Math.floor(Math.random() * topCandidates.length)];
  }

  // If no questions in range, find the closest one
  return available.reduce((closest, question) => {
    const closestDiff = Math.abs(closest.difficultyScore - targetDifficulty);
    const currentDiff = Math.abs(question.difficultyScore - targetDifficulty);
    return currentDiff < closestDiff ? question : closest;
  });
};

// Update user's skill level based on quiz performance
const updateUserSkill = (currentSkill, quizPerformance) => {
  const { correctAnswers, totalQuestions, avgDifficulty, timePerformance } = quizPerformance;

  // Calculate accuracy-based adjustment
  const accuracy = correctAnswers / totalQuestions;
  const expectedAccuracy = calculateProbability(currentSkill, avgDifficulty);
  const accuracyDelta = accuracy - expectedAccuracy;

  // ELO-like skill adjustment
  let adjustment = CONFIG.K_FACTOR * accuracyDelta;

  // Bonus for performing well on hard questions
  if (avgDifficulty > 60 && accuracy > 0.7) {
    adjustment *= 1.2;
  }

  // Reduce penalty for hard quizzes
  if (avgDifficulty > 70 && accuracy < 0.5) {
    adjustment *= 0.8;
  }

  // Apply time bonus (answering quickly and correctly)
  if (timePerformance > 0.7) {
    adjustment *= 1.1;
  }

  const newSkill = currentSkill + adjustment;

  // Bound skill level
  return Math.max(0, Math.min(100, Math.round(newSkill)));
};

// Get difficulty level label from score
const getDifficultyLevel = (score) => {
  if (score <= CONFIG.DIFFICULTY_THRESHOLDS.easy.max) return "easy";
  if (score <= CONFIG.DIFFICULTY_THRESHOLDS.medium.max) return "medium";
  return "hard";
};

// Get difficulty score from level
const getDifficultyScore = (level) => {
  const midpoints = {
    easy: 20,
    medium: 50,
    hard: 80,
  };
  return midpoints[level] || 50;
};

// Calculate initial difficulty based on user skill and quiz settings
const calculateInitialDifficulty = (userSkill, quizInitialDifficulty) => {
  const baseDifficulty = getDifficultyScore(quizInitialDifficulty);

  // Blend user skill with quiz setting (60% quiz setting, 40% user skill)
  const blendedDifficulty = baseDifficulty * 0.6 + userSkill * 0.4;

  return Math.round(blendedDifficulty);
};

// Analyze performance for category-specific skill tracking
const analyzePerformance = (answers) => {
  const analysis = {
    overall: {
      total: answers.length,
      correct: 0,
      accuracy: 0,
      avgDifficulty: 0,
      avgTimePerQuestion: 0,
    },
    byDifficulty: {
      easy: { total: 0, correct: 0 },
      medium: { total: 0, correct: 0 },
      hard: { total: 0, correct: 0 },
    },
    strengths: [],
    weaknesses: [],
  };

  if (answers.length === 0) return analysis;

  let totalDifficulty = 0;
  let totalTime = 0;

  answers.forEach((answer) => {
    const level = getDifficultyLevel(answer.difficultyAtTime || 50);

    // Overall stats
    if (answer.isCorrect) analysis.overall.correct++;
    totalDifficulty += answer.difficultyAtTime || 50;
    totalTime += answer.timeTaken || 0;

    // By difficulty
    analysis.byDifficulty[level].total++;
    if (answer.isCorrect) analysis.byDifficulty[level].correct++;
  });

  // Calculate averages
  analysis.overall.accuracy = (analysis.overall.correct / analysis.overall.total) * 100;
  analysis.overall.avgDifficulty = totalDifficulty / answers.length;
  analysis.overall.avgTimePerQuestion = totalTime / answers.length;

  // Identify strengths and weaknesses
  Object.entries(analysis.byDifficulty).forEach(([level, stats]) => {
    if (stats.total >= 2) {
      const accuracy = stats.correct / stats.total;
      if (accuracy >= 0.8) {
        analysis.strengths.push(`Strong on ${level} questions (${Math.round(accuracy * 100)}%)`);
      } else if (accuracy < 0.4) {
        analysis.weaknesses.push(`Needs practice on ${level} questions (${Math.round(accuracy * 100)}%)`);
      }
    }
  });

  return analysis;
};

// Generate learning recommendations based on performance
const generateRecommendations = (performanceAnalysis, userSkill) => {
  const recommendations = [];

  const { accuracy, avgDifficulty } = performanceAnalysis.overall;

  // Accuracy-based recommendations
  if (accuracy < 50) {
    recommendations.push("Consider reviewing fundamentals before attempting more quizzes");
    recommendations.push("Try easier quizzes to build confidence");
  } else if (accuracy > 85 && avgDifficulty < 50) {
    recommendations.push("You're ready for more challenging quizzes!");
    recommendations.push("Try medium or hard difficulty to continue growing");
  }

  // Skill-based recommendations
  if (userSkill < 30) {
    recommendations.push("Focus on easy questions to build foundational knowledge");
  } else if (userSkill > 70) {
    recommendations.push("Challenge yourself with hard questions to maintain growth");
  }

  // Add weakness-based recommendations
  performanceAnalysis.weaknesses.forEach((weakness) => {
    recommendations.push(`Practice more: ${weakness}`);
  });

  return recommendations;
};

export {
  CONFIG,
  calculateProbability,
  calculateNextDifficulty,
  calculatePerformanceScore,
  calculateStreak,
  selectQuestion,
  updateUserSkill,
  getDifficultyLevel,
  getDifficultyScore,
  calculateInitialDifficulty,
  analyzePerformance,
  generateRecommendations,
};
