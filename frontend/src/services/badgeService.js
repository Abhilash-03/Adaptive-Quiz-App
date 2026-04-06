import api from "@/lib/api";

const badgeService = {
  // Get all badge definitions
  getAllBadges: async () => {
    const response = await api.get("/badges");
    return response.data.data;
  },

  // Get current user's badges
  getMyBadges: async () => {
    const response = await api.get("/badges/my");
    return response.data.data;
  },

  // Get a user's badges by ID
  getUserBadges: async (userId) => {
    const response = await api.get(`/badges/user/${userId}`);
    return response.data.data;
  },

  // Get recently earned badges
  getRecentBadges: async (days = 7) => {
    const response = await api.get(`/badges/recent?days=${days}`);
    return response.data.data;
  },

  // Get badge leaderboard
  getLeaderboard: async (limit = 10) => {
    const response = await api.get(`/badges/leaderboard?limit=${limit}`);
    return response.data.data;
  },
};

export default badgeService;
