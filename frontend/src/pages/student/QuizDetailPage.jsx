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
  XCircle
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
  const topScorers = leaderboard?.leaderboard?.slice(0, 5) || [];

  const canAttempt = quiz && attempts.filter(a => a.status === "completed" || a.status === "abandoned").length < quiz.allowedAttempts;
  const hasInProgress = attempts.some(a => a.status === "in-progress");
  const bestAttempt = attempts.reduce((best, current) => 
    (current.score > (best?.score || 0) ? current : best), null);

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
                  {attempts.filter(a => a.status === "completed").length} of {quiz.allowedAttempts} attempts used
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
                              ? attempt.score >= quiz.passingMarks 
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                              : "bg-yellow-100 text-yellow-600"
                          )}>
                            {attempt.status === "completed" ? (
                              attempt.score >= quiz.passingMarks ? (
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
                                {Math.round((attempt.score / quiz.totalMarks) * 100)}%
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {attempt.score}/{quiz.totalMarks}
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
                    {Math.round((bestAttempt.score / quiz.totalMarks) * 100)}%
                  </p>
                  <Progress 
                    value={(bestAttempt.score / quiz.totalMarks) * 100} 
                    className="mt-2 h-2"
                  />
                  <p className={cn(
                    "text-sm mt-2",
                    bestAttempt.score >= quiz.passingMarks ? "text-green-600" : "text-red-600"
                  )}>
                    {bestAttempt.score >= quiz.passingMarks ? "Passed" : "Not Passed"}
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
                  {quiz.allowedAttempts - attempts.filter(a => a.status !== "in-progress").length} attempts remaining
                </p>
              )}
            </CardContent>
          </Card>

          {/* Leaderboard */}
          {topScorers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Top Scorers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topScorers.map((entry, index) => (
                    <div key={entry._id || index} className="flex items-center gap-3">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold",
                        index === 0 ? "bg-yellow-100 text-yellow-700" :
                        index === 1 ? "bg-gray-100 text-gray-700" :
                        index === 2 ? "bg-orange-100 text-orange-700" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {entry.user?.fullname || "Anonymous"}
                        </p>
                      </div>
                      <div className="text-sm font-bold">
                        {Math.round((entry.score / quiz.totalMarks) * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
