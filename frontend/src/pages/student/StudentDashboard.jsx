import { Link } from "react-router-dom";
import { 
  BookOpen, 
  Trophy, 
  Target, 
  TrendingUp, 
  Clock, 
  ChevronRight,
  Play,
  Award,
  BarChart3
} from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Badge, 
  Button, 
  Spinner,
  ChartContainer,
  ChartTooltip,
  CHART_COLORS,
  CATEGORY_COLORS,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "@/components/ui";
import { Tooltip } from "recharts";
import { PageHeader, StatsCard, StatsGrid, BadgeShowcase, BadgeStats } from "@/components/shared";
import { useStudentDashboard, useAvailableQuizzes, useMyBadges } from "@/hooks";
import { useAuthStore } from "@/store/authStore";
import { formatDate, getGradeColor } from "@/lib/utils";

export default function StudentDashboard() {
  const user = useAuthStore((state) => state.user);
  const { data: dashboard, isLoading } = useStudentDashboard();
  const { data: quizzesData } = useAvailableQuizzes({ limit: 5 });
  const { data: badgesData } = useMyBadges();

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const availableQuizzes = quizzesData?.quizzes || [];
  const earnedBadges = badgesData?.earned || [];
  const availableBadges = badgesData?.available || [];
  const badgeStats = badgesData?.stats || { total: 0 };

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
          title="Badges Earned"
          value={badgeStats.total}
          icon={Award}
          iconColor="text-yellow-500"
          iconBgColor="bg-yellow-100"
        />
      </StatsGrid>

      {/* Achievement Badges */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Achievement Badges
          </CardTitle>
          <BadgeStats stats={badgeStats} />
        </CardHeader>
        <CardContent>
          <BadgeShowcase 
            earned={earnedBadges} 
            available={availableBadges} 
            maxDisplay={10} 
          />
          {earnedBadges.length === 0 && (
            <p className="text-center text-muted-foreground mt-4">
              Complete quizzes to earn achievement badges!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Overall Skill Level */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Overall Skill Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Your skill level based on quiz performance</span>
                <span className="font-bold text-lg">{dashboard?.user?.skillLevel || 50}/100</span>
              </div>
              <div className="h-4 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full bg-linear-to-r from-primary to-violet-500 transition-all duration-500"
                  style={{ width: `${dashboard?.user?.skillLevel || 50}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Beginner</span>
                <span>Intermediate</span>
                <span>Expert</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Score Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Score Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-6">
            {dashboard?.skillProgression?.length > 1 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={dashboard.skillProgression.map((item, idx) => ({
                      attempt: `#${idx + 1}`,
                      score: Math.round(item.score || 0),
                      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    }))}
                    margin={{ top: 10, right: 10, left: 5, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#6b7280" strokeOpacity={0.2} />
                    <XAxis 
                      dataKey="attempt" 
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}%`}
                      width={45}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-md">
                            <p className="font-medium">{payload[0]?.payload?.date}</p>
                            <p className="text-sm text-muted-foreground">
                              Score: <span className="font-medium text-primary">{payload[0]?.value}%</span>
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke={CHART_COLORS.primary}
                      strokeWidth={2}
                      fill="url(#scoreGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>Complete more quizzes to see your progress</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Performance Chart - Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Performance by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard?.categoryPerformance?.length > 0 ? (
              <div className="flex flex-col items-center gap-4 overflow-hidden">
                <ChartContainer className="h-48 w-full max-w-[250px]">
                  <PieChart>
                    <Pie
                      data={dashboard.categoryPerformance.slice(0, 6).map((cat, idx) => ({
                        name: cat._id,
                        value: cat.attempts,
                        score: Math.round(cat.avgScore || 0),
                        fill: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {dashboard.categoryPerformance.slice(0, 6).map((_, idx) => (
                        <Cell key={`cell-${idx}`} fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const data = payload[0]?.payload;
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-md">
                            <p className="font-medium">{data?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Avg Score: <span className="font-medium text-primary">{data?.score}%</span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Attempts: <span className="font-medium">{data?.value}</span>
                            </p>
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ChartContainer>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm w-full">
                  {dashboard.categoryPerformance.slice(0, 6).map((cat, idx) => (
                    <div key={cat._id} className="flex items-center gap-2 min-w-0">
                      <div 
                        className="w-3 h-3 rounded-full shrink-0" 
                        style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                      />
                      <span className="text-muted-foreground truncate flex-1">
                        {cat._id}
                      </span>
                      <span className="font-medium shrink-0">{Math.round(cat.avgScore || 0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Target className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>No category data yet</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium truncate">{quiz.title}</h4>
                        <Badge variant={quiz.isAdaptive ? "default" : "secondary"} className="sm:hidden shrink-0">
                          {quiz.isAdaptive ? "Adaptive" : "Standard"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground mt-1">
                        <span>{quiz.category}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{quiz.totalQuestions} questions</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {quiz.duration} min
                        </span>
                      </div>
                    </div>
                    <Badge variant={quiz.isAdaptive ? "default" : "secondary"} className="hidden sm:inline-flex shrink-0">
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
                    className="flex items-center justify-between gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{attempt.quiz?.title || "Quiz"}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(attempt.completedAt || attempt.createdAt)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
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
    </div>
  );
}
