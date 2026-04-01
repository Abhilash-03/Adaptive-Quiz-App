import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { questionService } from "@/services";

// Query keys for cache management
export const questionKeys = {
  all: ["questions"],
  lists: () => [...questionKeys.all, "list"],
  list: (filters) => [...questionKeys.lists(), filters],
  details: () => [...questionKeys.all, "detail"],
  detail: (id) => [...questionKeys.details(), id],
  categories: () => [...questionKeys.all, "categories"],
  topics: (category) => [...questionKeys.all, "topics", category],
};

// Get all questions with filters
export function useQuestions(params = {}) {
  return useQuery({
    queryKey: questionKeys.list(params),
    queryFn: () => questionService.getQuestions(params),
    select: (data) => data.data,
    placeholderData: keepPreviousData,
  });
}

// Get single question
export function useQuestion(id, options = {}) {
  return useQuery({
    queryKey: questionKeys.detail(id),
    queryFn: () => questionService.getQuestion(id),
    select: (data) => data.data,
    enabled: !!id,
    ...options,
  });
}

// Get question categories
export function useQuestionCategories() {
  return useQuery({
    queryKey: questionKeys.categories(),
    queryFn: questionService.getCategories,
    select: (data) => data.data,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Get topics by category
export function useQuestionTopics(category) {
  return useQuery({
    queryKey: questionKeys.topics(category),
    queryFn: () => questionService.getTopics(category),
    select: (data) => data.data,
    enabled: !!category,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Create question mutation
export function useCreateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: questionService.createQuestion,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: questionKeys.categories() });
      toast.success("Question created successfully!");
      return data.data;
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create question");
    },
  });
}

// Update question mutation
export function useUpdateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => questionService.updateQuestion(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: questionKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
      toast.success("Question updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update question");
    },
  });
}

// Delete question mutation
export function useDeleteQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: questionService.deleteQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
      toast.success("Question deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete question");
    },
  });
}

// Bulk delete questions
export function useBulkDeleteQuestions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids) => {
      const results = await Promise.allSettled(
        ids.map((id) => questionService.deleteQuestion(id))
      );
      const failed = results.filter((r) => r.status === "rejected").length;
      if (failed > 0) {
        throw new Error(`Failed to delete ${failed} question(s)`);
      }
      return results;
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
      toast.success(`${ids.length} question(s) deleted successfully!`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete questions");
    },
  });
}
