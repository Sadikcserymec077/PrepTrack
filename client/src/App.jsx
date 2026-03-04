import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import Dashboard from "./pages/Dashboard/Dashboard";
import Topics from "./pages/Topics/Topics";
import TopicDetail from "./pages/Topics/TopicDetail";
import CalendarPage from "./pages/Calendar/CalendarPage";
import Ranking from "./pages/Ranking/Ranking";
import DailyTasks from "./pages/DailyTasks/DailyTasks";
import Layout from "./components/Layout";

// Error boundary to catch runtime crashes and show a message instead of blank page
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-white text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-gray-400 mb-6 max-w-md text-sm">{this.state.error?.message}</p>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium transition-all"
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400 text-sm">Loading PrepTrack...</span>
        </div>
      </div>
    );
  }
  return currentUser ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return null;
  return !currentUser ? children : <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="daily-tasks" element={<DailyTasks />} />
        <Route path="topics" element={<Topics />} />
        <Route path="topics/:id" element={<TopicDetail />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="ranking" element={<Ranking />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
