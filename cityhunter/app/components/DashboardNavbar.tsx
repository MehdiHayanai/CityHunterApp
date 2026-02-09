"use client";

import Link from "next/link";
import { useThemeContext } from "../context/ThemeContext";
import { useAuthStore } from "../../store/useAuthStore";
import LevelProgressBar from "./shared/LevelProgressBar";

interface DashboardNavbarProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export default function DashboardNavbar({ activeTab, setActiveTab }: DashboardNavbarProps) {
  const { theme, toggleTheme } = useThemeContext();
  const { user, logout } = useAuthStore();
  const handleLogout = () => {
    logout();
    // Redirect is handled in store
  };

  return (
    <nav className="w-full h-16 border-b border-divider/10 bg-surface/90 backdrop-blur sticky top-0 z-50 flex items-center justify-between px-6 shrink-0 transition-colors duration-300">
      <div className="flex items-center gap-6">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary text-canvas flex items-center justify-center rounded-lg font-black text-xl tracking-tighter group-hover:bg-accent group-hover:text-black transition-colors">
            CH
          </div>
          <h1 className="text-xl font-black tracking-tighter text-primary">CITY<span className="text-accent">HUNTER</span></h1>
        </Link>
        
        <div className="hidden md:flex h-8 w-[1px] bg-divider/20 mx-2"></div>

        <Link 
          href="/social" 
          className="hidden md:flex px-4 py-1 text-xs font-bold rounded hover:bg-surface hover:text-accent transition-colors text-secondary hover:underline"
        >
          SOCIAL <sup className="text-[9px] text-accent ml-0.5">NEW</sup>
        </Link>

        {user?.role === 'admin' && (
          <Link 
            href="/admin" 
            className="hidden md:flex ml-2 px-4 py-1 text-xs font-bold rounded bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
          >
            ADMIN
          </Link>
        )}
        
        <div className="hidden md:flex h-8 w-[1px] bg-divider/20 mx-2"></div>
        
        {/* Tab Navigation (Only shows if props are provided) */}
        {setActiveTab && activeTab && (
          <div className="hidden md:flex gap-1 bg-canvas p-1 rounded-lg border border-divider/10">
            {['Monument', 'Event', 'Walk'].map(item => (
              <button 
                key={item} 
                onClick={() => setActiveTab(item)}
                className={`px-4 py-1 text-xs font-bold rounded hover:bg-surface hover:text-accent transition-colors ${activeTab === item ? 'bg-surface shadow-sm text-primary' : 'text-secondary'}`}
              >
                {item.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-5">
        <div className="hidden md:flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-mono text-accent">{(user?.xp || 0).toLocaleString()} XP</div>
            <LevelProgressBar 
              currentXp={user?.xp || 0}
              nextLevelXp={user?.nextLevelXp || 5000}
              level={user?.level || 1}
              className="h-1.5 w-24 mt-1"
            />
          </div>
        </div>

        <button 
          onClick={toggleTheme} 
          className="w-9 h-9 rounded-full border border-divider/10 bg-canvas text-secondary hover:text-accent hover:border-accent transition-all flex items-center justify-center cursor-pointer"
          aria-label="Toggle Theme"
        >
          <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
        </button>

        <button 
          onClick={handleLogout}
          className="w-9 h-9 rounded-full border border-divider/10 bg-canvas text-secondary hover:text-red-500 hover:border-red-500 transition-all flex items-center justify-center cursor-pointer"
          title="Logout"
        >
          <i className="fa-solid fa-power-off"></i>
        </button>

        <div className="flex items-center gap-3 pl-5 border-l border-divider/10">
          <div className="hidden sm:block text-right leading-none">
            <div className="font-bold text-sm text-primary">{user?.handle || 'Hunter'}</div>
            <div className="text-[10px] font-mono text-secondary mt-1">Level {user?.level || 1}</div>
          </div>
          <Link href="/dashboard/profile" className="w-10 h-10 rounded-full border-2 border-surface shadow-sm overflow-hidden group">
            <img src={user?.avatar || "https://api.dicebear.com/9.x/dylan/svg?seed=Hunter"} alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
