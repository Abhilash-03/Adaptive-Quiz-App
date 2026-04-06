import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft,
  Edit,
  Trash2,
  Globe,
  Lock,
  Clock,
  FileQuestion,
  Users,
  Target,
  TrendingUp,
  Calendar,
  BarChart3
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { useQuiz, useQuizAnalytics, useDeleteQuiz, useToggleQuizPublish } from "@/hooks";
import { cn } from "@/lib/utils";
import { useState } from "react";

const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins ? `${hours}h ${mins}m` : `${hours} hours`;
};

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const difficultyColors = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  hard: "bg-red-100 text-red-700",
};

export default function TeacherQuizDetailPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [deleteDialog, setDeleteDialog] = useState(false);

  const { data: quiz, isLoading } = useQuiz(quizId);
  const { data: analytics } = useQuizAnalytics(quizId);
  const deleteQuiz = useDeleteQuiz();
  const togglePublish = useToggleQuizPublish();

  const handleDelete = async () => {
    await deleteQuiz.mutateAsync(quizId);
    navigate("/teacher/quizzes");
  };

  const handleTogglePublish = async () => {
    await togglePublish.mutateAsync(quizId);
  };

  if (isLoading) {
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

  const stats = analytics?.stats || {};
  const recentAttempts = analytics?.recentAttempts || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4 flex-1">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{quiz.category}</Badge>
              <Badge variant={quiz.isPublished ? "default" : "secondary"}>
                {quiz.isPublished ? (
                  <>
                    <Globe className="mr-1 h-3 w-3" />
                    Published
                  </>
                ) : (
                  <>
                    <Lock className="mr-1 h-3 w-3" />
                    Draft
                  </>
                )}
              </Badge>
              {quiz.isAdaptive && (
                <Badge variant="secondary">Adaptive</Badge>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold mt-1 truncate">{quiz.title}</h1>
            {quiz.description && (
              <p className="text-muted-foreground mt-1 line-clamp-2">{quiz.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 ml-12 sm:ml-0">
          <Button variant="outline" size="icon" className="sm:w-auto sm:h-auto sm:px-4 sm:py-2" onClick={handleTogglePublish}>
            {quiz.isPublished ? (
              <>
                <Lock className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Unpublish</span>
              </>
            ) : (
              <>
                <Globe className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Publish</span>
              </>
            )}
          </Button>
          <Link to={`/teacher/quiz/${quizId}/edit`}>
            <Button variant="outline" size="icon" className="sm:w-auto sm:h-auto sm:px-4 sm:py-2">
              <Edit className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
          </Link>
          <Button variant="destructive" size="icon" className="sm:w-auto sm:h-auto sm:px-4 sm:py-2" onClick={() => setDeleteDialog(true)}>
            <Trash2 className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Attempts</p>
                <p className="text-2xl font-bold">{stats.totalAttempts || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold">
                  {stats.averageScore ? `${Math.round(stats.averageScore)}%` : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pass Rate</p>
                <p className="text-2xl font-bold">
                  {stats.passRate ? `${Math.round(stats.passRate)}%` : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">
                  {stats.completionRate ? `${Math.round(stats.completionRate)}%` : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quiz Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quiz Info */}
          <Card>
            <CardHeader>
              <CardTitle>Quiz Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <FileQuestion className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Questions</p>
                    <p className="font-medium">{quiz.totalQuestions}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">{formatDuration(quiz.duration)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Passing Score</p>
                    <p className="font-medium">{quiz.passingMarks}/{quiz.totalMarks} marks</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Max Attempts</p>
                    <p className="font-medium">{quiz.allowedAttempts}</p>
                  </div>
                </div>
              </div>

              {/* Schedule */}
              {(quiz.startDate || quiz.endDate) && (
                <div className="mt-6 pt-4 border-t">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Schedule
                  </h4>
                  <div className="grid gap-2 sm:grid-cols-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Start: </span>
                      {formatDate(quiz.startDate)}
                    </div>
                    <div>
                      <span className="text-muted-foreground">End: </span>
                      {formatDate(quiz.endDate)}
                    </div>
                  </div>
                </div>
              )}

              {/* Settings */}
              <div className="mt-6 pt-4 border-t flex flex-wrap gap-2">
                {quiz.isAdaptive && (
                  <Badge variant="secondary">Adaptive Difficulty</Badge>
                )}
                {quiz.shuffleQuestions && (
                  <Badge variant="outline">Shuffled Questions</Badge>
                )}
                {quiz.showResultsImmediately && (
                  <Badge variant="outline">Immediate Results</Badge>
                )}
                <Badge className={cn(difficultyColors[quiz.initialDifficulty])}>
                  Starts at {quiz.initialDifficulty}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Recent Attempts */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Attempts</CardTitle>
              <CardDescription>
                Latest student attempts on this quiz
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentAttempts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No attempts yet
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentAttempts.map((attempt) => (
                      <TableRow key={attempt._id}>
                        <TableCell>
                          <div className="font-medium">
                            {attempt.user?.fullname || "Unknown"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {attempt.user?.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDate(attempt.startTime || attempt.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {Math.round((attempt.score / quiz.totalMarks) * 100)}%
                            </span>
                            <Progress 
                              value={(attempt.score / quiz.totalMarks) * 100}
                              className="w-16 h-1.5"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={attempt.score >= quiz.passingMarks ? "success" : "destructive"}>
                            {attempt.score >= quiz.passingMarks ? "Passed" : "Failed"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Questions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Questions ({quiz.questions?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {quiz.questions?.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No questions added
                </p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {quiz.questions?.map((question, idx) => (
                    <div
                      key={question._id || idx}
                      className="p-3 bg-muted/50 rounded-lg"
                    >
                      <p className="text-sm font-medium line-clamp-2">
                        {idx + 1}. {question.questionText || "Question"}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          className={cn("text-xs", difficultyColors[question.difficultyLevel])}
                        >
                          {question.difficultyLevel}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {question.points || 1} pts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Quiz</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{quiz.title}"? This will also remove all associated attempts.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteQuiz.isPending}
            >
              {deleteQuiz.isPending ? "Deleting..." : "Delete Quiz"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
