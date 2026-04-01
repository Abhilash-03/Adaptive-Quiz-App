import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authService } from "@/services";
import { useAuthStore } from "@/store/authStore";

// Login mutation hook
export function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setAuth(data.data.user, data.data.token);
      toast.success("Login successful!");
      
      if (data.data.user.role === "teacher") {
        navigate("/teacher/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Login failed");
    },
  });
}

// Register mutation hook
export function useRegister() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      setAuth(data.data.user, data.data.token);
      toast.success("Registration successful!");
      
      if (data.data.user.role === "teacher") {
        navigate("/teacher/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Registration failed");
    },
  });
}

// Logout mutation hook
export function useLogout() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      logout();
      queryClient.clear(); // Clear all cached queries
      toast.success("Logged out successfully");
      navigate("/login");
    },
    onError: () => {
      // Still logout locally even if API fails
      logout();
      queryClient.clear();
      navigate("/login");
    },
  });
}
