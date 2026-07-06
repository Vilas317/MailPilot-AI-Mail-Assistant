import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen sticky top-0 flex flex-col bg-slate-900 dark:bg-slate-950 text-white border-r border-slate-800 transition-colors">

      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📧</span>

          <div>
            <h1 className="text-xl font-bold">
              Processity
            </h1>

            <p className="text-xs text-slate-400">
              Mail AI
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">

        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${
              isActive
                ? "bg-blue-600 text-white shadow-lg"
                : "text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-1"
            }`
          }
        >
          📥 Inbox
        </NavLink>

        <NavLink
          to="/sent"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${
              isActive
                ? "bg-blue-600 text-white shadow-lg"
                : "text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-1"
            }`
          }
        >
          📤 Sent
        </NavLink>

        <NavLink
          to="/compose"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${
              isActive
                ? "bg-blue-600 text-white shadow-lg"
                : "text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-1"
            }`
          }
        >
          ✏️ Compose
        </NavLink>

      </nav>

      {/* Footer */}
      <div className="border-t border-slate-700 px-4 py-5 text-center">

        <p className="text-xs font-semibold text-slate-300">
          Processity Mail AI
        </p>

        <p className="mt-1 text-[11px] text-slate-500">
          Version 1.0.0
        </p>

        <div className="my-3 border-t border-slate-700"></div>

        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
          Designed & Developed by
        </p>

        <p className="mt-1 text-sm font-semibold text-white">
          Vilas Tamrakar
        </p>

        <p className="mt-2 text-[11px] text-slate-500">
          © 2026 All Rights Reserved
        </p>

      </div>

    </aside>
  );
}