"use client";

import { 
  Activity, 
  ArrowRight, 
  CheckCircle, 
  TrendingUp, 
  UploadCloud, 
  AlertTriangle,
  FileText,
  Video,
  Image as ImageIcon
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

const trendData = [
  { name: 'Mon', relevance: 65, industry: 55 },
  { name: 'Tue', relevance: 72, industry: 58 },
  { name: 'Wed', relevance: 68, industry: 60 },
  { name: 'Thu', relevance: 85, industry: 62 },
  { name: 'Fri', relevance: 82, industry: 65 },
  { name: 'Sat', relevance: 91, industry: 63 },
  { name: 'Sun', relevance: 94, industry: 66 },
];

export function OverviewView({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  return (
    <div className="space-y-6">
      
      {/* Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Brand Overview</h1>
          <p className="text-sm text-slate-500">Welcome back. Here is your brand health at a glance.</p>
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
              <h2 className="text-3xl font-bold text-slate-900 mt-2">92<span className="text-lg text-slate-400 font-normal">/100</span></h2>
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
              <p className="text-sm font-medium text-slate-500">Visual Consistency</p>
              <h2 className="text-3xl font-bold text-slate-900 mt-2">88%</h2>
            </div>
            <div className="w-10 h-10 rounded-full bg-secondary-50 flex items-center justify-center text-secondary-600">
              <ImageIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-amber-600 font-medium">
            <AlertTriangle className="w-4 h-4 mr-1" />
            <span>2 assets flagged for review</span>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Market Relevance</p>
              <h2 className="text-3xl font-bold text-slate-900 mt-2">94%</h2>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600 font-medium">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>Highly aligned with current trends</span>
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

        {/* AI Insights sidebar */}
        <div className="glass-card p-6 bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-100 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-primary-100 text-primary-700 rounded-md">
              <CheckCircle className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">AI Insights</h3>
          </div>
          
          <div className="space-y-4 flex-1">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 text-sm text-slate-700 leading-relaxed">
              <strong className="text-slate-900 block mb-1">Optimized Tone Match</strong>
              Your recent social posts align perfectly with the defined "Professional but Approachable" tone.
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 text-sm text-slate-700 leading-relaxed relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400"></div>
              <strong className="text-slate-900 block mb-1">Visual Drift Warning</strong>
              The latest "Summer Sale" banner uses a gradient outside your approved brand color palette.
            </div>
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "Q3_Report_Final.pdf", type: "document", icon: FileText, date: "Today", status: "Verified" },
            { name: "Promo_Video_V2.mp4", type: "video", icon: Video, date: "Yesterday", status: "Review" },
            { name: "IG_Post_Creative.jpg", type: "image", icon: ImageIcon, date: "2 days ago", status: "Verified" },
            { name: "Logo_Usage_Guide.pdf", type: "document", icon: FileText, date: "1 week ago", status: "Verified" },
          ].map((asset, i) => (
            <div key={i} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer flex flex-col group">
              <div className="w-10 h-10 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center mb-3 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                <asset.icon className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-slate-800 truncate">{asset.name}</p>
              <div className="flex items-center justify-between mt-auto pt-2">
                <span className="text-xs text-slate-400">{asset.date}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  asset.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {asset.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
