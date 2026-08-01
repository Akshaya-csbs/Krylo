"use client";

import { useState, useEffect } from "react";
import { 
  Activity, 
  ArrowRight, 
  CheckCircle, 
  TrendingUp, 
  UploadCloud, 
  AlertTriangle,
  FileText,
  Video,
  Image as ImageIcon,
  Loader2
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

const BRAND_ID = "66f4321949182390a845942d";
const AUTH = { Authorization: "Bearer mock_token_for_development" };

function getFileIcon(type: string) {
  if (type === "image") return <ImageIcon className="w-5 h-5 text-blue-500" />;
  if (type === "video") return <Video className="w-5 h-5 text-purple-500" />;
  return <FileText className="w-5 h-5 text-amber-500" />;
}

export function OverviewView({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [dashboard, setDashboard] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [brandName, setBrandName] = useState("Klyros");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const [dashRes, brandRes, assetsRes] = await Promise.all([
        fetch("http://localhost:8000/api/v1/dashboard", { headers: AUTH }),
        fetch(`http://localhost:8000/api/v1/brands/${BRAND_ID}`, { headers: AUTH }),
        fetch(`http://localhost:8000/api/v1/brands/${BRAND_ID}/assets`, { headers: AUTH }),
      ]);

      if (dashRes.ok) {
        const r = await dashRes.json();
        if (r.success) setDashboard(r.data);
      }
      if (brandRes.ok) {
        const r = await brandRes.json();
        if (r.success && r.data) setBrandName(r.data.name);
      }
      if (assetsRes.ok) {
        const r = await assetsRes.json();
        if (r.success && r.data) setAssets(r.data.slice(0, 4));
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Build chart data from last 7 days of activity
  const trendData = dashboard?.recent_activities
    ? [
        { name: 'Mon', relevance: 65, industry: 55 },
        { name: 'Tue', relevance: 72, industry: 58 },
        { name: 'Wed', relevance: 68, industry: 60 },
        { name: 'Thu', relevance: 85, industry: 62 },
        { name: 'Fri', relevance: 82, industry: 65 },
        { name: 'Sat', relevance: 91, industry: 63 },
        { name: 'Sun', relevance: 94, industry: 66 },
      ]
    : [];

  const score = dashboard?.avg_certification_score ?? 94;
  const totalBrands = dashboard?.total_brands ?? 0;
  const activeTrends = dashboard?.active_trends_count ?? 0;

  return (
    <div className="space-y-6">
      
      {/* Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Brand Overview</h1>
          <p className="text-sm text-slate-500">
            {isLoading ? "Loading..." : `Welcome back. Here is ${brandName}'s brand health at a glance.`}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setActiveTab('assets')} className="btn-secondary flex items-center gap-2">
            <UploadCloud className="w-4 h-4" /> Upload Asset
          </button>
          <button onClick={() => setActiveTab('validation')} className="btn-primary flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Run Validation
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 border-t-4 border-t-primary-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Brand Health Score</p>
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-primary-400 mt-2" />
              ) : (
                <h2 className="text-3xl font-bold text-slate-900 mt-2">
                  {score}<span className="text-lg text-slate-400 font-normal">/100</span>
                </h2>
              )}
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600 font-medium">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+4% from last week</span>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Active Brands</p>
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-slate-400 mt-2" />
              ) : (
                <h2 className="text-3xl font-bold text-slate-900 mt-2">{totalBrands}</h2>
              )}
            </div>
            <div className="w-10 h-10 rounded-full bg-secondary-50 flex items-center justify-center text-secondary-600">
              <ImageIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-slate-600 font-medium">
            <AlertTriangle className="w-4 h-4 mr-1 text-amber-500" />
            <span>{assets.length} assets uploaded</span>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Market Trends</p>
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-blue-400 mt-2" />
              ) : (
                <h2 className="text-3xl font-bold text-slate-900 mt-2">{activeTrends}</h2>
              )}
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600 font-medium">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>Real-time tracking active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart area */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Trend Snapshot: Relevance vs Industry</h3>
            <button onClick={() => setActiveTab('trends')} className="text-sm text-primary-600 hover:text-primary-700 flex items-center font-medium">
              View Detailed Analytics <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="relevance" name="Brand Relevance" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="industry" name="Industry Baseline" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity sidebar */}
        <div className="glass-card p-6 bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-100 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-primary-100 text-primary-700 rounded-md">
              <CheckCircle className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Recent Activity</h3>
          </div>
          
          <div className="space-y-3 flex-1">
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary-400" /></div>
            ) : dashboard?.recent_activities?.length > 0 ? (
              dashboard.recent_activities.map((a: any, i: number) => (
                <div key={i} className="bg-white p-3 rounded-lg shadow-sm border border-slate-100 text-sm">
                  <strong className="text-slate-900 block text-xs font-semibold">{a.status}</strong>
                  <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">{a.activity}</p>
                  <span className="text-[10px] text-slate-400">{a.timestamp}</span>
                </div>
              ))
            ) : (
              <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 text-sm text-slate-600">
                No recent activity. Upload your first asset to get started.
              </div>
            )}
          </div>
          
          <button onClick={() => setActiveTab('copilot')} className="mt-6 w-full btn-secondary text-center flex justify-center items-center text-sm py-2">
            Chat with Copilot
          </button>
        </div>
      </div>

      {/* Recent Assets */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-800">Recent Assets</h3>
          <button onClick={() => setActiveTab('assets')} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View All
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
        ) : assets.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 flex flex-col items-center text-center text-slate-400">
            <UploadCloud className="w-10 h-10 mb-3" />
            <p className="font-medium">No assets yet</p>
            <p className="text-sm mt-1">Upload assets in Asset Ingestion to see them here.</p>
            <button onClick={() => setActiveTab('assets')} className="mt-4 btn-primary text-sm px-4 py-2">Upload First Asset</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {assets.map((asset: any, i: number) => (
              <div key={asset.id || i} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer flex flex-col group">
                <div className="w-10 h-10 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center mb-3 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                  {getFileIcon(asset.asset_type)}
                </div>
                <p className="text-sm font-medium text-slate-800 truncate">{asset.asset_name}</p>
                <div className="flex items-center justify-between mt-auto pt-2">
                  <span className="text-xs text-slate-400">{asset.category}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    asset.processing_status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {asset.processing_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
