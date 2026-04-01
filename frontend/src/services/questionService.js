import api from "@/lib/api";

export const questionService = {
  // Get all questions (teacher)
  getQuestions: async (params = {}) => {
    const response = await api.get("/questions", { params });
    return response.data;
  },

  // Get single question
  getQuestion: async (id) => {
    const response = await api.get(`/questions/${id}`);
    return response.data;
  },

  // Create question (teacher)
  createQuestion: async (data) => {
    const response = await api.post("/questions", data);
    return response.data;
  },

  // Update question (teacher)
  updateQuestion: async (id, data) => {
    const response = await api.put(`/questions/${id}`, data);
    return response.data;
  },

  // Delete question (teacher)
  deleteQuestion: async (id) => {
    const response = await api.delete(`/questions/${id}`);
    return response.data;
  },

  // Get categories
  getCategories: async () => {
    const response = await api.get("/questions/categories");
    return response.data;
  },

  // Get topics by category
  getTopics: async (category) => {
    const response = await api.get(`/questions/topics/${category}`);
    return response.data;
  },
};

export default questionService;
