import { Link } from "react-router-dom";
import { 
  BookOpen, 
  FileQuestion, 
  Users, 
  TrendingUp, 
  ChevronRight,
  Plus,
  Eye
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Spinner } from "@/components/ui";
import { PageHeader, StatsCard, StatsGrid } from "@/components/shared";
import { useTeacherDashboard } from "@/hooks";
import { useAuthStore } from "@/store/authStore";
import { formatDate } from "@/lib/utils";

export default function TeacherDashboard() {
  const user = useAuthStore((state) => state.user);
  const { data: dashboard, isLoading } = useTeacherDashboard();

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <PageHeader
        title={`Welcome back, ${user?.fullname?.split(" ")[0]}! 👋`}
        description="Here's what's happening with your quizzes"
        actions={
          <>
            <Link to="/teacher/questions/new">
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </Link>
            <Link to="/teacher/quizzes/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Quiz
              </Button>
            </Link>
          </>
        }
      />

      {/* Stats Grid */}
      <StatsGrid columns={4}>
        <StatsCard
          title="Total Quizzes"
          value={dashboard?.totalQuizzes || 0}
          icon={BookOpen}
          iconColor="text-primary"
          iconBgColor="bg-primary/10"
          link="/teacher/quizzes"
        />
        <StatsCard
          title="Total Questions"
          value={dashboard?.totalQuestions || 0}
          icon={FileQuestion}
          iconColor="text-blue-500"
          iconBgColor="bg-blue-100"
          link="/teacher/questions"
        />
        <StatsCard
          title="Total Students"
          value={dashboard?.totalStudents || 0}
          icon={Users}
          iconColor="text-green-500"
          iconBgColor="bg-green-100"
          link="/teacher/students"
        />
        <StatsCard
          title="Total Attempts"
          value={dashboard?.totalAttempts || 0}
          icon={TrendingUp}
          iconColor="text-yellow-500"
          iconBgColor="bg-yellow-100"
        />
      </StatsGrid>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Quizzes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Quizzes</CardTitle>
            <Link to="/teacher/quizzes" className="text-sm text-primary hover:underline flex items-center">
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {!dashboard?.recentQuizzes?.length ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No quizzes created yet</p>
                <Link to="/teacher/quizzes/new">
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Create your first quiz
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboard.recentQuizzes.slice(0, 5).map((quiz) => (
                  <div
                    key={quiz._id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{quiz.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{quiz.category}</span>
                        <span>•</span>
                        <span>{quiz.totalQuestions} questions</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={quiz.isPublished ? "success" : "secondary"}>
                        {quiz.isPublished ? "Published" : "Draft"}
                      </Badge>
                      <Link to={`/teacher/quiz/${quiz._id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Attempts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Student Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            {!dashboard?.recentAttempts?.length ? (
              <p className="text-center text-muted-foreground py-8">
                No attempts yet
              </p>
            ) : (
              <div className="space-y-3">
                {dashboard.recentAttempts.slice(0, 5).map((attempt) => (
                  <div
                    key={attempt._id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <h4 className="font-medium">{attempt.user?.fullname || "Student"}</h4>
                      <p className="text-sm text-muted-foreground">
                        {attempt.quiz?.title || "Quiz"} • {formatDate(attempt.completedAt || attempt.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{Math.round(attempt.percentage || 0)}%</p>
                      <Badge variant={attempt.isPassed ? "success" : "destructive"} className="text-xs">
                        {attempt.isPassed ? "Passed" : "Failed"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution */}
      {dashboard?.categoryStats?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Questions by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {dashboard.categoryStats.map((cat) => (
                <div key={cat._id} className="p-4 rounded-lg border">
                  <h4 className="font-medium">{cat._id}</h4>
                  <p className="text-2xl font-bold text-primary">{cat.count}</p>
                  <p className="text-sm text-muted-foreground">questions</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
