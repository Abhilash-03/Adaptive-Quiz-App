import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Trash2, FileQuestion, ChevronRight, X } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
  Label,
  Textarea,
  Spinner,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
  Badge,
} from "@/components/ui";
import { QuestionBrowser, QuickQuestionForm, DifficultyBadge } from "@/components/shared";
import { useQuiz, useCreateQuiz, useUpdateQuiz, useQuestionCategories } from "@/hooks";
import { cn } from "@/lib/utils";

// Wrapper component that handles data fetching
export default function QuizFormPage() {
  const { quizId } = useParams();
  const isEditing = !!quizId;

  const { data: existingQuiz, isLoading: isLoadingQuiz } = useQuiz(quizId);

  if (isEditing && isLoadingQuiz) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return <QuizFormContent key={quizId || "new"} existingQuiz={existingQuiz} quizId={quizId} />;
}

// Form content component
function QuizFormContent({ existingQuiz, quizId }) {
  const navigate = useNavigate();
  const isEditing = !!quizId;

  const { data: categories } = useQuestionCategories();
  const createQuiz = useCreateQuiz();
  const updateQuiz = useUpdateQuiz();

  const [formData, setFormData] = useState({
    title: existingQuiz?.title || "",
    description: existingQuiz?.description || "",
    category: existingQuiz?.category || "",
    duration: existingQuiz?.duration || 30,
    passingMarks: existingQuiz?.passingMarks || 40,
    isAdaptive: existingQuiz?.isAdaptive ?? true,
    initialDifficulty: existingQuiz?.initialDifficulty || "medium",
    allowedAttempts: existingQuiz?.allowedAttempts || 1,
    shuffleQuestions: existingQuiz?.shuffleQuestions ?? true,
    showResultsImmediately: existingQuiz?.showResultsImmediately ?? true,
    startDate: existingQuiz?.startDate
      ? new Date(existingQuiz.startDate).toISOString().slice(0, 16)
      : "",
    endDate: existingQuiz?.endDate
      ? new Date(existingQuiz.endDate).toISOString().slice(0, 16)
      : "",
  });

  const [selectedQuestions, setSelectedQuestions] = useState(existingQuiz?.questions || []);
  const [showQuestionPanel, setShowQuestionPanel] = useState(true);
  const [showQuickForm, setShowQuickForm] = useState(false);
  const [errors, setErrors] = useState({});

  const totalMarks = selectedQuestions.reduce((sum, q) => sum + (q.points || 1), 0);
  const totalQuestions = selectedQuestions.length;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const addQuestion = (question) => {
    if (!selectedQuestions.find((q) => q._id === question._id)) {
      setSelectedQuestions((prev) => [...prev, question]);
      if (errors.questions) {
        setErrors((prev) => ({ ...prev, questions: null }));
      }
    }
  };

  const removeQuestion = (questionId) => {
    setSelectedQuestions((prev) => prev.filter((q) => q._id !== questionId));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.duration || formData.duration < 1) newErrors.duration = "Duration must be at least 1 minute";
    if (selectedQuestions.length === 0) newErrors.questions = "Add at least one question";
    if (formData.passingMarks > totalMarks) newErrors.passingMarks = "Passing marks cannot exceed total marks";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const submitData = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      category: formData.category,
      questions: selectedQuestions.map((q) => q._id),
      totalQuestions,
      totalMarks,
      duration: parseInt(formData.duration),
      passingMarks: parseInt(formData.passingMarks),
      isAdaptive: formData.isAdaptive,
      initialDifficulty: formData.initialDifficulty,
      allowedAttempts: parseInt(formData.allowedAttempts),
      shuffleQuestions: formData.shuffleQuestions,
      showResultsImmediately: formData.showResultsImmediately,
    };

    if (formData.startDate) submitData.startDate = new Date(formData.startDate);
    if (formData.endDate) submitData.endDate = new Date(formData.endDate);

    try {
      if (isEditing) {
        await updateQuiz.mutateAsync({ id: quizId, data: submitData });
      } else {
        await createQuiz.mutateAsync(submitData);
      }
      navigate("/teacher/quizzes");
    } catch {
      // Error handled by mutation
    }
  };

  const isPending = createQuiz.isPending || updateQuiz.isPending;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{isEditing ? "Edit Quiz" : "Create Quiz"}</h1>
            <p className="text-sm text-muted-foreground hidden sm:block">
              {isEditing ? "Update quiz details" : "Create a new quiz"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Mobile toggle for question panel */}
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setShowQuestionPanel(!showQuestionPanel)}
          >
            Questions
            <Badge variant="secondary" className="ml-2">{totalQuestions}</Badge>
          </Button>
          <Button onClick={handleSubmit} disabled={isPending} size="sm">
            {isPending ? <Spinner size="sm" className="mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {isEditing ? "Save" : "Create"}
          </Button>
        </div>
      </div>

      {/* Main content with two columns */}
      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
        {/* Left: Quiz Form */}
        <div className="flex-1 overflow-y-auto pr-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quiz Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-sm">Title *</Label>
                  <Input
                    placeholder="e.g., JavaScript Fundamentals Quiz"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    className={errors.title ? "border-destructive" : ""}
                  />
                  {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm">Description</Label>
                  <Textarea
                    placeholder="Describe what this quiz covers..."
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Category *</Label>
                    <Select value={formData.category} onValueChange={(v) => handleChange("category", v)}>
                      <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm">Duration (min) *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.duration}
                      onChange={(e) => handleChange("duration", e.target.value)}
                      className={errors.duration ? "border-destructive" : ""}
                    />
                    {errors.duration && <p className="text-xs text-destructive">{errors.duration}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selected Questions */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Selected Questions</CardTitle>
                    <CardDescription className="text-xs">
                      {totalQuestions} questions • {totalMarks} marks
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {errors.questions && (
                  <p className="text-xs text-destructive mb-3">{errors.questions}</p>
                )}

                {selectedQuestions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed rounded-lg bg-muted/30">
                    <FileQuestion className="h-8 w-8 text-muted-foreground/50 mb-2" />
                    <p className="text-sm font-medium">No questions added</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Select questions from the panel on the right
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {selectedQuestions.map((question, index) => (
                      <div
                        key={question._id}
                        className="flex items-center gap-2 p-2.5 bg-muted/50 rounded-lg group"
                      >
                        <span className="text-xs text-muted-foreground w-5 shrink-0">
                          {index + 1}.
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{question.questionText}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {question.category}
                            </Badge>
                            <DifficultyBadge level={question.difficultyLevel} />
                            <span className="text-[10px] text-muted-foreground">
                              {question.points || 1} pts
                            </span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeQuestion(question._id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Passing Marks</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.passingMarks}
                      onChange={(e) => handleChange("passingMarks", e.target.value)}
                      className={errors.passingMarks ? "border-destructive" : ""}
                    />
                    <p className="text-[10px] text-muted-foreground">Total: {totalMarks} marks</p>
                    {errors.passingMarks && <p className="text-xs text-destructive">{errors.passingMarks}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm">Allowed Attempts</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.allowedAttempts}
                      onChange={(e) => handleChange("allowedAttempts", e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="shuffleQuestions"
                      checked={formData.shuffleQuestions}
                      onCheckedChange={(c) => handleChange("shuffleQuestions", c)}
                    />
                    <Label htmlFor="shuffleQuestions" className="text-sm cursor-pointer">
                      Shuffle questions
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="showResults"
                      checked={formData.showResultsImmediately}
                      onCheckedChange={(c) => handleChange("showResultsImmediately", c)}
                    />
                    <Label htmlFor="showResults" className="text-sm cursor-pointer">
                      Show results immediately
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Adaptive Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Adaptive Learning</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isAdaptive"
                    checked={formData.isAdaptive}
                    onCheckedChange={(c) => handleChange("isAdaptive", c)}
                  />
                  <Label htmlFor="isAdaptive" className="text-sm cursor-pointer">
                    Enable adaptive difficulty
                  </Label>
                </div>

                {formData.isAdaptive && (
                  <div className="space-y-1.5">
                    <Label className="text-sm">Initial Difficulty</Label>
                    <Select
                      value={formData.initialDifficulty}
                      onValueChange={(v) => handleChange("initialDifficulty", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground">
                      Difficulty adjusts based on student performance
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Schedule (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Start Date</Label>
                    <Input
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => handleChange("startDate", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">End Date</Label>
                    <Input
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => handleChange("endDate", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>

        {/* Right: Question Browser Panel */}
        <div
          className={cn(
            "w-80 shrink-0 border rounded-lg bg-card overflow-hidden flex flex-col transition-all duration-300",
            "fixed inset-y-0 right-0 z-50 w-full max-w-sm shadow-xl lg:relative lg:shadow-none lg:z-0 lg:max-w-none lg:w-80",
            showQuestionPanel ? "translate-x-0" : "translate-x-full lg:translate-x-0"
          )}
        >
          {/* Panel Header - Mobile close button */}
          <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b bg-muted/30">
            <span className="font-semibold">Question Bank</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowQuestionPanel(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Question Browser or Quick Form */}
          {showQuickForm ? (
            <QuickQuestionForm
              onClose={() => setShowQuickForm(false)}
              onSuccess={(newQuestion) => {
                addQuestion(newQuestion);
                setShowQuickForm(false);
              }}
            />
          ) : (
            <QuestionBrowser
              selectedQuestions={selectedQuestions}
              onAddQuestion={addQuestion}
              onRemoveQuestion={removeQuestion}
              onCreateNew={() => setShowQuickForm(true)}
              className="flex-1 overflow-hidden flex flex-col p-3"
            />
          )}
        </div>

        {/* Mobile overlay backdrop */}
        {showQuestionPanel && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setShowQuestionPanel(false)}
          />
        )}
      </div>
    </div>
  );
}
