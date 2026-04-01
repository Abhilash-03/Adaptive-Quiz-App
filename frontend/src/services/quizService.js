import api from "@/lib/api";

export const quizService = {
  // Get available quizzes for students
  getAvailableQuizzes: async (params = {}) => {
    const response = await api.get("/quizzes/available", { params });
    return response.data;
  },

  // Get all quizzes (teacher)
  getQuizzes: async (params = {}) => {
    const response = await api.get("/quizzes", { params });
    return response.data;
  },

  // Get single quiz
  getQuiz: async (id) => {
    const response = await api.get(`/quizzes/${id}`);
    return response.data;
  },

  // Create quiz (teacher)
  createQuiz: async (data) => {
    const response = await api.post("/quizzes", data);
    return response.data;
  },

  // Update quiz (teacher)
  updateQuiz: async (id, data) => {
    const response = await api.put(`/quizzes/${id}`, data);
    return response.data;
  },

  // Delete quiz (teacher)
  deleteQuiz: async (id) => {
    const response = await api.delete(`/quizzes/${id}`);
    return response.data;
  },

  // Add questions to quiz
  addQuestions: async (quizId, questionIds) => {
    const response = await api.post(`/quizzes/${quizId}/questions`, { questionIds });
    return response.data;
  },

  // Remove questions from quiz
  removeQuestions: async (quizId, questionIds) => {
    const response = await api.delete(`/quizzes/${quizId}/questions`, { data: { questionIds } });
    return response.data;
  },

  // Toggle publish status
  togglePublish: async (id) => {
    const response = await api.patch(`/quizzes/${id}/publish`);
    return response.data;
  },

  // Get categories
  getCategories: async () => {
    const response = await api.get("/quizzes/categories");
    return response.data;
  },
};

export default quizService;
