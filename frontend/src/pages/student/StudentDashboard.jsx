import { Link } from "react-router-dom";
import { 
  BookOpen, 
  Trophy, 
  Target, 
  TrendingUp, 
  Clock, 
  ChevronRight,
  Play
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Spinner } from "@/components/ui";
import { PageHeader, StatsCard, StatsGrid } from "@/components/shared";
import { useStudentDashboard, useAvailableQuizzes } from "@/hooks";
import { useAuthStore } from "@/store/authStore";
import { formatDate, getGradeColor } from "@/lib/utils";

export default function StudentDashboard() {
  const user = useAuthStore((state) => state.user);
  const { data: dashboard, isLoading } = useStudentDashboard();
  const { data: quizzesData } = useAvailableQuizzes({ limit: 5 });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const availableQuizzes = quizzesData?.quizzes || [];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <PageHeader
        title={`Welcome back, ${user?.fullname?.split(" ")[0]}! 👋`}
        description="Ready to test your knowledge today?"
        actions={
          <Link to="/student/quizzes">
            <Button>
              <Play className="mr-2 h-4 w-4" />
              Take a Quiz
            </Button>
          </Link>
        }
      />

      {/* Stats Grid */}
      <StatsGrid columns={4}>
        <StatsCard
          title="Skill Level"
          value={dashboard?.user?.skillLevel || 50}
          suffix="/100"
          icon={Target}
          iconColor="text-primary"
        />
        <StatsCard
          title="Quizzes Taken"
          value={dashboard?.stats?.totalQuizzesTaken || 0}
          icon={BookOpen}
          iconColor="text-blue-500"
          iconBgColor="bg-blue-100"
        />
        <StatsCard
          title="Average Score"
          value={`${Math.round(dashboard?.stats?.averageScore || 0)}%`}
          icon={TrendingUp}
          iconColor="text-green-500"
          iconBgColor="bg-green-100"
        />
        <StatsCard
          title="Best Score"
          value={`${Math.round(dashboard?.stats?.bestScore || 0)}%`}
          icon={Trophy}
          iconColor="text-yellow-500"
          iconBgColor="bg-yellow-100"
        />
      </StatsGrid>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Available Quizzes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Available Quizzes</CardTitle>
            <Link to="/student/quizzes" className="text-sm text-primary hover:underline flex items-center">
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {availableQuizzes.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No quizzes available at the moment
              </p>
            ) : (
              <div className="space-y-3">
                {availableQuizzes.map((quiz) => (
                  <Link
                    key={quiz._id}
                    to={`/student/quiz/${quiz._id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{quiz.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{quiz.category}</span>
                        <span>•</span>
                        <span>{quiz.totalQuestions} questions</span>
                        <span>•</span>
                        <Clock className="h-3 w-3" />
                        <span>{quiz.duration} min</span>
                      </div>
                    </div>
                    <Badge variant={quiz.isAdaptive ? "default" : "secondary"}>
                      {quiz.isAdaptive ? "Adaptive" : "Standard"}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Attempts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Attempts</CardTitle>
            <Link to="/student/attempts" className="text-sm text-primary hover:underline flex items-center">
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {!dashboard?.recentAttempts?.length ? (
              <p className="text-center text-muted-foreground py-8">
                You haven't taken any quizzes yet
              </p>
            ) : (
              <div className="space-y-3">
                {dashboard.recentAttempts.slice(0, 5).map((attempt) => (
                  <Link
                    key={attempt._id}
                    to={`/student/attempt/${attempt._id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div>
                      <h4 className="font-medium">{attempt.quiz?.title || "Quiz"}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(attempt.completedAt || attempt.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${getGradeColor(attempt.percentage || 0)}`}>
                        {Math.round(attempt.percentage || 0)}%
                      </p>
                      <Badge variant={attempt.isPassed ? "success" : "destructive"} className="text-xs">
                        {attempt.isPassed ? "Passed" : "Failed"}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Skill Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Overall Skill Level</span>
                <span className="font-medium">{dashboard?.user?.skillLevel || 50}/100</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all"
                  style={{ width: `${dashboard?.user?.skillLevel || 50}%` }}
                />
              </div>
            </div>
            
            {dashboard?.categoryPerformance?.length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">Performance by Category</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {dashboard.categoryPerformance.slice(0, 4).map((cat) => (
                    <div key={cat._id} className="flex items-center justify-between">
                      <span className="text-sm">{cat._id}</span>
                      <span className={`text-sm font-medium ${getGradeColor(cat.avgScore || 0)}`}>
                        {Math.round(cat.avgScore || 0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
