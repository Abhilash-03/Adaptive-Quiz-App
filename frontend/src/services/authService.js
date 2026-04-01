import api from "@/lib/api";

export const authService = {
  // Register a new user
  register: async (data) => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  // Login user
  login: async (data) => {
    const response = await api.post("/auth/login", data);
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  // Get current user
  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  // Google OAuth URL
  getGoogleAuthUrl: () => {
    const baseUrl = import.meta.env.VITE_API_URL || "/api";
    return `${baseUrl}/auth/google`;
  },
};

export default authService;
