import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { attemptService } from "@/services";

// Query keys for cache management
export const attemptKeys = {
  all: ["attempts"],
  lists: () => [...attemptKeys.all, "list"],
  list: (filters) => [...attemptKeys.lists(), filters],
  myAttempts: (filters) => [...attemptKeys.all, "my-attempts", filters],
  details: () => [...attemptKeys.all, "detail"],
  detail: (id) => [...attemptKeys.details(), id],
  leaderboard: (quizId) => [...attemptKeys.all, "leaderboard", quizId],
};

// Get my attempts (student)
export function useMyAttempts(params = {}) {
  return useQuery({
    queryKey: attemptKeys.myAttempts(params),
    queryFn: () => attemptService.getMyAttempts(params),
    select: (data) => data.data,
    placeholderData: keepPreviousData,
  });
}

// Get single attempt
export function useAttempt(attemptId, options = {}) {
  return useQuery({
    queryKey: attemptKeys.detail(attemptId),
    queryFn: () => attemptService.getAttempt(attemptId),
    select: (data) => data.data,
    enabled: !!attemptId,
    ...options,
  });
}

// Get leaderboard for a quiz
export function useLeaderboard(quizId, options = {}) {
  return useQuery({
    queryKey: attemptKeys.leaderboard(quizId),
    queryFn: () => attemptService.getLeaderboard(quizId),
    select: (data) => data.data,
    enabled: !!quizId,
    ...options,
  });
}

// Start quiz attempt mutation
export function useStartAttempt() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: attemptService.startAttempt,
    onSuccess: (data, quizId) => {
      const attemptId = data.data?.attempt?._id || data.data?.attempt || data.data?._id;
      queryClient.invalidateQueries({ queryKey: attemptKeys.myAttempts({}) });
      toast.success("Quiz started! Good luck!");
      // Navigate to the quiz taking page
      navigate(`/student/quiz/${quizId}/attempt/${attemptId}`);
      return data.data;
    },
    onError: (error) => {
      toast.error(error.message || "Failed to start quiz");
    },
  });
}

// Submit answer mutation
export function useSubmitAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ attemptId, data }) => attemptService.submitAnswer(attemptId, data),
    onSuccess: (data, variables) => {
      // Update attempt cache with new data
      queryClient.setQueryData(attemptKeys.detail(variables.attemptId), (old) => {
        if (!old) return data;
        return {
          ...old,
          data: {
            ...old.data,
            ...data.data,
          },
        };
      });
      return data.data;
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit answer");
    },
  });
}

// Submit quiz (finish attempt) mutation
export function useSubmitQuiz() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ attemptId, answers }) => attemptService.submitQuiz(attemptId, answers),
    onSuccess: (data, variables) => {
      const { attemptId } = variables;
      queryClient.invalidateQueries({ queryKey: attemptKeys.detail(attemptId) });
      queryClient.invalidateQueries({ queryKey: attemptKeys.myAttempts({}) });
      queryClient.invalidateQueries({ queryKey: ["studentDashboard"] });
      
      const result = data.data;
      if (result?.isPassed) {
        toast.success(`Congratulations! You passed with ${Math.round(result.percentage)}%!`);
      } else {
        toast.error(`Quiz completed. Score: ${Math.round(result?.percentage || 0)}%`);
      }
      
      return data.data;
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit quiz");
    },
  });
}
