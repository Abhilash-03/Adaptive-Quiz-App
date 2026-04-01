import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Flag
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

  const { data: attemptData, isLoading } = useAttempt(attemptId);
  const submitAnswer = useSubmitAnswer();
  const submitQuiz = useSubmitQuiz();

  // State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [answers, setAnswers] = useState({});
  const [remainingTime, setRemainingTime] = useState(null);
  const [showFeedback, setShowFeedback] = useState(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const questionStartTimeRef = useRef(null);

  // For adaptive quizzes
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answeredCount, setAnsweredCount] = useState(0);

  const attempt = attemptData?.attempt || attemptData;
  const quiz = attempt?.quiz;
  const isAdaptive = quiz?.isAdaptive;

  // Get questions for non-adaptive
  const questions = !isAdaptive ? (attemptData?.questions || attempt?.answers?.map(a => a.question).filter(Boolean) || []) : [];
  const totalQuestions = quiz?.totalQuestions || questions.length;
  const currentQ = isAdaptive ? currentQuestion : questions[currentQuestionIndex];

  // Count answered
  const answeredQuestionsCount = isAdaptive 
    ? answeredCount 
    : Object.keys(answers).length;

  // Submit quiz handler (defined early for use in handleTimeUp)
  const handleSubmitQuiz = useCallback(async (autoSubmit = false) => {
    if (!autoSubmit) {
      setShowSubmitDialog(false);
    }

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

      navigate(`/student/attempt/${attemptId}`, { replace: true });
    } catch {
      // Error handled in mutation
    }
  }, [attemptId, answers, questions, navigate, submitQuiz]);

  // Handle time up
  const handleTimeUp = useCallback(() => {
    handleSubmitQuiz(true);
  }, [handleSubmitQuiz]);

  // Initialize from attempt data
  useEffect(() => {
    if (attempt) {
      // Set remaining time
      if (attempt.remainingTime !== undefined) {
        setRemainingTime(attempt.remainingTime);
      } else if (attempt.startTime && quiz?.duration) {
        const elapsed = Math.floor((Date.now() - new Date(attempt.startTime)) / 1000);
        const remaining = Math.max(0, (quiz.duration * 60) - elapsed);
        setRemainingTime(remaining);
      }

      // For adaptive quiz - set current question
      if (isAdaptive && attemptData?.currentQuestion) {
        setCurrentQuestion(attemptData.currentQuestion);
        setAnsweredCount(attemptData.questionNumber - 1 || 0);
      }

      // For non-adaptive - load existing answers
      if (!isAdaptive && attempt.answers) {
        const existingAnswers = {};
        attempt.answers.forEach((a, idx) => {
          if (a.selectedAnswer) {
            existingAnswers[idx] = a.selectedAnswer;
          }
        });
        setAnswers(existingAnswers);
      }

      // Initialize question start time
      questionStartTimeRef.current = Date.now();
    }
  }, [attempt, attemptData, isAdaptive, quiz]);

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

    const timeTaken = Math.floor((Date.now() - (questionStartTimeRef.current || Date.now())) / 1000);

    try {
      const result = await submitAnswer.mutateAsync({
        attemptId,
        data: {
          questionId: currentQuestion._id,
          answer: selectedAnswer,
          timeTaken,
        },
      });

      // Show feedback
      setShowFeedback({
        isCorrect: result.isCorrect,
        correctAnswer: result.correctAnswer,
        explanation: result.explanation,
      });

      // Wait a moment then move to next question
      setTimeout(() => {
        setShowFeedback(null);
        setSelectedAnswer("");
        questionStartTimeRef.current = Date.now();

        if (result.nextQuestion) {
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

  if (!attempt || attempt.status === "completed") {
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
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-semibold">{quiz?.title}</h1>
            <p className="text-sm text-muted-foreground">
              Question {isAdaptive ? answeredCount + 1 : currentQuestionIndex + 1} of {totalQuestions}
            </p>
          </div>

          {/* Timer */}
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg",
            remainingTime < 60 ? "bg-red-100 text-red-700" : 
            remainingTime < 300 ? "bg-yellow-100 text-yellow-700" : 
            "bg-primary/10 text-primary"
          )}>
            <Clock className="h-5 w-5" />
            <span className="font-mono font-bold text-lg">
              {formatTime(remainingTime || 0)}
            </span>
          </div>
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
                  <Badge variant="outline">
                    {currentQ.category}
                  </Badge>
                  <Badge variant="secondary">
                    {currentQ.points || 1} {currentQ.points === 1 ? "point" : "points"}
                  </Badge>
                  {isAdaptive && currentQ.difficultyLevel && (
                    <Badge className={cn(
                      currentQ.difficultyLevel === "easy" ? "bg-green-100 text-green-700" :
                      currentQ.difficultyLevel === "medium" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    )}>
                      {currentQ.difficultyLevel}
                    </Badge>
                  )}
                </div>

                <h2 className="text-xl font-medium leading-relaxed">
                  {currentQ.questionText}
                </h2>
              </div>

              {/* Options */}
              {currentQ.questionType === "mcq" && currentQ.options && (
                <RadioGroup
                  value={selectedAnswer}
                  onValueChange={isAdaptive ? setSelectedAnswer : handleNonAdaptiveAnswer}
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
                        showFeedback && option === showFeedback.correctAnswer && "border-green-500 bg-green-50",
                        showFeedback && selectedAnswer === option && !showFeedback.isCorrect && "border-red-500 bg-red-50"
                      )}
                      onClick={() => !showFeedback && (isAdaptive ? setSelectedAnswer(option) : handleNonAdaptiveAnswer(option))}
                    >
                      <RadioGroupItem value={option} id={`option-${idx}`} />
                      <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                      {showFeedback && option === showFeedback.correctAnswer && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                      {showFeedback && selectedAnswer === option && !showFeedback.isCorrect && (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  ))}
                </RadioGroup>
              )}

              {currentQ.questionType === "true-false" && (
                <RadioGroup
                  value={selectedAnswer}
                  onValueChange={isAdaptive ? setSelectedAnswer : handleNonAdaptiveAnswer}
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
                          : "hover:bg-accent"
                      )}
                      onClick={() => !showFeedback && (isAdaptive ? setSelectedAnswer(value) : handleNonAdaptiveAnswer(value))}
                    >
                      <RadioGroupItem value={value} id={`tf-${value}`} />
                      <Label htmlFor={`tf-${value}`} className="cursor-pointer capitalize text-lg">
                        {value}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {/* Feedback */}
              {showFeedback && (
                <Alert className={cn("mt-6", showFeedback.isCorrect ? "border-green-500" : "border-red-500")}>
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
                        <p className="mt-1 text-sm">{showFeedback.explanation}</p>
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
          {!isAdaptive && (
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
          {isAdaptive && !showFeedback && (
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
        {!isAdaptive && questions.length > 0 && (
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
                        : "bg-muted hover:bg-muted/80"
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
                You have {totalQuestions - answeredQuestionsCount} unanswered questions.
                Unanswered questions will be marked as incorrect.
              </AlertDescription>
            </Alert>
          )}

          <div className="py-2">
            <p className="text-sm text-muted-foreground">
              Answered: {answeredQuestionsCount}/{totalQuestions} questions
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Review Answers
            </Button>
            <Button 
              onClick={() => handleSubmitQuiz(false)}
              disabled={submitQuiz.isPending}
            >
              {submitQuiz.isPending ? (
                <Spinner className="mr-2" size="sm" />
              ) : null}
              Submit Quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
