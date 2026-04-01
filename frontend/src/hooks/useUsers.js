import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { userService } from "@/services";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

// Query keys for cache management
export const userKeys = {
  all: ["users"],
  list: (params) => [...userKeys.all, "list", params],
  detail: (id) => [...userKeys.all, "detail", id],
  profile: () => [...userKeys.all, "profile"],
};

// Get current user's profile
export function useProfile(options = {}) {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: userService.getProfile,
    select: (data) => data.data,
    ...options,
  });
}

// Update profile
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
      // Update auth store with new user data
      if (data.data) {
        setUser(data.data);
      }
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update profile");
    },
  });
}

// Change password
export function useChangePassword() {
  return useMutation({
    mutationFn: userService.changePassword,
    onSuccess: () => {
      toast.success("Password changed successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to change password");
    },
  });
}

// Get all users (teacher only)
export function useUsers(params = {}, options = {}) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userService.getUsers(params),
    select: (data) => data.data,
    placeholderData: keepPreviousData,
    ...options,
  });
}

// Get user by ID (teacher only)
export function useUser(id, options = {}) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.getUserById(id),
    select: (data) => data.data,
    enabled: !!id,
    ...options,
  });
}

// Toggle user status (teacher only)
export function useToggleUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.toggleUserStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success("User status updated");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update user status");
    },
  });
}
