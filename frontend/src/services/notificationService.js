import api from "@/lib/api";

export const notificationService = {
  // Get user's notifications
  getNotifications: async (params = {}) => {
    const response = await api.get("/notifications", { params });
    return response.data;
  },

  // Mark single notification as read
  markAsRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await api.patch("/notifications/read-all");
    return response.data;
  },

  // Delete single notification
  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  // Delete all read notifications
  deleteReadNotifications: async () => {
    const response = await api.delete("/notifications/read");
    return response.data;
  },

  // Send notification (teacher only)
  sendNotification: async (data) => {
    const response = await api.post("/notifications/send", data);
    return response.data;
  },
};

export default notificationService;
