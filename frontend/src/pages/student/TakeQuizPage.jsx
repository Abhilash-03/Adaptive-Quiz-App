import { useState, useEffect, useCallback, useRef, useMemo, startTransition } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Flag,
  Loader2,
  Send,
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Spinner,
  Progress,
  RadioGroup,
  RadioGroupItem,
  Label,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Alert,
  AlertDescription,
  Textarea,
} from "@/components/ui";
import { useAttempt, useSubmitAnswer, useSubmitQuiz } from "@/hooks";
import { cn } from "@/lib/utils";

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export default function TakeQuizPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const { data: attemptData, isLoading, isFetching } = useAttempt(attemptId);
  const submitAnswer = useSubmitAnswer();
  const submitQuiz = useSubmitQuiz();

  // State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [answers, setAnswers] = useState({});
  const [remainingTime, setRemainingTime] = useState(null);
  const [showFeedback, setShowFeedback] = useState(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [difficultyChange, setDifficultyChange] = useState(null); // 'up', 'down', 'same'
  const [_previousDifficulty, setPreviousDifficulty] = useState(null);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [incorrectStreak, setIncorrectStreak] = useState(0);
  const [aiTargetDifficulty, setAiTargetDifficulty] = useState(null); // AI's calculated target (1-100)
  const [hasLimitedQuestions, setHasLimitedQuestions] = useState(false); // True if AI can't find ideal difficulty
  const questionStartTimeRef = useRef(null);
  const remainingTimeInitializedRef = useRef(false);

  // For adaptive quizzes
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answeredCount, setAnsweredCount] = useState(0);

  // attemptData contains the response - either from startAttempt or getAttempt
  // Start response: { attempt: \"id\", questions: [...], quiz: {...}, isAdaptive, ... }
  // GetAttempt response: { _id: \"id\", quiz: {...}, answers: [...], questions: [...], isAdaptive, ... }
  const attempt = attemptData;
  const quiz = attempt?.quiz;

  // Get questions from response - always try to extract them
  // Use attemptData directly as dependency to ensure fresh computation
  const questions = useMemo(() => {
    if (!attemptData) return [];
    
    // Priority: explicit questions array
    if (attemptData.questions && attemptData.questions.length > 0) {
      return attemptData.questions;
    }
    
    // Fallback: extract from answers array
    if (attemptData.answers) {
      const fromAnswers = attemptData.answers
        .map((a) => a.question)
        .filter((q) => q && q._id && q.questionText);
      if (fromAnswers.length > 0) {
        return fromAnswers;
      }
    }
    
    return [];
  }, [attemptData]);

  // Check if quiz is marked as adaptive (for UI display purposes)
  const isAdaptiveQuiz = attemptData?.isAdaptive ?? quiz?.isAdaptive ?? false;
  
  // Use adaptive flow ONLY if we don't have all questions available
  // If backend sends all questions, use normal navigation regardless of isAdaptive flag
  const useAdaptiveMode = questions.length === 0 && isAdaptiveQuiz;
  
  const totalQuestions = quiz?.totalQuestions || attemptData?.totalQuestions || questions.length;
  const currentQ = useAdaptiveMode
    ? currentQuestion
    : questions[currentQuestionIndex];

  // Count answered
  const answeredQuestionsCount = useAdaptiveMode
    ? answeredCount
    : Object.keys(answers).length;

  // Submit quiz handler (defined early for use in handleTimeUp)
  const handleSubmitQuiz = useCallback(
    async (autoSubmit = false) => {
      if (!autoSubmit) {
        setShowSubmitDialog(false);
      }

      setIsSubmitting(true);

      try {
        // Prepare answers array
        const answersArray = questions.map((q, idx) => ({
          questionId: q._id,
          answer: answers[idx] || null,
          timeTaken: 0,
        }));

        await submitQuiz.mutateAsync({
          attemptId,
          answers: answersArray,
        });

        // Small delay to show success state
        await new Promise(resolve => setTimeout(resolve, 500));
        navigate(`/student/attempt/${attemptId}`, { replace: true });
      } catch {
        setIsSubmitting(false);
        // Error handled in mutation
      }
    },
    [attemptId, answers, questions, navigate, submitQuiz],
  );

  // Handle time up
  const handleTimeUp = useCallback(() => {
    handleSubmitQuiz(true);
  }, [handleSubmitQuiz]);

  // Initialize from attempt data
  useEffect(() => {
    if (attempt) {
      // Set remaining time only once
      if (!remainingTimeInitializedRef.current) {
        let time = null;
        if (
          attempt.remainingTime !== undefined &&
          attempt.remainingTime !== null
        ) {
          time = attempt.remainingTime;
        } else if (
          attemptData?.remainingTime !== undefined &&
          attemptData?.remainingTime !== null
        ) {
          time = attemptData.remainingTime;
        } else if (attempt.startTime && quiz?.duration) {
          const elapsed = Math.floor(
            (Date.now() - new Date(attempt.startTime)) / 1000,
          );
          time = Math.max(0, quiz.duration * 60 - elapsed);
        }

        if (time !== null) {
          startTransition(() => {
            setRemainingTime(time);
          });
          remainingTimeInitializedRef.current = true;
        }
      }

      // For adaptive quiz - set current question
      if (useAdaptiveMode && attemptData?.currentQuestion) {
        startTransition(() => {
          setCurrentQuestion(attemptData.currentQuestion);
          setAnsweredCount(attemptData.questionNumber - 1 || 0);
        });
      }

      // For non-adaptive - load existing answers
      if (!useAdaptiveMode && attempt.answers) {
        const existingAnswers = {};
        attempt.answers.forEach((a, idx) => {
          if (a.selectedAnswer) {
            existingAnswers[idx] = a.selectedAnswer;
          }
        });
        startTransition(() => {
          setAnswers(existingAnswers);
        });
      }

      // Initialize question start time
      questionStartTimeRef.current = Date.now();
    }
  }, [attempt, attemptData, useAdaptiveMode, quiz]);

  // Timer countdown
  useEffect(() => {
    if (remainingTime === null || remainingTime <= 0) return;

    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Delay handleTimeUp to avoid state update during render
          setTimeout(() => handleTimeUp(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingTime, handleTimeUp]);

  // Answer submission for adaptive quiz
  const handleAdaptiveAnswer = async () => {
    if (!selectedAnswer || !currentQuestion) return;

    const timeTaken = Math.floor(
      (Date.now() - (questionStartTimeRef.current || Date.now())) / 1000,
    );

    // Store current difficulty before submitting
    const currentDifficulty = currentQuestion.difficultyLevel;

    try {
      const result = await submitAnswer.mutateAsync({
        attemptId,
        data: {
          questionId: currentQuestion._id,
          answer: selectedAnswer,
          timeTaken,
        },
      });

      // Update streaks
      if (result.isCorrect) {
        setCorrectStreak(prev => prev + 1);
        setIncorrectStreak(0);
      } else {
        setIncorrectStreak(prev => prev + 1);
        setCorrectStreak(0);
      }

      // Show feedback
      setShowFeedback({
        isCorrect: result.isCorrect,
        correctAnswer: result.correctAnswer,
        explanation: result.explanation,
      });

      // Update AI difficulty tracking
      if (result.targetDifficulty !== undefined) {
        setAiTargetDifficulty(result.targetDifficulty);
      }
      if (result.hasLimitedQuestions !== undefined) {
        setHasLimitedQuestions(result.hasLimitedQuestions);
      }

      // Wait a moment then move to next question
      setTimeout(() => {
        setShowFeedback(null);
        setSelectedAnswer("");
        questionStartTimeRef.current = Date.now();

        if (result.nextQuestion) {
          // Detect difficulty change based on AI target
          const nextDifficulty = result.nextQuestion.difficultyLevel;
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
          const currentLevel = difficultyOrder[currentDifficulty] || 2;
          const nextLevel = difficultyOrder[nextDifficulty] || 2;

          if (nextLevel > currentLevel) {
            setDifficultyChange('up');
          } else if (nextLevel < currentLevel) {
            setDifficultyChange('down');
          } else if (result.targetDifficulty > result.actualDifficulty + 10) {
            // AI wanted harder but couldn't find it - still show "up" intent
            setDifficultyChange('up');
          } else {
            setDifficultyChange('same');
          }
          setPreviousDifficulty(currentDifficulty);

          // Clear difficulty change notification after 3 seconds
          setTimeout(() => setDifficultyChange(null), 3000);

          setCurrentQuestion(result.nextQuestion);
          setAnsweredCount(result.questionNumber - 1);
        } else {
          // Quiz complete - navigate to results
          navigate(`/student/attempt/${attemptId}`, { replace: true });
        }
      }, 2000);
    } catch {
      // Error handled in mutation
    }
  };

  // Navigation for non-adaptive
  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
    setSelectedAnswer(answers[index] || "");
  };

  const handleNonAdaptiveAnswer = (answer) => {
    setSelectedAnswer(answer);
    setAnswers((prev) => ({ ...prev, [currentQuestionIndex]: answer }));
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Wait for questions to be available (handles race condition on initial navigation)
  if (!attempt || (questions.length === 0 && !useAdaptiveMode && isFetching)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">Attempt not found</p>
        <Button onClick={() => navigate('/student/quizzes')}>
          Browse Quizzes
        </Button>
      </div>
    );
  }

  if (attempt.status === "completed") {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">This attempt has been completed</p>
        <Button onClick={() => navigate(`/student/attempt/${attemptId}`)}>
          View Results
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Difficulty Change Notification */}
      {isAdaptiveQuiz && difficultyChange && (
        <div className={cn(
          "fixed top-20 left-1/2 -translate-x-1/2 z-60 px-6 py-3 rounded-full shadow-lg animate-slideDown flex items-center gap-3",
          difficultyChange === 'up' 
            ? "bg-linear-to-r from-orange-500 to-red-500 text-white"
            : difficultyChange === 'down'
              ? "bg-linear-to-r from-green-500 to-emerald-500 text-white"
              : "bg-linear-to-r from-blue-500 to-primary text-white"
        )}>
          {difficultyChange === 'up' ? (
            <>
              <TrendingUp className="h-5 w-5" />
              <span className="font-medium">Difficulty Increased! Great job!</span>
              <Sparkles className="h-4 w-4" />
            </>
          ) : difficultyChange === 'down' ? (
            <>
              <TrendingDown className="h-5 w-5" />
              <span className="font-medium">Difficulty Adjusted - Keep going!</span>
            </>
          ) : (
            <>
              <Minus className="h-5 w-5" />
              <span className="font-medium">Same Level - Stay focused!</span>
            </>
          )}
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-50 bg-card border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-semibold">{quiz?.title}</h1>
                {isAdaptiveQuiz && (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-linear-to-r from-primary/20 to-violet-500/20 border border-primary/30">
                    <Brain className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-medium text-primary">AI Adaptive</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Question{" "}
                {useAdaptiveMode ? answeredCount + 1 : currentQuestionIndex + 1} of{" "}
                {totalQuestions}
              </p>
            </div>

            {/* Timer */}
            <div
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                remainingTime < 60
                  ? "bg-red-100 text-red-700"
                  : remainingTime < 300
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-primary/10 text-primary",
              )}
            >
              <Clock className="h-5 w-5" />
              <span className="font-mono font-bold text-lg">
                {formatTime(remainingTime || 0)}
              </span>
            </div>
          </div>

          {/* Difficulty Meter */}
          {currentQ?.difficultyLevel && (
            <div className="mt-3 p-3 rounded-lg bg-linear-to-r from-muted/50 to-muted/30 border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Current Difficulty</span>
                  {isAdaptiveQuiz && aiTargetDifficulty !== null && (
                    <span className="text-xs text-muted-foreground">
                      (AI Target: {aiTargetDifficulty <= 33 ? 'Easy' : aiTargetDifficulty <= 66 ? 'Medium' : 'Hard'})
                    </span>
                  )}
                </div>
                {isAdaptiveQuiz && (
                  <div className="flex items-center gap-2">
                    {correctStreak >= 2 && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {correctStreak} correct streak!
                      </span>
                    )}
                    {incorrectStreak >= 2 && (
                      <span className="text-xs text-orange-600 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Keep trying!
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {['easy', 'medium', 'hard'].map((level) => (
                  <div
                    key={level}
                    className={cn(
                      "flex-1 h-2 rounded-full transition-all duration-500",
                      currentQ.difficultyLevel === level
                        ? level === 'easy'
                          ? "bg-green-500"
                          : level === 'medium'
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        : "bg-muted"
                    )}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-1">
                <span className={cn(
                  "text-xs",
                  currentQ.difficultyLevel === 'easy' ? "text-green-600 font-medium" : "text-muted-foreground"
                )}>Easy</span>
                <span className={cn(
                  "text-xs",
                  currentQ.difficultyLevel === 'medium' ? "text-yellow-600 font-medium" : "text-muted-foreground"
                )}>Medium</span>
                <span className={cn(
                  "text-xs",
                  currentQ.difficultyLevel === 'hard' ? "text-red-600 font-medium" : "text-muted-foreground"
                )}>Hard</span>
              </div>
              {/* Warning when AI can't find ideal difficulty */}
              {isAdaptiveQuiz && hasLimitedQuestions && (
                <div className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Limited question variety - AI found closest match</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Progress */}
        <Progress
          value={(answeredQuestionsCount / totalQuestions) * 100}
          className="h-1 rounded-none"
        />
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {currentQ ? (
          <Card className="mb-6">
            <CardContent className="pt-6">
              {/* Question */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline">{currentQ.category}</Badge>
                  <Badge variant="secondary">
                    {currentQ.points || 1}{" "}
                    {currentQ.points === 1 ? "point" : "points"}
                  </Badge>
                  {currentQ.difficultyLevel && (
                    <Badge
                      className={cn(
                        "transition-all duration-300",
                        currentQ.difficultyLevel === "easy"
                          ? "bg-green-100 text-green-700 border-green-300"
                          : currentQ.difficultyLevel === "medium"
                            ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                            : "bg-red-100 text-red-700 border-red-300",
                        isAdaptiveQuiz && difficultyChange && "animate-pulse"
                      )}
                    >
                      {currentQ.difficultyLevel === 'easy' && '🟢 '}
                      {currentQ.difficultyLevel === 'medium' && '🟡 '}
                      {currentQ.difficultyLevel === 'hard' && '🔴 '}
                      {currentQ.difficultyLevel}
                    </Badge>
                  )}
                </div>

                <h2 className="text-xl font-medium leading-relaxed">
                  {currentQ.questionText}
                </h2>
              </div>

              {/* Options - default to mcq if questionType not specified */}
              {(!currentQ.questionType || currentQ.questionType === "mcq") && currentQ.options?.length > 0 && (
                <RadioGroup
                  value={selectedAnswer}
                  onValueChange={
                    useAdaptiveMode ? setSelectedAnswer : handleNonAdaptiveAnswer
                  }
                  className="space-y-3"
                  disabled={showFeedback !== null}
                >
                  {currentQ.options.map((option, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
                        selectedAnswer === option
                          ? "border-primary bg-primary/5"
                          : "hover:bg-accent",
                        showFeedback &&
                          option === showFeedback.correctAnswer &&
                          "border-green-500 bg-green-50",
                        showFeedback &&
                          selectedAnswer === option &&
                          !showFeedback.isCorrect &&
                          "border-red-500 bg-red-50",
                      )}
                      onClick={() =>
                        !showFeedback &&
                        (useAdaptiveMode
                          ? setSelectedAnswer(option)
                          : handleNonAdaptiveAnswer(option))
                      }
                    >
                      <RadioGroupItem value={option} id={`option-${idx}`} />
                      <Label
                        htmlFor={`option-${idx}`}
                        className="flex-1 cursor-pointer"
                      >
                        {option}
                      </Label>
                      {showFeedback &&
                        option === showFeedback.correctAnswer && (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        )}
                      {showFeedback &&
                        selectedAnswer === option &&
                        !showFeedback.isCorrect && (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                    </div>
                  ))}
                </RadioGroup>
              )}

              {currentQ.questionType === "true-false" && (
                <RadioGroup
                  value={selectedAnswer}
                  onValueChange={
                    useAdaptiveMode ? setSelectedAnswer : handleNonAdaptiveAnswer
                  }
                  className="flex gap-4"
                  disabled={showFeedback !== null}
                >
                  {["true", "false"].map((value) => (
                    <div
                      key={value}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border cursor-pointer transition-colors",
                        selectedAnswer === value
                          ? "border-primary bg-primary/5"
                          : "hover:bg-accent",
                      )}
                      onClick={() =>
                        !showFeedback &&
                        (useAdaptiveMode
                          ? setSelectedAnswer(value)
                          : handleNonAdaptiveAnswer(value))
                      }
                    >
                      <RadioGroupItem value={value} id={`tf-${value}`} />
                      <Label
                        htmlFor={`tf-${value}`}
                        className="cursor-pointer capitalize text-lg"
                      >
                        {value}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {/* Short Answer Input */}
              {currentQ.questionType === "short-answer" && (
                <div className="space-y-2">
                  <Label htmlFor="short-answer" className="text-sm font-medium">
                    Your Answer
                  </Label>
                  <Textarea
                    id="short-answer"
                    placeholder="Type your answer here..."
                    value={selectedAnswer}
                    onChange={(e) =>
                      useAdaptiveMode
                        ? setSelectedAnswer(e.target.value)
                        : handleNonAdaptiveAnswer(e.target.value)
                    }
                    disabled={showFeedback !== null}
                    className="min-h-32 resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your answer in the text box above
                  </p>
                </div>
              )}

              {/* Feedback */}
              {showFeedback && (
                <Alert
                  className={cn(
                    "mt-6",
                    showFeedback.isCorrect
                      ? "border-green-500"
                      : "border-red-500",
                  )}
                >
                  <div className="flex items-center gap-2">
                    {showFeedback.isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <AlertDescription>
                      <span className="font-medium">
                        {showFeedback.isCorrect ? "Correct!" : "Incorrect"}
                      </span>
                      {showFeedback.explanation && (
                        <p className="mt-1 text-sm">
                          {showFeedback.explanation}
                        </p>
                      )}
                    </AlertDescription>
                  </div>
                </Alert>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Loading question...</p>
            </CardContent>
          </Card>
        )}

        {/* Navigation / Actions */}
        <div className="flex items-center justify-between">
          {/* Non-adaptive navigation */}
          {!useAdaptiveMode && (
            <>
              <Button
                variant="outline"
                onClick={() => goToQuestion(currentQuestionIndex - 1)}
                disabled={currentQuestionIndex === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              <div className="flex gap-2">
                {currentQuestionIndex < questions.length - 1 ? (
                  <Button
                    onClick={() => goToQuestion(currentQuestionIndex + 1)}
                  >
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={() => setShowSubmitDialog(true)}>
                    <Flag className="mr-2 h-4 w-4" />
                    Submit Quiz
                  </Button>
                )}
              </div>
            </>
          )}

          {/* Adaptive submit button */}
          {useAdaptiveMode && !showFeedback && (
            <div className="flex-1 flex justify-center">
              <Button
                size="lg"
                onClick={handleAdaptiveAnswer}
                disabled={!selectedAnswer || submitAnswer.isPending}
              >
                {submitAnswer.isPending ? (
                  <Spinner className="mr-2" size="sm" />
                ) : null}
                Submit Answer
              </Button>
            </div>
          )}
        </div>

        {/* Question Navigation Grid (non-adaptive) */}
        {!useAdaptiveMode && questions.length > 0 && (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <p className="text-sm font-medium mb-3">Question Navigator</p>
              <div className="flex flex-wrap gap-2">
                {questions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToQuestion(idx)}
                    className={cn(
                      "h-10 w-10 rounded-lg text-sm font-medium transition-colors",
                      currentQuestionIndex === idx
                        ? "bg-primary text-primary-foreground"
                        : answers[idx]
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-muted hover:bg-muted/80",
                    )}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                {answeredQuestionsCount} of {totalQuestions} answered
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Quiz?</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit your quiz?
            </DialogDescription>
          </DialogHeader>

          {answeredQuestionsCount < totalQuestions && (
            <Alert variant="warning" className="border-yellow-500">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription>
                You have {totalQuestions - answeredQuestionsCount} unanswered
                questions. Unanswered questions will be marked as incorrect.
              </AlertDescription>
            </Alert>
          )}

          <div className="py-2">
            <p className="text-sm text-muted-foreground">
              Answered: {answeredQuestionsCount}/{totalQuestions} questions
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSubmitDialog(false)}
            >
              Review Answers
            </Button>
            <Button
              onClick={() => handleSubmitQuiz(false)}
              disabled={submitQuiz.isPending}
            >
              {submitQuiz.isPending ? (
                <Spinner className="mr-2" size="sm" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Submit Quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submission Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-100 bg-background/95 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center p-8 max-w-md mx-auto">
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
              <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full border-4 border-primary/20 border-t-primary animate-spin" style={{ animationDuration: '1.5s' }} />
            </div>
            
            <h2 className="text-2xl font-bold mb-2">Submitting Your Quiz</h2>
            <p className="text-muted-foreground mb-6">
              Please wait while we process your answers...
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                </div>
                <span className="text-muted-foreground">Answers collected</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <Loader2 className="w-3 h-3 text-primary animate-spin" />
                </div>
                <span>Processing submission...</span>
              </div>
              <div className="flex items-center gap-3 text-sm opacity-50">
                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                </div>
                <span className="text-muted-foreground">Calculating results</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-6">
              Do not close this page
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
