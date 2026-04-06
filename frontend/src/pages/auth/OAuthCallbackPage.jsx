import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Spinner } from "@/components/ui";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();
  const processed = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent double processing in StrictMode
      if (processed.current) return;
      processed.current = true;

      const token = searchParams.get("token");
      const error = searchParams.get("error");

      if (error) {
        toast.error("Google authentication failed. Please try again.");
        navigate("/login", { replace: true });
        return;
      }

      if (!token) {
        toast.error("Authentication failed. No token received.");
        navigate("/login", { replace: true });
        return;
      }

      try {
        // Fetch user data with the NEW token directly in header
        // (store still has old token, so we must pass it explicitly)
        const response = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const user = response.data.data;

        // Set auth state with new user and token
        setAuth(user, token);

        toast.success(`Welcome back, ${user.fullname}!`);

        // Redirect based on role
        if (user.role === "teacher") {
          navigate("/teacher/dashboard", { replace: true });
        } else {
          navigate("/student/dashboard", { replace: true });
        }
      } catch (err) {
        console.error("OAuth callback error:", err);
        toast.error("Authentication failed. Please try again.");
        navigate("/login", { replace: true });
      }
    };

    handleCallback();
  }, [searchParams, navigate, setAuth]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <Spinner size="lg" />
      <p className="mt-4 text-muted-foreground">Completing sign in...</p>
    </div>
  );
}
