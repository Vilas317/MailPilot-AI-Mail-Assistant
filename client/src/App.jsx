import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { EmailProvider } from "./context/EmailContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

import MainLayout from "./layouts/MainLayout";

import Inbox from "./pages/Inbox/Inbox";
import Sent from "./pages/Sent/Sent";
import Compose from "./pages/Compose/Compose";
import EmailDetail from "./pages/EmailDetail/EmailDetail";
import Login from "./pages/Login/Login";

function ProtectedRoute({ children }) {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-gray-500 animate-pulse">
          Loading Processity Mail AI...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>

      {/* Public Login Route */}
      <Route
        path="/login"
        element={<Login />}
      />

      {/* Protected Application Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Inbox />} />

        <Route
          path="sent"
          element={<Sent />}
        />

        <Route
          path="compose"
          element={<Compose />}
        />

        <Route
          path="email/:id"
          element={<EmailDetail />}
        />
      </Route>

      {/* Unknown Routes */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <EmailProvider>
        <AppRoutes />
      </EmailProvider>
    </AuthProvider>
  );
}

export default App;