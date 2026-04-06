import { useState } from "react";
import { Search, Plus, FileQuestion, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
} from "@/components/ui";
import { QuestionBrowserItem } from "./QuestionBrowserItem";
import { useQuestions, useQuestionCategories } from "@/hooks";

export function QuestionBrowser({
  selectedQuestions = [],
  onAddQuestion,
  onRemoveQuestion,
  onCreateNew,
  className,
}) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ category: "", difficulty: "" });
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: categories } = useQuestionCategories();
  const { data: questionsData, isLoading, isFetching } = useQuestions({
    search: search || undefined,
    category: filters.category || undefined,
    difficultyLevel: filters.difficulty || undefined,
    page,
    limit,
  });

  const questions = questionsData?.questions || [];
  const totalPages = questionsData?.pagination?.totalPages || 1;
  const total = questionsData?.pagination?.totalQuestions || 0;

  const isSelected = (id) => selectedQuestions.some((q) => q._id === id);

  const handleToggle = (question) => {
    if (isSelected(question._id)) {
      onRemoveQuestion(question._id);
    } else {
      onAddQuestion(question);
    }
  };

  // Reset to page 1 when filters change
  const handleFilterChange = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Question Bank</h3>
        {onCreateNew && (
          <Button size="sm" variant="outline" onClick={onCreateNew}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            New
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-2">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search questions..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-8 h-8 text-sm"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <Select
          value={filters.category || "__all__"}
          onValueChange={(v) => handleFilterChange("category", v === "__all__" ? "" : v)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Categories</SelectItem>
            {categories?.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.difficulty || "__all__"}
          onValueChange={(v) => handleFilterChange("difficulty", v === "__all__" ? "" : v)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Levels</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results info */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
        <span>{total} question{total !== 1 ? "s" : ""}</span>
        {isFetching && <Spinner size="sm" />}
      </div>

      {/* Questions list */}
      <div className="space-y-2 min-h-[200px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileQuestion className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm font-medium">No questions found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {search || filters.category || filters.difficulty
                ? "Try adjusting filters"
                : "Create your first question"}
            </p>
          </div>
        ) : (
          questions.map((question) => (
            <QuestionBrowserItem
              key={question._id}
              question={question}
              selected={isSelected(question._id)}
              onToggle={() => handleToggle(question)}
              compact
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="h-7 text-xs"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="h-7 text-xs"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
