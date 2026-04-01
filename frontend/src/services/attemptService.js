import api from "@/lib/api";

export const attemptService = {
  // Start a quiz attempt
  startAttempt: async (quizId) => {
    const response = await api.post(`/attempts/${quizId}/start`);
    return response.data;
  },

  // Submit an answer
  submitAnswer: async (attemptId, data) => {
    const response = await api.post(`/attempts/${attemptId}/answer`, data);
    return response.data;
  },

  // Submit quiz (finish attempt)
  submitQuiz: async (attemptId, answers) => {
    const response = await api.post(`/attempts/${attemptId}/submit`, { answers });
    return response.data;
  },

  // Get attempt details
  getAttempt: async (attemptId) => {
    const response = await api.get(`/attempts/${attemptId}`);
    return response.data;
  },

  // Get my attempts
  getMyAttempts: async (params = {}) => {
    const response = await api.get("/attempts/my-attempts", { params });
    return response.data;
  },

  // Get leaderboard for a quiz
  getLeaderboard: async (quizId) => {
    const response = await api.get(`/attempts/quiz/${quizId}/leaderboard`);
    return response.data;
  },
};

export default attemptService;
