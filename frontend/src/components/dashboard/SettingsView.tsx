"use client";

import { useState, useEffect } from "react";
import { User, Building2, Key, Bell, Save, CheckCircle, Shield, CreditCard } from "lucide-react";
import { clsx } from "clsx";

export function SettingsView() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form States
  const [profile, setProfile] = useState({
    fullName: "Admin User",
    email: "admin@klyro.com",
    role: "Brand Manager"
  });

  const [org, setOrg] = useState({
    name: "SheBuilds Demo Org",
    industry: "Technology",
    website: "https://example.com"
  });

  const [apiKeys, setApiKeys] = useState({
    groq: "",
    openai: ""
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    weeklyReport: true,
    securityAlerts: true
  });

  // Load data from backend on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/v1/settings", {
          headers: { 'Authorization': 'Bearer mock_token_for_development' }
        });
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setProfile(prev => ({ ...prev, ...result.data.profile }));
            setOrg(prev => ({ ...prev, ...result.data.organization }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
      }
    };
    
    fetchSettings();

    const savedGroq = localStorage.getItem("groq_api_key");
    if (savedGroq) setApiKeys(prev => ({ ...prev, groq: savedGroq }));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Save API keys to local storage for use in other components
      if (apiKeys.groq) localStorage.setItem("groq_api_key", apiKeys.groq);
      
      // Save Profile
      await fetch("http://localhost:8000/api/v1/settings/profile", {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock_token_for_development'
        },
        body: JSON.stringify({
          full_name: profile.fullName,
          email: profile.email
        })
      });

      // Save Organization
      await fetch("http://localhost:8000/api/v1/settings/organization", {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock_token_for_development'
        },
        body: JSON.stringify({
          name: org.name,
          industry: org.industry,
          website: org.website
        })
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save settings", err);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "profile", label: "My Profile", icon: User },
    { id: "organization", label: "Organization", icon: Building2 },
    { id: "api_keys", label: "API Integrations", icon: Key },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary-600" />
            Account Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage your profile, organization details, and integrations.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {showSuccess && (
            <span className="text-emerald-600 text-sm font-medium flex items-center gap-1 animate-in fade-in">
              <CheckCircle className="w-4 h-4" /> Saved
            </span>
          )}
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary flex items-center gap-2"
          >
            {isSaving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left",
                  isActive 
                    ? "bg-primary-50 text-primary-700" 
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <Icon className={clsx("w-5 h-5", isActive ? "text-primary-600" : "text-slate-400")} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          <div className="glass-card p-6 md:p-8 min-h-[400px]">
            
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Profile Information</h2>
                
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-20 h-20 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold">
                    {profile.fullName.charAt(0)}
                  </div>
                  <div>
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                      Change Avatar
                    </button>
                    <p className="text-xs text-slate-500 mt-2">JPG, GIF or PNG. Max size of 800K</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={profile.fullName}
                      onChange={e => setProfile({...profile, fullName: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      value={profile.email}
                      disabled
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Role</label>
                    <input 
                      type="text" 
                      value={profile.role}
                      disabled
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Organization Tab */}
            {activeTab === "organization" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Organization Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">Company Name</label>
                    <input 
                      type="text" 
                      value={org.name}
                      onChange={e => setOrg({...org, name: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Industry</label>
                    <select 
                      value={org.industry}
                      onChange={e => setOrg({...org, industry: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                    >
                      <option>Technology</option>
                      <option>Retail & E-commerce</option>
                      <option>Healthcare</option>
                      <option>Finance</option>
                      <option>Education</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Website</label>
                    <input 
                      type="url" 
                      value={org.website}
                      onChange={e => setOrg({...org, website: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                    />
                  </div>
                </div>

                <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Enterprise Plan</h4>
                      <p className="text-xs text-slate-500">Unlimited users, custom AI models</p>
                    </div>
                  </div>
                  <button className="text-sm text-primary-600 font-medium hover:underline">Manage Billing</button>
                </div>
              </div>
            )}

            {/* API Keys Tab */}
            {activeTab === "api_keys" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">API Integrations</h2>
                
                <p className="text-sm text-slate-600 mb-6">
                  Connect external AI providers to supercharge your Klyro instance. API keys are stored securely locally.
                </p>

                <div className="space-y-4">
                  <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-bold text-slate-800">Groq API Key</label>
                      <a href="https://console.groq.com/keys" target="_blank" className="text-xs text-primary-600 hover:underline">Get your key &rarr;</a>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">Required for LLaMA 3.2 Vision model processing in Brand Identity generation.</p>
                    <input 
                      type="password" 
                      placeholder="gsk_..."
                      value={apiKeys.groq}
                      onChange={e => setApiKeys({...apiKeys, groq: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-white font-mono"
                    />
                  </div>

                  <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-bold text-slate-800">OpenAI API Key (Optional)</label>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">Alternative provider for legacy GPT-4 fallback systems.</p>
                    <input 
                      type="password" 
                      placeholder="sk-..."
                      value={apiKeys.openai}
                      onChange={e => setApiKeys({...apiKeys, openai: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Notification Preferences</h2>
                
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Email Alerts</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Receive notifications when campaigns are generated or flagged.</p>
                    </div>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                      <input type="checkbox" checked={notifications.emailAlerts} onChange={() => setNotifications({...notifications, emailAlerts: !notifications.emailAlerts})} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-200" />
                      <label className={clsx("toggle-label block overflow-hidden h-5 rounded-full cursor-pointer", notifications.emailAlerts ? "bg-primary-500" : "bg-slate-300")}></label>
                    </div>
                  </label>

                  <label className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Weekly Activity Report</h4>
                      <p className="text-xs text-slate-500 mt-0.5">A summary of trend analytics and optimization metrics.</p>
                    </div>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                      <input type="checkbox" checked={notifications.weeklyReport} onChange={() => setNotifications({...notifications, weeklyReport: !notifications.weeklyReport})} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-200" />
                      <label className={clsx("toggle-label block overflow-hidden h-5 rounded-full cursor-pointer", notifications.weeklyReport ? "bg-primary-500" : "bg-slate-300")}></label>
                    </div>
                  </label>

                  <label className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Security Alerts</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Crucial alerts regarding unauthorized access or key changes.</p>
                    </div>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                      <input type="checkbox" checked={notifications.securityAlerts} disabled className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-not-allowed border-slate-200" />
                      <label className="toggle-label block overflow-hidden h-5 rounded-full cursor-not-allowed bg-primary-500 opacity-50"></label>
                    </div>
                  </label>
                </div>

                {/* CSS for custom toggles */}
                <style dangerouslySetInnerHTML={{__html: `
                  .toggle-checkbox:checked {
                    right: 0;
                    border-color: #4f46e5;
                  }
                  .toggle-checkbox:checked + .toggle-label {
                    background-color: #4f46e5;
                  }
                  .toggle-checkbox {
                    right: 50%;
                    z-index: 1;
                  }
                `}} />
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
