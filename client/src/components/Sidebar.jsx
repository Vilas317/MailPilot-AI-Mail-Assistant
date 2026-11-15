import { NavLink } from "react-router-dom";
import { Inbox, Send, PenSquare, Mail } from "lucide-react";
import { useEmail } from "../context/EmailContext";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { refreshInbox, refreshSent } = useEmail();
  const { user } = useAuth();
  const links = [
    { to: "/", label: "Inbox", Icon: Inbox, action: refreshInbox, end: true },
    { to: "/sent", label: "Sent", Icon: Send, action: refreshSent },
    { to: "/compose", label: "Compose", Icon: PenSquare },
  ];

  return (
    <aside className="app-sidebar">
      <div className="flex items-center gap-3 px-2 mb-2">
        <div className="brand-mark"><Mail size={20} strokeWidth={2.2} /></div>
        <div className="brand-copy"><h1 className="font-bold text-[16px] tracking-tight">MailPilot</h1><p className="text-[11px] text-[#86868b] mt-0.5">AI Mail Assistant</p></div>
      </div>
      <p className="nav-section">Mailbox</p>
      <nav className="space-y-1">
        {links.map(({ to, label, Icon, action, end }) => (
          <NavLink key={to} to={to} end={end} onClick={action} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            <Icon size={17} /><span className="nav-label">{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="flex items-center gap-3 min-w-0">
          <img src={user?.photos?.[0]?.value || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || "User")}&background=e8f0fc&color=245b9a`} alt="Profile" className="w-9 h-9 rounded-full" />
          <div className="min-w-0 brand-copy"><p className="text-xs font-semibold truncate">{user?.displayName || "Your account"}</p><p className="text-[10px] text-[#86868b] truncate">{user?.emails?.[0]?.value || "Connected account"}</p></div>
        </div>
        <p className="text-[10px] text-[#a1a1a6] mt-4 brand-copy">MailPilot - AI Mail Assistant · v1.0.0</p>
      </div>
    </aside>
  );
}
