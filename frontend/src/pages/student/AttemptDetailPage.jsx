import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  Trophy,
  TrendingUp,
  FileQuestion,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Award
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Spinner,
  Progress,
} from "@/components/ui";
import { BadgeGrid } from "@/components/shared";
import { useAttempt, useQuiz, useRecentBadges } from "@/hooks";
import { cn } from "@/lib/utils";
import { useState } from "react";

const formatDuration = (seconds) => {
  if (!seconds) return "—";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const difficultyColors = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  hard: "bg-red-100 text-red-700",
};

export default function AttemptDetailPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const { data: attemptData, isLoading } = useAttempt(attemptId);
  const attempt = attemptData?.attempt || attemptData;
  const quiz = attempt?.quiz;

  const { data: fullQuiz } = useQuiz(quiz?._id);
  const { data: recentBadges } = useRecentBadges(1); // Get badges earned today

  const [expandedQuestions, setExpandedQuestions] = useState({});

  const toggleQuestion = (idx) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Attempt not found</p>
        <Button variant="link" onClick={() => navigate(-1)}>
          Go back
        </Button>
      </div>
    );
  }

  // Calculate stats
  const totalQuestions = attempt.answers?.length || 0;
  const correctAnswers = attempt.answers?.filter((a) => a.isCorrect).length || 0;
  const incorrectAnswers = totalQuestions - correctAnswers;
  const scorePercent = Math.round(attempt.percentage || 0);
  const passed = attempt.isPassed;
  const passingPercent = quiz?.totalMarks 
    ? Math.round((quiz.passingMarks / quiz.totalMarks) * 100) 
    : 0;

  // Difficulty analysis
  const difficultyStats = attempt.answers?.reduce((acc, a) => {
    const level = a.difficultyAtTime < 40 ? "easy" : a.difficultyAtTime < 70 ? "medium" : "hard";
    if (!acc[level]) acc[level] = { total: 0, correct: 0 };
    acc[level].total++;
    if (a.isCorrect) acc[level].correct++;
    return acc;
  }, {}) || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{quiz?.title}</h1>
          <p className="text-muted-foreground">
            Attempt #{attempt.attemptNumber || 1} • {formatDate(attempt.startTime || attempt.createdAt)}
          </p>
        </div>
      </div>

      {/* Result Banner */}
      <Card className={cn(
        "border-2",
        passed ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-red-500 bg-red-50 dark:bg-red-950"
      )}>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={cn(
                "h-16 w-16 rounded-full flex items-center justify-center",
                passed ? "bg-green-100" : "bg-red-100"
              )}>
                {passed ? (
                  <Trophy className="h-8 w-8 text-green-600" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-600" />
                )}
              </div>
              <div>
                <h2 className={cn(
                  "text-2xl font-bold",
                  passed ? "text-green-700" : "text-red-700"
                )}>
                  {passed ? "Congratulations!" : "Keep Practicing!"}
                </h2>
                <p className={cn(
                  "text-sm",
                  passed ? "text-green-600" : "text-red-600"
                )}>
                  {passed 
                    ? "You passed this quiz!" 
                    : `You need ${Math.max(0, Math.round((quiz?.passingMarks || 0) - (attempt.score || 0)))} more marks to pass`}
                </p>
              </div>
            </div>

            <div className="text-center">
              <p className={cn(
                "text-5xl font-bold",
                passed ? "text-green-600" : "text-red-600"
              )}>
                {scorePercent}%
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {Math.round(attempt.score || 0)} / {attempt.totalMarks || quiz?.totalMarks} marks
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Stats */}
          <div className="grid gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-2xl font-bold mt-2">{correctAnswers}</p>
                <p className="text-sm text-muted-foreground">Correct</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <p className="text-2xl font-bold mt-2">{incorrectAnswers}</p>
                <p className="text-sm text-muted-foreground">Incorrect</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-2xl font-bold mt-2">{formatDuration(attempt.timeSpent)}</p>
                <p className="text-sm text-muted-foreground">Time Taken</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <p className="text-2xl font-bold mt-2">{Math.round((correctAnswers / totalQuestions) * 100)}%</p>
                <p className="text-sm text-muted-foreground">Accuracy</p>
              </CardContent>
            </Card>
          </div>

          {/* Questions Review */}
          <Card>
            <CardHeader>
              <CardTitle>Questions Review</CardTitle>
              <CardDescription>
                Review your answers and explanations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {attempt.answers?.map((answer, idx) => {
                const question = answer.question;
                const isExpanded = expandedQuestions[idx];

                return (
                  <div 
                    key={idx}
                    className={cn(
                      "border rounded-lg overflow-hidden",
                      answer.isCorrect ? "border-green-200" : "border-red-200"
                    )}
                  >
                    <button
                      onClick={() => toggleQuestion(idx)}
                      className="w-full p-4 flex items-start gap-3 text-left hover:bg-accent/50 transition-colors"
                    >
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                        answer.isCorrect ? "bg-green-100" : "bg-red-100"
                      )}>
                        {answer.isCorrect ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium">
                          Q{idx + 1}. {question?.questionText || "Question not available"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {question?.difficultyLevel && (
                            <Badge className={cn("text-xs", difficultyColors[question.difficultyLevel])}>
                              {question.difficultyLevel}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {question?.points || 1} pts
                          </span>
                        </div>
                      </div>

                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0 border-t bg-muted/30">
                        <div className="pt-4 space-y-3">
                          {/* Options (for MCQ) */}
                          {question?.options?.length > 0 && question?.questionType !== "true-false" && question?.questionType !== "short-answer" && (
                            question.options.map((option, optIdx) => (
                              <div
                                key={optIdx}
                                className={cn(
                                  "p-3 rounded-lg text-sm",
                                  option === question.correctAnswer && "bg-green-100 text-green-800",
                                  option === answer.selectedAnswer && option !== question.correctAnswer && "bg-red-100 text-red-800",
                                  option !== question.correctAnswer && option !== answer.selectedAnswer && "bg-muted"
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  {option === question.correctAnswer && (
                                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                                  )}
                                  {option === answer.selectedAnswer && option !== question.correctAnswer && (
                                    <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                                  )}
                                  <span>{option}</span>
                                </div>
                              </div>
                            ))
                          )}

                          {/* For True/False */}
                          {question?.questionType === "true-false" && (
                            <div className="space-y-2">
                              {["true", "false"].map((value) => (
                                <div
                                  key={value}
                                  className={cn(
                                    "p-3 rounded-lg text-sm capitalize",
                                    value === question.correctAnswer?.toLowerCase() && "bg-green-100 text-green-800",
                                    value === answer.selectedAnswer?.toLowerCase() && value !== question.correctAnswer?.toLowerCase() && "bg-red-100 text-red-800",
                                    value !== question.correctAnswer?.toLowerCase() && value !== answer.selectedAnswer?.toLowerCase() && "bg-muted"
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    {value === question.correctAnswer?.toLowerCase() && (
                                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                                    )}
                                    {value === answer.selectedAnswer?.toLowerCase() && value !== question.correctAnswer?.toLowerCase() && (
                                      <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                                    )}
                                    <span>{value}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* For Short Answer */}
                          {question?.questionType === "short-answer" && (
                            <div className="space-y-3">
                              <div className="p-3 rounded-lg bg-muted">
                                <p className="text-xs text-muted-foreground mb-1">Your Answer</p>
                                <p className={cn(
                                  "text-sm font-medium",
                                  answer.isCorrect ? "text-green-600" : "text-red-600"
                                )}>
                                  {answer.selectedAnswer || <span className="italic text-muted-foreground">No answer provided</span>}
                                </p>
                              </div>
                              <div className="p-3 rounded-lg bg-green-100">
                                <p className="text-xs text-green-700 mb-1">Correct Answer</p>
                                <p className="text-sm font-medium text-green-800">
                                  {question.correctAnswer}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Fallback for unknown question types without options */}
                          {(!question?.options || question.options.length === 0) && 
                           question?.questionType !== "true-false" && 
                           question?.questionType !== "short-answer" && (
                            <div className="space-y-2">
                              <p className="text-sm">
                                <span className="text-muted-foreground">Your answer:</span>{" "}
                                <span className={answer.isCorrect ? "text-green-600" : "text-red-600"}>
                                  {answer.selectedAnswer || "No answer"}
                                </span>
                              </p>
                              <p className="text-sm">
                                <span className="text-muted-foreground">Correct answer:</span>{" "}
                                <span className="text-green-600">{question?.correctAnswer}</span>
                              </p>
                            </div>
                          )}

                          {/* Explanation */}
                          {question?.explanation && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm font-medium text-blue-800">Explanation</p>
                              <p className="text-sm text-blue-700 mt-1">{question.explanation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Score Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Score Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Your Score</span>
                  <span className="font-medium">{scorePercent}%</span>
                </div>
                <Progress value={scorePercent} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Passing Score</span>
                  <span className="font-medium">{passingPercent}%</span>
                </div>
                <Progress value={passingPercent} className="h-2 [&>div]:bg-yellow-500" />
              </div>
            </CardContent>
          </Card>

          {/* Difficulty Performance */}
          {Object.keys(difficultyStats).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>By Difficulty</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(difficultyStats).map(([level, stats]) => (
                  <div key={level} className="flex items-center justify-between">
                    <Badge className={cn("capitalize", difficultyColors[level])}>
                      {level}
                    </Badge>
                    <span className="text-sm">
                      {stats.correct}/{stats.total} correct
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Badges Earned */}
          {recentBadges && recentBadges.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                  <Award className="h-5 w-5" />
                  Badges Earned!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BadgeGrid badges={recentBadges} size="md" />
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {fullQuiz && (
              <Link to={`/student/quiz/${quiz._id}`} className="block">
                <Button variant="outline" className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </Link>
            )}
            <Link to="/student/quizzes" className="block">
              <Button variant="outline" className="w-full">
                <FileQuestion className="mr-2 h-4 w-4" />
                More Quizzes
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
