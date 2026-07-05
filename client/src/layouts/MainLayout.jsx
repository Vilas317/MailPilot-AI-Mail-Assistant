import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import AssistantPanel from "../components/AssistantPanel";

export default function MainLayout() {
  return (
    <div className="h-screen flex bg-slate-100">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Header />

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