import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
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
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui";
import { useQuestion, useCreateQuestion, useUpdateQuestion, useQuestionCategories } from "@/hooks";

// Wrapper component that handles data fetching
export default function QuestionFormPage() {
  const { questionId } = useParams();
  const isEditing = !!questionId;

  const { data: existingQuestion, isLoading: isLoadingQuestion } = useQuestion(questionId);

  if (isEditing && isLoadingQuestion) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Key forces remount when switching between questions
  return <QuestionFormContent key={questionId || 'new'} existingQuestion={existingQuestion} questionId={questionId} />;
}

// Form content component with proper initial state
function QuestionFormContent({ existingQuestion, questionId }) {
  const navigate = useNavigate();
  const isEditing = !!questionId;

  const { data: categories } = useQuestionCategories();
  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();

  const [formData, setFormData] = useState({
    questionText: existingQuestion?.questionText || "",
    questionType: existingQuestion?.questionType || "mcq",
    options: existingQuestion?.options?.length > 0 
      ? existingQuestion.options 
      : ["", "", "", ""],
    correctAnswer: existingQuestion?.correctAnswer || "",
    difficultyLevel: existingQuestion?.difficultyLevel || "medium",
    difficultyScore: existingQuestion?.difficultyScore || 50,
    category: existingQuestion?.category || "",
    topic: existingQuestion?.topic || "",
    tags: existingQuestion?.tags?.join(", ") || "",
    explanation: existingQuestion?.explanation || "",
    points: existingQuestion?.points || 1,
    timeLimit: existingQuestion?.timeLimit || 30,
  });

  const [errors, setErrors] = useState({});
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is changed
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData((prev) => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    if (formData.options.length < 6) {
      setFormData((prev) => ({ ...prev, options: [...prev.options, ""] }));
    }
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, options: newOptions }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.questionText.trim()) {
      newErrors.questionText = "Question text is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (formData.questionType === "mcq") {
      const filledOptions = formData.options.filter((opt) => opt.trim());
      if (filledOptions.length < 2) {
        newErrors.options = "At least 2 options are required";
      }
      if (!formData.correctAnswer) {
        newErrors.correctAnswer = "Please select the correct answer";
      }
    } else if (formData.questionType === "true-false") {
      if (!formData.correctAnswer) {
        newErrors.correctAnswer = "Please select the correct answer";
      }
    } else {
      if (!formData.correctAnswer.trim()) {
        newErrors.correctAnswer = "Correct answer is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const submitData = {
      questionText: formData.questionText.trim(),
      questionType: formData.questionType,
      correctAnswer: formData.correctAnswer,
      difficultyLevel: formData.difficultyLevel,
      difficultyScore: parseInt(formData.difficultyScore),
      category: formData.category,
      topic: formData.topic.trim() || undefined,
      tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
      explanation: formData.explanation.trim() || undefined,
      points: parseInt(formData.points),
      timeLimit: parseInt(formData.timeLimit),
    };

    // Add options only for MCQ
    if (formData.questionType === "mcq") {
      submitData.options = formData.options.filter((opt) => opt.trim());
    }

    try {
      if (isEditing) {
        await updateQuestion.mutateAsync({ id: questionId, data: submitData });
      } else {
        await createQuestion.mutateAsync(submitData);
      }
      navigate("/teacher/questions");
    } catch {
      // Error is handled by mutation
    }
  };

  const isPending = createQuestion.isPending || updateQuestion.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Edit Question" : "Create Question"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update the question details" : "Add a new question to your bank"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Text */}
            <Card>
              <CardHeader>
                <CardTitle>Question</CardTitle>
                <CardDescription>Enter the question text and type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="questionText">Question Text *</Label>
                  <Textarea
                    id="questionText"
                    placeholder="Enter your question here..."
                    value={formData.questionText}
                    onChange={(e) => handleChange("questionText", e.target.value)}
                    className={errors.questionText ? "border-destructive" : ""}
                    rows={4}
                  />
                  {errors.questionText && (
                    <p className="text-sm text-destructive">{errors.questionText}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Question Type *</Label>
                  <Select
                    value={formData.questionType}
                    onValueChange={(value) => {
                      handleChange("questionType", value);
                      // Reset correct answer when type changes
                      handleChange("correctAnswer", "");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mcq">Multiple Choice</SelectItem>
                      <SelectItem value="true-false">True/False</SelectItem>
                      <SelectItem value="short-answer">Short Answer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Options / Answer */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {formData.questionType === "mcq" ? "Options" : "Answer"}
                </CardTitle>
                <CardDescription>
                  {formData.questionType === "mcq"
                    ? "Add options and select the correct answer"
                    : formData.questionType === "true-false"
                    ? "Select the correct answer"
                    : "Enter the expected answer"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.questionType === "mcq" && (
                  <>
                    <RadioGroup
                      value={formData.correctAnswer}
                      onValueChange={(value) => handleChange("correctAnswer", value)}
                      className="space-y-3"
                    >
                      {formData.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <RadioGroupItem
                            value={option || `option-${index}`}
                            id={`option-${index}`}
                            disabled={!option.trim()}
                          />
                          <Input
                            placeholder={`Option ${index + 1}`}
                            value={option}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              const oldValue = formData.options[index];
                              handleOptionChange(index, newValue);
                              // Update correctAnswer if this was the selected option
                              if (formData.correctAnswer === oldValue) {
                                handleChange("correctAnswer", newValue);
                              }
                            }}
                            className="flex-1"
                          />
                          {formData.options.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                // Clear correctAnswer if removing the selected option
                                if (formData.correctAnswer === option) {
                                  handleChange("correctAnswer", "");
                                }
                                removeOption(index);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </RadioGroup>
                    {formData.options.length < 6 && (
                      <Button type="button" variant="outline" size="sm" onClick={addOption}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Option
                      </Button>
                    )}
                    {errors.options && (
                      <p className="text-sm text-destructive">{errors.options}</p>
                    )}
                    {errors.correctAnswer && (
                      <p className="text-sm text-destructive">{errors.correctAnswer}</p>
                    )}
                  </>
                )}

                {formData.questionType === "true-false" && (
                  <div className="space-y-2">
                    <RadioGroup
                      value={formData.correctAnswer}
                      onValueChange={(value) => handleChange("correctAnswer", value)}
                      className="flex gap-6"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="true" id="true" />
                        <Label htmlFor="true" className="cursor-pointer">True</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="false" id="false" />
                        <Label htmlFor="false" className="cursor-pointer">False</Label>
                      </div>
                    </RadioGroup>
                    {errors.correctAnswer && (
                      <p className="text-sm text-destructive">{errors.correctAnswer}</p>
                    )}
                  </div>
                )}

                {formData.questionType === "short-answer" && (
                  <div className="space-y-2">
                    <Label htmlFor="correctAnswer">Correct Answer *</Label>
                    <Input
                      id="correctAnswer"
                      placeholder="Enter the expected answer"
                      value={formData.correctAnswer}
                      onChange={(e) => handleChange("correctAnswer", e.target.value)}
                      className={errors.correctAnswer ? "border-destructive" : ""}
                    />
                    {errors.correctAnswer && (
                      <p className="text-sm text-destructive">{errors.correctAnswer}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Explanation */}
            <Card>
              <CardHeader>
                <CardTitle>Explanation (Optional)</CardTitle>
                <CardDescription>
                  Provide an explanation that will be shown after answering
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Explain why this is the correct answer..."
                  value={formData.explanation}
                  onChange={(e) => handleChange("explanation", e.target.value)}
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Category & Topic */}
            <Card>
              <CardHeader>
                <CardTitle>Classification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  {showCustomCategory ? (
                    <div className="space-y-2">
                      <Input
                        placeholder="Enter new category"
                        value={customCategory}
                        onChange={(e) => {
                          setCustomCategory(e.target.value);
                          handleChange("category", e.target.value);
                        }}
                        autoFocus
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowCustomCategory(false);
                          setCustomCategory("");
                          handleChange("category", "");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Select
                      value={formData.category}
                      onValueChange={(value) => {
                        if (value === "__custom") {
                          setShowCustomCategory(true);
                          setCustomCategory("");
                          handleChange("category", "");
                        } else {
                          handleChange("category", value);
                        }
                      }}
                    >
                      <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                        <SelectItem value="__custom">+ Add Category</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  {errors.category && (
                    <p className="text-sm text-destructive">{errors.category}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Variables, Functions"
                    value={formData.topic}
                    onChange={(e) => handleChange("topic", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    placeholder="comma, separated, tags"
                    value={formData.tags}
                    onChange={(e) => handleChange("tags", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate tags with commas
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Difficulty */}
            <Card>
              <CardHeader>
                <CardTitle>Difficulty</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Difficulty Level</Label>
                  <Select
                    value={formData.difficultyLevel}
                    onValueChange={(value) => handleChange("difficultyLevel", value)}
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficultyScore">
                    Difficulty Score (1-100)
                  </Label>
                  <Input
                    id="difficultyScore"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.difficultyScore}
                    onChange={(e) => handleChange("difficultyScore", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Used for adaptive quiz algorithm
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="points">Points</Label>
                  <Input
                    id="points"
                    type="number"
                    min="1"
                    value={formData.points}
                    onChange={(e) => handleChange("points", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeLimit">Time Limit (seconds)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    min="10"
                    value={formData.timeLimit}
                    onChange={(e) => handleChange("timeLimit", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isPending}
            >
              {isPending ? (
                <Spinner className="mr-2" size="sm" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isEditing ? "Save Changes" : "Create Question"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
