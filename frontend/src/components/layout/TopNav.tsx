"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Search, Menu, User, LogOut, ChevronDown } from "lucide-react";
import { clsx } from "clsx";

export function TopNav({ onMenuToggle, onBrandClick, onLogout }: { onMenuToggle: () => void, onBrandClick?: () => void, onLogout?: () => void }) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<{full_name?: string, role?: string, email?: string} | null>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {}
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (onLogout) {
      onLogout();
    } else {
      window.location.href = "/login";
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuToggle}
          className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-64 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent transition-all">
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search assets, trends..." 
            className="bg-transparent border-none outline-none text-sm w-full text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Brand Button */}
        {onBrandClick && (
          <button
            onClick={onBrandClick}
            className="hidden md:flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
          >
            Brand
          </button>
        )}

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
            className={clsx(
              "p-2 text-slate-500 rounded-full relative transition-colors",
              isNotifOpen ? "bg-slate-100" : "hover:bg-slate-100"
            )}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <span className="font-semibold text-slate-800 text-sm">Notifications</span>
                <span className="text-xs text-primary-600 font-medium cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                <div className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors">
                  <p className="text-sm text-slate-800 font-medium">New AI Insights Available</p>
                  <p className="text-xs text-slate-500 mt-0.5">Your Q3 Campaign was analyzed. Tone consistency is 94%.</p>
                  <p className="text-[10px] text-slate-400 mt-1">10 mins ago</p>
                </div>
                <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors">
                  <p className="text-sm text-slate-800 font-medium">Asset Flagged: Summer_Sale.jpg</p>
                  <p className="text-xs text-slate-500 mt-0.5">Visual drift detected. Colors outside of brand palette.</p>
                  <p className="text-[10px] text-slate-400 mt-1">2 hours ago</p>
                </div>
              </div>
              <div className="px-4 py-2 border-t border-slate-100 text-center">
                <a href="#" className="text-xs font-medium text-primary-600 hover:text-primary-700">View all notifications</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
