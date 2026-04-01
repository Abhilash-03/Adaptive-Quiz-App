import api from "@/lib/api";

export const userService = {
  // Get current user's profile
  getProfile: async () => {
    const response = await api.get("/users/profile");
    return response.data;
  },

  // Update profile
  updateProfile: async (data) => {
    const response = await api.put("/users/profile", data);
    return response.data;
  },

  // Change password
  changePassword: async (data) => {
    const response = await api.put("/users/password", data);
    return response.data;
  },

  // Get all users (teacher only)
  getUsers: async (params = {}) => {
    const response = await api.get("/users", { params });
    return response.data;
  },

  // Get user by ID (teacher only)
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Toggle user status (teacher only)
  toggleUserStatus: async (id) => {
    const response = await api.patch(`/users/${id}/status`);
    return response.data;
  },
};

export default userService;
