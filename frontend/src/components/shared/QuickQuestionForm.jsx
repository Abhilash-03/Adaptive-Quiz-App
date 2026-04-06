import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import {
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  RadioGroup,
  RadioGroupItem,
  Spinner,
} from "@/components/ui";
import { useCreateQuestion, useQuestionCategories } from "@/hooks";

export function QuickQuestionForm({ onClose, onSuccess }) {
  const { data: categories } = useQuestionCategories();
  const createQuestion = useCreateQuestion();

  const [formData, setFormData] = useState({
    questionText: "",
    questionType: "mcq",
    options: ["", "", "", ""],
    correctAnswer: "",
    difficultyLevel: "medium",
    category: "",
    points: 1,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    const oldValue = newOptions[index];
    newOptions[index] = value;
    setFormData((prev) => ({ 
      ...prev, 
      options: newOptions,
      correctAnswer: prev.correctAnswer === oldValue ? value : prev.correctAnswer
    }));
  };

  const addOption = () => {
    if (formData.options.length < 6) {
      setFormData((prev) => ({ ...prev, options: [...prev.options, ""] }));
    }
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const removedOption = formData.options[index];
      setFormData((prev) => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index),
        correctAnswer: prev.correctAnswer === removedOption ? "" : prev.correctAnswer
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.questionText.trim()) {
      newErrors.questionText = "Required";
    }

    if (!formData.category) {
      newErrors.category = "Required";
    }

    if (formData.questionType === "mcq") {
      const filledOptions = formData.options.filter((opt) => opt.trim());
      if (filledOptions.length < 2) {
        newErrors.options = "At least 2 options required";
      }
      if (!formData.correctAnswer) {
        newErrors.correctAnswer = "Select correct answer";
      }
    } else if (formData.questionType === "true-false") {
      if (!formData.correctAnswer) {
        newErrors.correctAnswer = "Select correct answer";
      }
    } else {
      if (!formData.correctAnswer.trim()) {
        newErrors.correctAnswer = "Required";
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
      category: formData.category,
      points: parseInt(formData.points),
    };

    if (formData.questionType === "mcq") {
      submitData.options = formData.options.filter((opt) => opt.trim());
    }

    try {
      const response = await createQuestion.mutateAsync(submitData);
      // Extract the actual question from API response { success, message, data }
      const newQuestion = response.data || response;
      onSuccess?.(newQuestion);
      onClose();
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="font-semibold">Quick Add Question</h3>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Question Text */}
        <div className="space-y-1.5">
          <Label className="text-xs">Question *</Label>
          <Textarea
            placeholder="Enter your question..."
            value={formData.questionText}
            onChange={(e) => handleChange("questionText", e.target.value)}
            className={errors.questionText ? "border-destructive" : ""}
            rows={3}
          />
          {errors.questionText && (
            <p className="text-xs text-destructive">{errors.questionText}</p>
          )}
        </div>

        {/* Type & Category */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Type</Label>
            <Select
              value={formData.questionType}
              onValueChange={(v) => {
                handleChange("questionType", v);
                handleChange("correctAnswer", "");
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mcq">Multiple Choice</SelectItem>
                <SelectItem value="true-false">True/False</SelectItem>
                <SelectItem value="short-answer">Short Answer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(v) => handleChange("category", v)}
            >
              <SelectTrigger className={`h-8 text-xs ${errors.category ? "border-destructive" : ""}`}>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Difficulty & Points */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Difficulty</Label>
            <Select
              value={formData.difficultyLevel}
              onValueChange={(v) => handleChange("difficultyLevel", v)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Points</Label>
            <Input
              type="number"
              min="1"
              value={formData.points}
              onChange={(e) => handleChange("points", e.target.value)}
              className="h-8 text-xs"
            />
          </div>
        </div>

        {/* Options (MCQ) */}
        {formData.questionType === "mcq" && (
          <div className="space-y-2">
            <Label className="text-xs">Options (select correct answer) *</Label>
            <RadioGroup
              value={formData.correctAnswer}
              onValueChange={(v) => handleChange("correctAnswer", v)}
              className="space-y-2"
            >
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <RadioGroupItem
                    value={option || `__empty_${index}`}
                    id={`opt-${index}`}
                    disabled={!option.trim()}
                    className="h-3.5 w-3.5"
                  />
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1 h-8 text-xs"
                  />
                  {formData.options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => removeOption(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              ))}
            </RadioGroup>
            {formData.options.length < 6 && (
              <Button type="button" variant="outline" size="sm" onClick={addOption} className="h-7 text-xs">
                <Plus className="h-3 w-3 mr-1" />
                Add Option
              </Button>
            )}
            {(errors.options || errors.correctAnswer) && (
              <p className="text-xs text-destructive">{errors.options || errors.correctAnswer}</p>
            )}
          </div>
        )}

        {/* True/False */}
        {formData.questionType === "true-false" && (
          <div className="space-y-2">
            <Label className="text-xs">Correct Answer *</Label>
            <RadioGroup
              value={formData.correctAnswer}
              onValueChange={(v) => handleChange("correctAnswer", v)}
              className="flex gap-4"
            >
              <div className="flex items-center gap-1.5">
                <RadioGroupItem value="true" id="tf-true" className="h-3.5 w-3.5" />
                <Label htmlFor="tf-true" className="text-xs cursor-pointer">True</Label>
              </div>
              <div className="flex items-center gap-1.5">
                <RadioGroupItem value="false" id="tf-false" className="h-3.5 w-3.5" />
                <Label htmlFor="tf-false" className="text-xs cursor-pointer">False</Label>
              </div>
            </RadioGroup>
            {errors.correctAnswer && (
              <p className="text-xs text-destructive">{errors.correctAnswer}</p>
            )}
          </div>
        )}

        {/* Short Answer */}
        {formData.questionType === "short-answer" && (
          <div className="space-y-1.5">
            <Label className="text-xs">Correct Answer *</Label>
            <Input
              placeholder="Expected answer"
              value={formData.correctAnswer}
              onChange={(e) => handleChange("correctAnswer", e.target.value)}
              className={`h-8 text-xs ${errors.correctAnswer ? "border-destructive" : ""}`}
            />
            {errors.correctAnswer && (
              <p className="text-xs text-destructive">{errors.correctAnswer}</p>
            )}
          </div>
        )}
      </form>

      {/* Footer */}
      <div className="px-4 py-3 border-t flex gap-2">
        <Button variant="outline" className="flex-1 h-8 text-xs" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          className="flex-1 h-8 text-xs" 
          onClick={handleSubmit}
          disabled={createQuestion.isPending}
        >
          {createQuestion.isPending ? <Spinner size="sm" /> : "Add Question"}
        </Button>
      </div>
    </div>
  );
}
