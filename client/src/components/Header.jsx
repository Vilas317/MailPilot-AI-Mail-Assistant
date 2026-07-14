import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Header({ darkMode, toggleTheme }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api
      .get("/auth/success")
      .then((res) => {
        if (res.data.success) {
          setUser(res.data.user);
        }
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const handleLogout = () => {
    window.location.href = `${API_URL}/auth/logout`;
  };

  return (
    <div className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow flex items-center justify-between px-6 transition-colors">

<h2 className="text-xl font-semibold text-slate-800 dark:text-white">
MailPilot AI Mail Assistant
</h2>

      <div className="flex items-center gap-4">

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 hover:scale-105 transition flex items-center justify-center text-xl"
          title="Toggle Theme"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>

        {user ? (
          <>
            <img
              src={
                user?.photos?.[0]?.value ||
                "https://ui-avatars.com/api/?name=User"
              }
              alt="Profile"
              className="w-10 h-10 rounded-full border"
            />

            <span className="font-medium text-slate-700 dark:text-slate-200">
              {user.displayName}
            </span>

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 transition text-white px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={handleLogin}
            className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded-lg"
          >
            Login
          </button>
        )}
      </div>
    </div>
  );
}