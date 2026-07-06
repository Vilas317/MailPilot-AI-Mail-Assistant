import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import AssistantPanel from "../components/AssistantPanel";

export default function MainLayout() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <div className="h-screen flex bg-slate-100 dark:bg-slate-900 transition-colors duration-300">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Header
          darkMode={darkMode}
          toggleTheme={toggleTheme}
        />

        <div className="flex flex-1 overflow-hidden">

          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>

          <AssistantPanel />

        </div>

      </div>

    </div>
  );
}