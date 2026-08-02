"use client";

import { 
  LayoutDashboard, 
  UploadCloud, 
  Fingerprint, 
  CheckCircle, 
  TrendingUp, 
  Activity, 
  Bot, 
  Settings,
  UserCircle,
  LogOut,
  Search
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useState, useEffect } from "react";

const navItems = [
  { name: "Dashboard", id: "dashboard", icon: LayoutDashboard },
  { name: "Asset Ingestion", id: "assets", icon: UploadCloud },
  { name: "Layered Analysis", id: "layered-analysis", icon: Search },
  { name: "Trend Analytics", id: "trends", icon: TrendingUp },
  { name: "Impact Simulation", id: "simulation", icon: Activity },
];

export function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen, onLogout }: { activeTab: string, setActiveTab: (tab: string) => void, isOpen: boolean, setIsOpen: (open: boolean) => void, onLogout?: () => void }) {
  const [user, setUser] = useState<{full_name?: string, role?: string, email?: string} | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (onLogout) {
      onLogout();
    } else {
      window.location.href = "/";
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside className={twMerge(
        "fixed md:sticky top-0 z-30 h-screen w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 font-bold overflow-hidden relative">
              <img src="/logo.jpeg" alt="Klyro" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">KLYRO</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={twMerge(
                  clsx(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                    isActive
                      ? "bg-primary-50 text-primary-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )
                )}
              >
                <Icon className={clsx("w-5 h-5", isActive ? "text-primary-600" : "text-slate-400")} />
                {item.name}
              </button>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-slate-100 flex flex-col gap-2">
          <div 
            onClick={() => {
              setActiveTab("settings");
              setIsOpen(false);
            }}
            className={twMerge(
              clsx(
                "flex items-center justify-between group cursor-pointer hover:bg-slate-50 transition-colors p-2 rounded-lg",
                activeTab === "settings" && "bg-primary-50"
              )
            )}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg shrink-0">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : <UserCircle className="w-6 h-6" />}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-slate-800 truncate">{user?.full_name || "User"}</span>
                <span className="text-xs text-slate-500 truncate">{user?.email || "user@example.com"}</span>
              </div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }} 
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
