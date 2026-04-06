import { Link, useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft,
  Play,
  Clock,
  FileQuestion,
  Target,
  Trophy,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  Medal,
  Flame,
  Star
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { useQuiz, useMyAttempts, useStartAttempt, useLeaderboard } from "@/hooks";
import { cn } from "@/lib/utils";

const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins ? `${hours}h ${mins}m` : `${hours} hours`;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const difficultyColors = {
  easy: "text-green-600 bg-green-100",
  medium: "text-yellow-600 bg-yellow-100",
  hard: "text-red-600 bg-red-100",
};

export default function QuizDetailPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const { data: quiz, isLoading: isLoadingQuiz } = useQuiz(quizId);
  const { data: attemptsData } = useMyAttempts({ quizId });
  const { data: leaderboard } = useLeaderboard(quizId);
  const startAttempt = useStartAttempt();

  const attempts = attemptsData?.attempts || [];
  const topScorers = leaderboard?.slice(0, 10) || leaderboard?.leaderboard?.slice(0, 10) || [];

  // Only count completed/abandoned attempts for limits
  const completedAttempts = attempts.filter(a => a.status === "completed" || a.status === "abandoned");
  const canAttempt = quiz && completedAttempts.length < quiz.allowedAttempts;
  const hasInProgress = attempts.some(a => a.status === "in-progress");
  
  // Find best COMPLETED attempt by percentage
  const bestAttempt = attempts
    .filter(a => a.status === "completed")
    .reduce((best, current) => 
      ((current.percentage || 0) > (best?.percentage || 0) ? current : best), null);

  const handleStartQuiz = async () => {
    try {
      await startAttempt.mutateAsync(quizId);
    } catch {
      // Error handled in mutation
    }
  };

  if (isLoadingQuiz) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Quiz not found</p>
        <Button variant="link" onClick={() => navigate(-1)}>
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{quiz.category}</Badge>
            {quiz.isAdaptive && (
              <Badge variant="secondary">Adaptive</Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold mt-1">{quiz.title}</h1>
          {quiz.description && (
            <p className="text-muted-foreground mt-1">{quiz.description}</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quiz Info */}
          <Card>
            <CardHeader>
              <CardTitle>Quiz Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileQuestion className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Questions</p>
                    <p className="font-medium">{quiz.totalQuestions}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">{formatDuration(quiz.duration)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Passing Score</p>
                    <p className="font-medium">{quiz.passingMarks}/{quiz.totalMarks} marks</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Attempts Allowed</p>
                    <p className="font-medium">{quiz.allowedAttempts}</p>
                  </div>
                </div>
              </div>

              {/* Difficulty */}
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Starting Difficulty</span>
                  <Badge className={cn(difficultyColors[quiz.initialDifficulty])}>
                    {quiz.initialDifficulty}
                  </Badge>
                </div>
                {quiz.isAdaptive && (
                  <p className="text-xs text-muted-foreground mt-2">
                    This quiz uses adaptive difficulty. Questions will adjust based on your performance.
                  </p>
                )}
              </div>

              {/* Schedule */}
              {(quiz.startDate || quiz.endDate) && (
                <div className="mt-4 pt-4 border-t space-y-2">
                  {quiz.startDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Starts:</span>
                      <span>{formatDate(quiz.startDate)}</span>
                    </div>
                  )}
                  {quiz.endDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Ends:</span>
                      <span>{formatDate(quiz.endDate)}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Attempts */}
          {attempts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>My Attempts</CardTitle>
                <CardDescription>
                  {completedAttempts.length} of {quiz.allowedAttempts} attempts used
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {attempts.map((attempt, index) => (
                    <Link
                      key={attempt._id}
                      to={`/student/attempt/${attempt._id}`}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center",
                            attempt.status === "completed" 
                              ? attempt.isPassed 
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                              : "bg-yellow-100 text-yellow-600"
                          )}>
                            {attempt.status === "completed" ? (
                              attempt.isPassed ? (
                                <CheckCircle2 className="h-5 w-5" />
                              ) : (
                                <XCircle className="h-5 w-5" />
                              )
                            ) : (
                              <Clock className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">Attempt #{attempt.attemptNumber || index + 1}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(attempt.startTime || attempt.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {attempt.status === "completed" ? (
                            <>
                              <p className="font-bold text-lg">
                                {Math.round(attempt.percentage || 0)}%
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {Math.round(attempt.score || 0)}/{attempt.totalMarks || quiz.totalMarks}
                              </p>
                            </>
                          ) : (
                            <Badge variant="secondary">In Progress</Badge>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Start Quiz Card */}
          <Card>
            <CardContent className="pt-6">
              {bestAttempt && (
                <div className="mb-6 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Your Best Score</p>
                  <p className="text-4xl font-bold">
                    {Math.round(bestAttempt.percentage || 0)}%
                  </p>
                  <Progress 
                    value={bestAttempt.percentage || 0} 
                    className="mt-2 h-2"
                  />
                  <p className={cn(
                    "text-sm mt-2",
                    bestAttempt.isPassed ? "text-green-600" : "text-red-600"
                  )}>
                    {bestAttempt.isPassed ? "Passed" : "Not Passed"}
                  </p>
                </div>
              )}

              {hasInProgress ? (
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleStartQuiz}
                  disabled={startAttempt.isPending}
                >
                  {startAttempt.isPending ? (
                    <Spinner className="mr-2" size="sm" />
                  ) : (
                    <Play className="mr-2 h-5 w-5" />
                  )}
                  Resume Quiz
                </Button>
              ) : canAttempt ? (
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleStartQuiz}
                  disabled={startAttempt.isPending}
                >
                  {startAttempt.isPending ? (
                    <Spinner className="mr-2" size="sm" />
                  ) : (
                    <Play className="mr-2 h-5 w-5" />
                  )}
                  {attempts.length > 0 ? "Retry Quiz" : "Start Quiz"}
                </Button>
              ) : (
                <div className="text-center">
                  <p className="text-muted-foreground">
                    You have used all {quiz.allowedAttempts} attempts
                  </p>
                </div>
              )}

              {canAttempt && !hasInProgress && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  {quiz.allowedAttempts - completedAttempts.length} attempts remaining
                </p>
              )}
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card className="overflow-hidden border-0 shadow-lg">
            {/* Header with gradient */}
            <CardHeader className="relative bg-linear-to-br from-amber-500 via-orange-500 to-red-500 text-white overflow-hidden -mt-4 pt-2">
              <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px'}} />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Trophy className="h-5 w-5" />
                    </div>
                    Leaderboard
                  </CardTitle>
                  <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                    <Flame className="h-3 w-3 mr-1" />
                    Top Performers
                  </Badge>
                </div>
                <CardDescription className="text-amber-100 mt-2">
                  Ranked by score, then by completion time
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {topScorers.length > 0 ? (
                <>
                  {/* Top 3 Podium */}
                  {topScorers.length >= 3 && (
                    <div className="bg-linear-to-b from-muted/50 to-transparent p-6">
                      <div className="flex items-end justify-center gap-2 sm:gap-4">
                        {/* 2nd Place */}
                        <div className="flex flex-col items-center">
                          <div className="relative">
                            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-linear-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white font-bold text-lg shadow-lg ring-4 ring-gray-200 dark:ring-gray-700">
                              {topScorers[1]?.user?.avatar ? (
                                <img src={topScorers[1].user.avatar} alt="" className="h-full w-full rounded-full object-cover" />
                              ) : (
                                topScorers[1]?.user?.fullname?.charAt(0)?.toUpperCase() || "2"
                              )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-bold shadow">
                              2
                            </div>
                          </div>
                          <p className="mt-2 text-xs sm:text-sm font-medium truncate max-w-16 sm:max-w-20 text-center">
                            {topScorers[1]?.user?.fullname?.split(' ')[0] || "—"}
                          </p>
                          <p className="text-xs text-muted-foreground">{Math.round(topScorers[1]?.percentage || 0)}%</p>
                          {topScorers[1]?.timeTaken != null && (
                            <p className="text-xs text-muted-foreground flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" />
                              {topScorers[1].timeTaken < 60 
                                ? `${topScorers[1].timeTaken}s`
                                : `${Math.floor(topScorers[1].timeTaken / 60)}m ${topScorers[1].timeTaken % 60}s`
                              }
                            </p>
                          )}
                          <div className="h-16 sm:h-20 w-16 sm:w-20 bg-linear-to-t from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-t-lg mt-2 flex items-center justify-center">
                            <Medal className="h-6 w-6 text-gray-500 dark:text-gray-300" />
                          </div>
                        </div>

                        {/* 1st Place */}
                        <div className="flex flex-col items-center -mt-4">
                          <div className="relative">
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl animate-bounce">👑</div>
                            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-linear-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white font-bold text-xl shadow-xl ring-4 ring-yellow-300 dark:ring-yellow-600">
                              {topScorers[0]?.user?.avatar ? (
                                <img src={topScorers[0].user.avatar} alt="" className="h-full w-full rounded-full object-cover" />
                              ) : (
                                topScorers[0]?.user?.fullname?.charAt(0)?.toUpperCase() || "1"
                              )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 h-7 w-7 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow">
                              1
                            </div>
                          </div>
                          <p className="mt-2 text-sm font-semibold truncate max-w-20 sm:max-w-24 text-center">
                            {topScorers[0]?.user?.fullname?.split(' ')[0] || "—"}
                          </p>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            <p className="text-sm font-bold text-yellow-600 dark:text-yellow-400">{Math.round(topScorers[0]?.percentage || 0)}%</p>
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          </div>
                          {topScorers[0]?.timeTaken != null && (
                            <p className="text-xs text-yellow-600/70 dark:text-yellow-400/70 flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" />
                              {topScorers[0].timeTaken < 60 
                                ? `${topScorers[0].timeTaken}s`
                                : `${Math.floor(topScorers[0].timeTaken / 60)}m ${topScorers[0].timeTaken % 60}s`
                              }
                            </p>
                          )}
                          <div className="h-20 sm:h-24 w-16 sm:w-24 bg-linear-to-t from-yellow-400 to-yellow-300 dark:from-yellow-600 dark:to-yellow-500 rounded-t-lg mt-2 flex items-center justify-center">
                            <Trophy className="h-8 w-8 text-yellow-600 dark:text-yellow-200" />
                          </div>
                        </div>

                        {/* 3rd Place */}
                        <div className="flex flex-col items-center">
                          <div className="relative">
                            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-linear-to-br from-orange-400 to-amber-600 flex items-center justify-center text-white font-bold text-lg shadow-lg ring-4 ring-orange-200 dark:ring-orange-700">
                              {topScorers[2]?.user?.avatar ? (
                                <img src={topScorers[2].user.avatar} alt="" className="h-full w-full rounded-full object-cover" />
                              ) : (
                                topScorers[2]?.user?.fullname?.charAt(0)?.toUpperCase() || "3"
                              )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow">
                              3
                            </div>
                          </div>
                          <p className="mt-2 text-xs sm:text-sm font-medium truncate max-w-16 sm:max-w-20 text-center">
                            {topScorers[2]?.user?.fullname?.split(' ')[0] || "—"}
                          </p>
                          <p className="text-xs text-muted-foreground">{Math.round(topScorers[2]?.percentage || 0)}%</p>
                          {topScorers[2]?.timeTaken != null && (
                            <p className="text-xs text-muted-foreground flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" />
                              {topScorers[2].timeTaken < 60 
                                ? `${topScorers[2].timeTaken}s`
                                : `${Math.floor(topScorers[2].timeTaken / 60)}m ${topScorers[2].timeTaken % 60}s`
                              }
                            </p>
                          )}
                          <div className="h-12 sm:h-16 w-16 sm:w-20 bg-linear-to-t from-orange-400 to-orange-300 dark:from-orange-700 dark:to-orange-600 rounded-t-lg mt-2 flex items-center justify-center">
                            <Medal className="h-5 w-5 text-orange-600 dark:text-orange-200" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rest of the list (4th onwards) */}
                  {topScorers.length > 3 && (
                    <div className="divide-y">
                      {topScorers.slice(3).map((entry, index) => (
                        <div 
                          key={entry._id || index + 3} 
                          className="flex items-center gap-4 p-4 transition-all hover:bg-muted/50 group"
                        >
                          {/* Rank */}
                          <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center font-semibold text-sm text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            {index + 4}
                          </div>

                          {/* User Info */}
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary overflow-hidden ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                              {entry.user?.avatar ? (
                                <img src={entry.user.avatar} alt="" className="h-full w-full object-cover" />
                              ) : (
                                entry.user?.fullname?.charAt(0)?.toUpperCase() || "?"
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">
                                {entry.user?.fullname || "Anonymous"}
                              </p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={cn(
                                  "text-xs h-5",
                                  entry.grade === "A+" && "border-green-500 text-green-600",
                                  entry.grade === "A" && "border-green-400 text-green-500",
                                  entry.grade === "B" && "border-blue-500 text-blue-600",
                                  entry.grade === "C" && "border-yellow-500 text-yellow-600",
                                  entry.grade === "D" && "border-orange-500 text-orange-600"
                                )}>
                                  {entry.grade}
                                </Badge>
                                {entry.timeTaken != null && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1" title="Time taken to complete (faster is better)">
                                    <Clock className="h-3 w-3" />
                                    <span>
                                      {entry.timeTaken < 60 
                                        ? `${entry.timeTaken}s`
                                        : `${Math.floor(entry.timeTaken / 60)}m ${entry.timeTaken % 60}s`
                                      }
                                    </span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Score */}
                          <div className="text-right">
                            <p className="text-lg font-bold text-foreground">
                              {Math.round(entry.percentage || 0)}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Show simpler list if less than 3 scorers */}
                  {topScorers.length < 3 && (
                    <div className="divide-y">
                      {topScorers.map((entry, index) => (
                        <div 
                          key={entry._id || index} 
                          className={cn(
                            "flex items-center gap-4 p-4 transition-colors hover:bg-muted/50",
                            index === 0 && "bg-yellow-50 dark:bg-yellow-950/30",
                            index === 1 && "bg-gray-50 dark:bg-gray-800/30"
                          )}
                        >
                          <div className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm text-white",
                            index === 0 && "bg-linear-to-br from-yellow-400 to-amber-500",
                            index === 1 && "bg-linear-to-br from-gray-300 to-gray-400"
                          )}>
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{entry.user?.fullname || "Anonymous"}</p>
                            {entry.grade && <Badge variant="outline" className="text-xs h-5">{entry.grade}</Badge>}
                          </div>
                          <p className="text-lg font-bold">{Math.round(entry.percentage || 0)}%</p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="p-12 text-center">
                  <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <Trophy className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                  <p className="font-medium text-muted-foreground">No top scorers yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Be the first to pass this quiz and claim the top spot!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
