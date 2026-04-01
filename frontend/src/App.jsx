import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import { useAuthStore } from "@/store/authStore";

// Layouts
import DashboardLayout from "@/layouts/DashboardLayout";

// Auth Pages
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";

// Student Pages
import StudentDashboard from "@/pages/student/StudentDashboard";
import StudentQuizzesPage from "@/pages/student/StudentQuizzesPage";
import QuizDetailPage from "@/pages/student/QuizDetailPage";
import TakeQuizPage from "@/pages/student/TakeQuizPage";
import AttemptsPage from "@/pages/student/AttemptsPage";
import AttemptDetailPage from "@/pages/student/AttemptDetailPage";

// Teacher Pages
import TeacherDashboard from "@/pages/teacher/TeacherDashboard";
import QuestionsPage from "@/pages/teacher/QuestionsPage";
import QuestionFormPage from "@/pages/teacher/QuestionFormPage";
import TeacherQuizzesPage from "@/pages/teacher/QuizzesPage";
import QuizFormPage from "@/pages/teacher/QuizFormPage";
import TeacherQuizDetailPage from "@/pages/teacher/QuizDetailPage";

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on role
    if (user?.role === "teacher") {
      return <Navigate to="/teacher/dashboard" replace />;
    }
    return <Navigate to="/student/dashboard" replace />;
  }

  return children;
}

// Public Route - Redirect if already logged in
function PublicRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    if (user?.role === "teacher") {
      return <Navigate to="/teacher/dashboard" replace />;
    }
    return <Navigate to="/student/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="quizzes" element={<StudentQuizzesPage />} />
            <Route path="quiz/:quizId" element={<QuizDetailPage />} />
            <Route path="quiz/:quizId/attempt/:attemptId" element={<TakeQuizPage />} />
            <Route path="attempts" element={<AttemptsPage />} />
            <Route path="attempt/:attemptId" element={<AttemptDetailPage />} />
            <Route path="notifications" element={<div className="p-6">Notifications - Coming Soon</div>} />
            <Route path="profile" element={<div className="p-6">Profile - Coming Soon</div>} />
            <Route path="settings" element={<div className="p-6">Settings - Coming Soon</div>} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Teacher Routes */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="questions" element={<QuestionsPage />} />
            <Route path="questions/new" element={<QuestionFormPage />} />
            <Route path="question/:questionId" element={<QuestionFormPage />} />
            <Route path="question/:questionId/edit" element={<QuestionFormPage />} />
            <Route path="quizzes" element={<TeacherQuizzesPage />} />
            <Route path="quizzes/new" element={<QuizFormPage />} />
            <Route path="quiz/:quizId" element={<TeacherQuizDetailPage />} />
            <Route path="quiz/:quizId/edit" element={<QuizFormPage />} />
            <Route path="students" element={<div className="p-6">Students - Coming Soon</div>} />
            <Route path="notifications" element={<div className="p-6">Notifications - Coming Soon</div>} />
            <Route path="profile" element={<div className="p-6">Profile - Coming Soon</div>} />
            <Route path="settings" element={<div className="p-6">Settings - Coming Soon</div>} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* 404 */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          success: {
            style: {
              background: "#10b981",
              color: "white",
              border: "none",
            },
            iconTheme: {
              primary: "white",
              secondary: "#10b981",
            },
          },
          error: {
            style: {
              background: "#ef4444",
              color: "white",
              border: "none",
            },
            iconTheme: {
              primary: "white",
              secondary: "#ef4444",
            },
          },
          loading: {
            style: {
              background: "#3b82f6",
              color: "white",
              border: "none",
            },
          },
        }}
        containerStyle={{
          zIndex: 9999,
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
