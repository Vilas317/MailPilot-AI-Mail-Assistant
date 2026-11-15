import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, LogOut, Bell } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useEmail } from "../context/EmailContext";

export default function Header() {
  const { user, logout } = useAuth();
  const { openSearch } = useEmail();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSearch = (event) => {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    openSearch(value);
    navigate("/");
  };

  const handleLogout = async () => {
    await logout();
    toast.success("You have been logged out.");
    navigate("/login", { replace: true });
  };

  return (
    <header className="app-header">
      <div className="hidden sm:block"><p className="text-[12px] text-[#86868b]">Mail <span className="mx-1">/</span><span className="text-[#1d1d1f]">Workspace</span></p></div>
      <div className="flex items-center gap-3 ml-auto">
        <form onSubmit={handleSearch} className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86868b] pointer-events-none" />
          <input aria-label="Search mail" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search mail..." className="top-search pl-9" />
        </form>
        <button type="button" title="Notifications" className="w-9 h-9 grid place-items-center rounded-full text-[#6e6e73] hover:bg-[#f5f5f7]"><Bell size={17}/></button>
        {user && <img src={user?.photos?.[0]?.value || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || "User")}`} alt="Profile" title={user.displayName} className="w-9 h-9 rounded-full" />}
        <button onClick={handleLogout} title="Log out" className="w-9 h-9 grid place-items-center rounded-full text-[#6e6e73] hover:bg-[#fff1f0] hover:text-[#d70015]"><LogOut size={17}/></button>
      </div>
    </header>
  );
}
