import { useState } from "react";
import { Link } from "react-router-dom";
import { FileQuestion, CheckCircle2, TrendingUp } from "lucide-react";
import { Card, CardContent, Button, Spinner } from "@/components/ui";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader, FilterBar, StatsGrid, StatsCard, AttemptCard } from "@/components/shared";
import { useMyAttempts } from "@/hooks";

export default function AttemptsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data: attemptsData, isLoading, isFetching } = useMyAttempts({
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const attempts = attemptsData?.attempts || [];

  // Calculate stats
  const completedAttempts = attempts.filter(a => a.status === "completed");
  const passedAttempts = completedAttempts.filter(a => a.isPassed);
  const averageScore = completedAttempts.length > 0
    ? Math.round(completedAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / completedAttempts.length)
    : 0;
  const passRate = completedAttempts.length > 0 
    ? Math.round((passedAttempts.length / completedAttempts.length) * 100)
    : 0;

  const clearFilters = () => {
    setStatusFilter("");
  };

  // Only show full page loading on initial load
  const showFullLoading = isLoading && !attemptsData;

  if (showFullLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="My Attempts"
        description="View your quiz history and performance"
        actions={isFetching ? <Spinner size="sm" /> : null}
      />

      {/* Stats */}
      <StatsGrid>
        <StatsCard
          title="Total Attempts"
          value={completedAttempts.length}
          icon={FileQuestion}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <StatsCard
          title="Pass Rate"
          value={`${passRate}%`}
          icon={CheckCircle2}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <StatsCard
          title="Average Score"
          value={`${averageScore}%`}
          icon={TrendingUp}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />
      </StatsGrid>

      {/* Filters */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by quiz name..."
        filters={[
          {
            name: "status",
            placeholder: "Status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: "completed", label: "Completed" },
              { value: "in-progress", label: "In Progress" },
              { value: "abandoned", label: "Abandoned" },
            ],
            width: "sm:w-40",
          },
        ]}
        onClear={statusFilter ? clearFilters : null}
      />

      {/* Attempts List */}
      {attempts.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <EmptyState
              icon={FileQuestion}
              title="No attempts yet"
              description={
                search || statusFilter
                  ? "Try adjusting your filters"
                  : "Start taking quizzes to see your attempts here"
              }
              action={
                !search && !statusFilter && (
                  <Link to="/student/quizzes">
                    <Button>Browse Quizzes</Button>
                  </Link>
                )
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {attempts.map((attempt) => (
            <AttemptCard key={attempt._id} attempt={attempt} />
          ))}
        </div>
      )}
    </div>
  );
}
