import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, BookOpen } from "lucide-react";
import { Card, CardContent, Button, Spinner } from "@/components/ui";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader, FilterBar, TeacherQuizCard, DeleteDialog } from "@/components/shared";
import { useQuizzes, useDeleteQuiz, useToggleQuizPublish } from "@/hooks";

export default function QuizzesPage() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    status: "",
  });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, quiz: null });

  const { data: quizzesData, isLoading, isFetching } = useQuizzes({
    search: search || undefined,
    category: filters.category || undefined,
    isPublished: filters.status === "published" ? true : filters.status === "draft" ? false : undefined,
  });

  const deleteQuiz = useDeleteQuiz();
  const togglePublish = useToggleQuizPublish();

  const quizzes = quizzesData?.quizzes || [];
  const categories = [...new Set(quizzes.map(q => q.category).filter(Boolean))];

  const clearFilters = () => {
    setFilters({ category: "", status: "" });
  };

  const handleDelete = async () => {
    if (deleteDialog.quiz) {
      await deleteQuiz.mutateAsync(deleteDialog.quiz._id);
      setDeleteDialog({ open: false, quiz: null });
    }
  };

  const handleTogglePublish = async (quizId) => {
    await togglePublish.mutateAsync(quizId);
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
        title="Quizzes"
        description="Create and manage your quizzes"
        actions={
          <div className="flex items-center gap-2">
            {isFetching && <Spinner size="sm" />}
            <Link to="/teacher/quizzes/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Quiz
              </Button>
            </Link>
          </div>
        }
      />

      {/* Filters */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search quizzes..."
        filters={[
          {
            name: "category",
            placeholder: "Category",
            value: filters.category,
            onChange: (value) => setFilters((f) => ({ ...f, category: value })),
            options: categories.map((cat) => ({ value: cat, label: cat })),
          },
          {
            name: "status",
            placeholder: "Status",
            value: filters.status,
            onChange: (value) => setFilters((f) => ({ ...f, status: value })),
            options: [
              { value: "published", label: "Published" },
              { value: "draft", label: "Draft" },
            ],
            width: "sm:w-36",
          },
        ]}
        onClear={clearFilters}
      />

      {/* Quizzes Grid */}
      {quizzes.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <EmptyState
              icon={BookOpen}
              title="No quizzes found"
              description={
                search || filters.category || filters.status
                  ? "Try adjusting your search or filters"
                  : "Create your first quiz to get started"
              }
              action={
                !search && !filters.category && !filters.status && (
                  <Link to="/teacher/quizzes/new">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Quiz
                    </Button>
                  </Link>
                )
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <TeacherQuizCard
              key={quiz._id}
              quiz={quiz}
              onTogglePublish={handleTogglePublish}
              onDelete={(quiz) => setDeleteDialog({ open: true, quiz })}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, quiz: null })}
        itemType="Quiz"
        itemName={deleteDialog.quiz?.title}
        onDelete={handleDelete}
        isLoading={deleteQuiz.isPending}
      >
        <p className="text-sm text-muted-foreground">
          {deleteDialog.quiz?.totalQuestions || 0} questions • {deleteDialog.quiz?.attemptCount || 0} attempts
        </p>
      </DeleteDialog>
    </div>
  );
}
