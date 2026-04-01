import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services";
import { toast } from "sonner";

// Query keys for cache management
export const notificationKeys = {
  all: ["notifications"],
  list: (params) => [...notificationKeys.all, "list", params],
  unreadCount: () => [...notificationKeys.all, "unread-count"],
};

// Get user's notifications
export function useNotifications(params = {}, options = {}) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationService.getNotifications(params),
    select: (data) => data.data,
    ...options,
  });
}

// Get unread count (derived from notifications)
export function useUnreadNotificationsCount(options = {}) {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationService.getNotifications({ unread: true }),
    select: (data) => data.data?.notifications?.length || 0,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Poll every minute
    ...options,
  });
}

// Mark single notification as read
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

// Mark all as read
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success("All notifications marked as read");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to mark all as read");
    },
  });
}

// Delete single notification
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationService.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success("Notification deleted");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete notification");
    },
  });
}

// Delete all read notifications
export function useDeleteReadNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationService.deleteReadNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success("Read notifications cleared");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete notifications");
    },
  });
}

// Send notification (teacher only)
export function useSendNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationService.sendNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success("Notification sent successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to send notification");
    },
  });
}
