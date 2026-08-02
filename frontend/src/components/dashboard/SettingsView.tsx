"use client";

import { useState, useEffect } from "react";
import { User, Save, CheckCircle } from "lucide-react";

export function SettingsView() {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    role: ""
  });

  const [org, setOrg] = useState({
    name: "",
    website: ""
  });

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? `Bearer ${token}` : "";
  };

  // Load data from backend on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/v1/settings", {
          headers: { 'Authorization': getAuthHeader() }
        });
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setProfile({
              fullName: result.data.profile.fullName || "",
              email: result.data.profile.email || "",
              role: result.data.profile.role || ""
            });
            setOrg({
              name: result.data.organization.name || "",
              website: result.data.organization.website || ""
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
      }
    };
    
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    
    try {
      // Save Profile
      const profileRes = await fetch("http://localhost:8000/api/v1/settings/profile", {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthHeader()
        },
        body: JSON.stringify({
          full_name: profile.fullName,
          email: profile.email
        })
      });

      // Save Organization
      const orgRes = await fetch("http://localhost:8000/api/v1/settings/organization", {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthHeader()
        },
        body: JSON.stringify({
          name: org.name,
          website: org.website
        })
      });

      if (profileRes.ok && orgRes.ok) {
        // Update local storage user profile name so sidebar updates
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const userObj = JSON.parse(storedUser);
            userObj.full_name = profile.fullName;
            localStorage.setItem("user", JSON.stringify(userObj));
          } catch(e) {}
        }
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          window.location.reload();
        }, 1000);
      } else {
        setError("Failed to save settings. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error("Failed to save settings", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <User className="w-6 h-6 text-primary-600" />
          Profile Details
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          View your profile role and update onboarding brand details.
        </p>
      </div>

      <div className="glass-card p-6 sm:p-8 space-y-6 relative overflow-hidden">
        {showSuccess && (
          <div className="absolute top-4 right-4 text-emerald-600 text-sm font-semibold flex items-center gap-1 animate-in fade-in">
            <CheckCircle className="w-4 h-4" /> Changes saved successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {error && (
            <p className="text-sm text-red-600 font-medium bg-red-50 p-3 rounded-lg text-center">
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
              <input 
                type="text" 
                value={profile.fullName}
                onChange={e => setProfile({...profile, fullName: e.target.value})}
                required
                placeholder="Name"
                className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-white text-slate-800 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
              <input 
                type="email" 
                value={profile.email}
                disabled
                className="w-full border border-slate-200 rounded-lg p-3 text-sm bg-slate-50 text-slate-400 cursor-not-allowed select-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Role</label>
              <input 
                type="text" 
                value={profile.role || "N/A"}
                disabled
                className="w-full border border-slate-200 rounded-lg p-3 text-sm bg-slate-50 text-slate-400 cursor-not-allowed select-none"
              />
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Brand Information</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Brand / Organization Name</label>
                  <input 
                    type="text" 
                    value={org.name}
                    onChange={e => setOrg({...org, name: e.target.value})}
                    required
                    placeholder="Brand Name"
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-white text-slate-800 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Brand Domain / Website</label>
                  <input 
                    type="url" 
                    value={org.website}
                    onChange={e => setOrg({...org, website: e.target.value})}
                    placeholder="https://example.com"
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-white text-slate-800 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button 
              type="submit"
              disabled={isSaving}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Profile Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
