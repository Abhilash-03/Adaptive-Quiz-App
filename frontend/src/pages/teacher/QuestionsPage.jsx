import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2,
  Eye,
  FileQuestion
} from "lucide-react";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader, FilterBar, DifficultyBadge, QuestionTypeBadge, DeleteDialog } from "@/components/shared";
import { useQuestions, useDeleteQuestion, useQuestionCategories } from "@/hooks";

export default function QuestionsPage() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    difficulty: "",
    type: "",
  });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, question: null });

  const { data: questionsData, isLoading, isFetching } = useQuestions({
    search: search || undefined,
    category: filters.category || undefined,
    difficultyLevel: filters.difficulty || undefined,
    questionType: filters.type || undefined,
  });

  const { data: categories } = useQuestionCategories();
  const deleteQuestion = useDeleteQuestion();

  const questions = questionsData?.questions || [];

  const clearFilters = () => {
    setFilters({ category: "", difficulty: "", type: "" });
  };

  const handleDelete = async () => {
    if (deleteDialog.question) {
      await deleteQuestion.mutateAsync(deleteDialog.question._id);
      setDeleteDialog({ open: false, question: null });
    }
  };

  // Only show full page loading on initial load (no data yet)
  const showFullLoading = isLoading && !questionsData;

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
        title="Questions"
        description="Manage your question bank for quizzes"
        actions={
          <div className="flex items-center gap-2">
            {isFetching && <Spinner size="sm" />}
            <Link to="/teacher/questions/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Question
              </Button>
            </Link>
          </div>
        }
      />

      {/* Filters */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search questions..."
        filters={[
          {
            name: "category",
            placeholder: "Category",
            value: filters.category,
            onChange: (value) => setFilters((f) => ({ ...f, category: value })),
            options: (categories || []).map((cat) => ({ value: cat, label: cat })),
          },
          {
            name: "difficulty",
            placeholder: "Difficulty",
            value: filters.difficulty,
            onChange: (value) => setFilters((f) => ({ ...f, difficulty: value })),
            options: [
              { value: "easy", label: "Easy" },
              { value: "medium", label: "Medium" },
              { value: "hard", label: "Hard" },
            ],
            width: "sm:w-36",
          },
          {
            name: "type",
            placeholder: "Type",
            value: filters.type,
            onChange: (value) => setFilters((f) => ({ ...f, type: value })),
            options: [
              { value: "mcq", label: "Multiple Choice" },
              { value: "true-false", label: "True/False" },
              { value: "short-answer", label: "Short Answer" },
            ],
          },
        ]}
        onClear={clearFilters}
      />

      {/* Questions Table */}
      <Card>
        <CardContent className="p-0">
          {questions.length === 0 ? (
            <EmptyState
              icon={FileQuestion}
              title="No questions found"
              description={
                search || filters.category || filters.difficulty || filters.type
                  ? "Try adjusting your search or filters"
                  : "Create your first question to get started"
              }
              action={
                !search && !filters.category && !filters.difficulty && !filters.type ? (
                  <Link to="/teacher/questions/new">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Question
                    </Button>
                  </Link>
                ) : null
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Question</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((question) => (
                  <TableRow key={question._id}>
                    <TableCell>
                      <div className="font-medium line-clamp-2">
                        {question.questionText}
                      </div>
                      {question.topic && (
                        <div className="text-sm text-muted-foreground">
                          {question.topic}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{question.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <QuestionTypeBadge type={question.questionType} />
                    </TableCell>
                    <TableCell>
                      <DifficultyBadge level={question.difficultyLevel} />
                    </TableCell>
                    <TableCell>{question.points}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/teacher/question/${question._id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/teacher/question/${question._id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteDialog({ open: true, question })}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, question: null })}
        itemType="Question"
        itemName={deleteDialog.question?.questionText}
        onDelete={handleDelete}
        isLoading={deleteQuestion.isPending}
      >
        <p className="text-sm text-muted-foreground line-clamp-3">
          "{deleteDialog.question?.questionText}"
        </p>
      </DeleteDialog>
    </div>
  );
}
