import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { quizService } from "@/services";

// Query keys for cache management
export const quizKeys = {
  all: ["quizzes"],
  lists: () => [...quizKeys.all, "list"],
  list: (filters) => [...quizKeys.lists(), filters],
  available: (filters) => [...quizKeys.all, "available", filters],
  details: () => [...quizKeys.all, "detail"],
  detail: (id) => [...quizKeys.details(), id],
  categories: () => [...quizKeys.all, "categories"],
};

// Get all quizzes (teacher)
export function useQuizzes(params = {}) {
  return useQuery({
    queryKey: quizKeys.list(params),
    queryFn: () => quizService.getQuizzes(params),
    select: (data) => data.data,
    placeholderData: keepPreviousData,
  });
}

// Get available quizzes (student)
export function useAvailableQuizzes(params = {}) {
  return useQuery({
    queryKey: quizKeys.available(params),
    queryFn: () => quizService.getAvailableQuizzes(params),
    select: (data) => data.data,
    placeholderData: keepPreviousData,
  });
}

// Get single quiz
export function useQuiz(id, options = {}) {
  return useQuery({
    queryKey: quizKeys.detail(id),
    queryFn: () => quizService.getQuiz(id),
    select: (data) => data.data,
    enabled: !!id,
    ...options,
  });
}

// Get quiz categories
export function useQuizCategories() {
  return useQuery({
    queryKey: quizKeys.categories(),
    queryFn: quizService.getCategories,
    select: (data) => data.data,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Create quiz mutation
export function useCreateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: quizService.createQuiz,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
      toast.success("Quiz created successfully!");
      return data.data;
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create quiz");
    },
  });
}

// Update quiz mutation
export function useUpdateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => quizService.updateQuiz(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: quizKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
      toast.success("Quiz updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update quiz");
    },
  });
}

// Delete quiz mutation
export function useDeleteQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: quizService.deleteQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
      toast.success("Quiz deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete quiz");
    },
  });
}

// Add questions to quiz
export function useAddQuestionsToQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quizId, questionIds }) => quizService.addQuestions(quizId, questionIds),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: quizKeys.detail(variables.quizId) });
      toast.success("Questions added to quiz!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add questions");
    },
  });
}

// Remove questions from quiz
export function useRemoveQuestionsFromQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quizId, questionIds }) => quizService.removeQuestions(quizId, questionIds),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: quizKeys.detail(variables.quizId) });
      toast.success("Questions removed from quiz!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove questions");
    },
  });
}

// Toggle quiz publish status
export function useToggleQuizPublish() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: quizService.togglePublish,
    onSuccess: (data, quizId) => {
      queryClient.invalidateQueries({ queryKey: quizKeys.detail(quizId) });
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
      const isPublished = data.data?.isPublished;
      toast.success(isPublished ? "Quiz published!" : "Quiz unpublished!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to toggle publish status");
    },
  });
}
