import api from "@/lib/api";

export const analyticsService = {
  // Student dashboard
  getStudentDashboard: async () => {
    const response = await api.get("/analytics/student/dashboard");
    return response.data;
  },

  // Student progress
  getStudentProgress: async (params = {}) => {
    const response = await api.get("/analytics/student/progress", { params });
    return response.data;
  },

  // Teacher dashboard
  getTeacherDashboard: async () => {
    const response = await api.get("/analytics/teacher/dashboard");
    return response.data;
  },

  // Get quiz analytics (teacher)
  getQuizAnalytics: async (quizId) => {
    const response = await api.get(`/analytics/quiz/${quizId}`);
    return response.data;
  },
};

export default analyticsService;
