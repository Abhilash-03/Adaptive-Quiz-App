import { useState } from "react";
import { BookOpen } from "lucide-react";
import { Card, CardContent, Spinner } from "@/components/ui";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader, FilterBar, StudentQuizCard } from "@/components/shared";
import { useAvailableQuizzes } from "@/hooks";

export default function StudentQuizzesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const { data: quizzesData, isLoading, isFetching } = useAvailableQuizzes({
    search: search || undefined,
    category: category || undefined,
  });

  const quizzes = quizzesData?.quizzes || [];
  const categories = [...new Set(quizzes.map(q => q.category).filter(Boolean))];

  const clearFilters = () => {
    setCategory("");
  };

  // Only show full page loading on initial load
  const showFullLoading = isLoading && !quizzesData;

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
        title="Available Quizzes"
        description="Browse and take quizzes to test your knowledge"
        actions={isFetching ? <Spinner size="sm" /> : null}
      />

      {/* Filters */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search quizzes..."
        filters={[
          {
            name: "category",
            placeholder: "All Categories",
            value: category,
            onChange: setCategory,
            options: categories.map((cat) => ({ value: cat, label: cat })),
            width: "sm:w-48",
          },
        ]}
        onClear={category ? clearFilters : null}
      />

      {/* Quizzes Grid */}
      {quizzes.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <EmptyState
              icon={BookOpen}
              title="No quizzes available"
              description={
                search || category
                  ? "Try adjusting your search or filters"
                  : "Check back later for new quizzes"
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <StudentQuizCard key={quiz._id} quiz={quiz} />
          ))}
        </div>
      )}
    </div>
  );
}
