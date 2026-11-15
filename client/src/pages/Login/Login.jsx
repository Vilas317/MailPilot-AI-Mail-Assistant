import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

export default function Login() {
  const navigate = useNavigate();
  const { user, authLoading } = useAuth();

  const handleLogin = () => {
    window.location.href = `${api.defaults.baseURL}/auth/google`;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-gray-500 animate-pulse">
          Checking authentication...
        </p>
      </div>
    );
  }

  if (user) {
    navigate("/", { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10 text-center">

        {/* Logo */}
        <div className="mb-6">
          <div className="text-5xl mb-3">
            📧
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Processity
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Mail AI
          </p>
        </div>

        {/* Welcome */}
        <h2 className="text-2xl font-semibold text-gray-800">
          Welcome Back
        </h2>

        <p className="text-gray-500 mt-2 mb-8">
          Sign in to access your intelligent email assistant.
        </p>

        {/* Google Login */}
        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 px-4 font-medium text-gray-700 hover:bg-gray-50 hover:shadow-md transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="w-5 h-5"
          >
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.05 13.22l7.98 6.19C11.94 13.72 17.4 9.5 24 9.5z"
            />

            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.75 7.18l7.73 6C44.42 37.99 46.98 31.9 46.98 24.55z"
            />

            <path
              fill="#FBBC05"
              d="M10.03 28.59A14.4 14.4 0 0 1 9.25 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.57 10.78l7.46-6.19z"
            />

            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.94-2.13 15.92-5.8l-7.73-6c-2.14 1.44-4.89 2.3-8.19 2.3-6.6 0-12.06-4.22-14.03-10.06l-7.46 6.19C6.51 42.62 14.62 48 24 48z"
            />
          </svg>

          Continue with Google
        </button>

        <p className="text-xs text-gray-400 mt-8">
          Secure authentication powered by Google.
        </p>

        <div className="border-t border-gray-100 mt-8 pt-5">
          <p className="text-xs text-gray-400">
            © 2026 Processity Mail AI
          </p>
        </div>

      </div>

    </div>
  );
}