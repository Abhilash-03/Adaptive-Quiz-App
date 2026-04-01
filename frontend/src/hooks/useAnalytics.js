import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services";

// Query keys for cache management
export const analyticsKeys = {
  all: ["analytics"],
  studentDashboard: () => [...analyticsKeys.all, "student", "dashboard"],
  studentProgress: (params) => [...analyticsKeys.all, "student", "progress", params],
  teacherDashboard: () => [...analyticsKeys.all, "teacher", "dashboard"],
  quizAnalytics: (quizId) => [...analyticsKeys.all, "quiz", quizId],
};

// Student dashboard
export function useStudentDashboard(options = {}) {
  return useQuery({
    queryKey: analyticsKeys.studentDashboard(),
    queryFn: analyticsService.getStudentDashboard,
    select: (data) => data.data,
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });
}

// Student progress with time period
export function useStudentProgress(params = {}, options = {}) {
  return useQuery({
    queryKey: analyticsKeys.studentProgress(params),
    queryFn: () => analyticsService.getStudentProgress(params),
    select: (data) => data.data,
    ...options,
  });
}

// Teacher dashboard
export function useTeacherDashboard(options = {}) {
  return useQuery({
    queryKey: analyticsKeys.teacherDashboard(),
    queryFn: analyticsService.getTeacherDashboard,
    select: (data) => data.data,
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });
}

// Quiz analytics (teacher)
export function useQuizAnalytics(quizId, options = {}) {
  return useQuery({
    queryKey: analyticsKeys.quizAnalytics(quizId),
    queryFn: () => analyticsService.getQuizAnalytics(quizId),
    select: (data) => data.data,
    enabled: !!quizId,
    ...options,
  });
}
