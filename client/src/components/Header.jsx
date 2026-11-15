import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <div className="h-16 bg-white shadow flex items-center justify-between px-6">

      <h2 className="text-xl font-semibold">
        Processity Mail AI
      </h2>

      {user && (
        <div className="flex items-center gap-3">

          <img
            src={
              user?.photos?.[0]?.value ||
              "https://ui-avatars.com/api/?name=User"
            }
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
      )}

    </div>
  );
}