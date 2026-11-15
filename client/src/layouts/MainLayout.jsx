import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import AssistantPanel from "../components/AssistantPanel";

export default function MainLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <section className="app-main">
        <Header />
        <div className="app-content-row">
          <main className="app-content"><Outlet /></main>
          <AssistantPanel />
        </div>
      </section>
    </div>
  );
}
