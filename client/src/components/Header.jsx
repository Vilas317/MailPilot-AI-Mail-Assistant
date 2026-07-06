import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Header() {
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
    <div className="h-16 bg-white shadow flex items-center justify-between px-6">
      <h2 className="text-xl font-semibold">
        Processity Mail AI
      </h2>

      {user ? (
        <div className="flex items-center gap-3">
          <img
            src={user?.photos?.[0]?.value || "https://ui-avatars.com/api/?name=User"}
            alt="Profile"
            className="w-10 h-10 rounded-full"
          />

          <span className="font-medium text-gray-700">
            {user.displayName}
          </span>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 transition text-white px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      ) : (
        <button
          onClick={handleLogin}
          className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded-lg"
        >
          Login
        </button>
      )}
    </div>
  );
}