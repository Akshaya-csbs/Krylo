"use client";

import { useState, useEffect } from "react";
import { Loader2, TrendingUp, Activity, BarChart2, Zap, Target, Search, Hash, PenTool } from "lucide-react";
import { clsx } from "clsx";

interface TrendReportDTO {
  id: string;
  brand_id?: string;
  trend: string;
  category: string;
  alignment_score: number;
  trend_score: number;
  competition_score: number;
  forecast_score: number;
  recommended_platform: string;
  best_posting_time: string;
  hashtags: string[];
}

export function TrendAnalyticsView() {
  const [trends, setTrends] = useState<TrendReportDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [brandId, setBrandId] = useState<string>("");

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? `Bearer ${token}` : "";
  };

  // 1. Initially fetch active brand, then load existing trends from the backend
  useEffect(() => {
    const fetchBrandsAndTrends = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const brandResponse = await fetch("http://localhost:8000/api/v1/brands", {
          headers: { "Authorization": getAuthHeader() }
        });
        const brandResult = await brandResponse.json();
        
        let activeBrandId = "";
        if (brandResult.success && brandResult.data && brandResult.data.length > 0) {
          activeBrandId = brandResult.data[0].id;
          setBrandId(activeBrandId);
        } else {
          setError("No brand found. Please create a brand first.");
          setIsLoading(false);
          return;
        }

        const trendsResponse = await fetch(`http://localhost:8000/api/v1/trends?brand_id=${activeBrandId}`, {
          headers: { "Authorization": getAuthHeader() }
        });
        const trendsResult = await trendsResponse.json();
        if (trendsResponse.ok && trendsResult.success) {
          setTrends(trendsResult.data || []);
        } else {
          setTrends([]);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load existing trends.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBrandsAndTrends();
  }, []);

  // 3. Discover trends action
  const discoverTrends = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/trends/discover`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": getAuthHeader()
        },
        body: JSON.stringify({
          brand_id: brandId,
          category: null
        }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setTrends(result.data);
      } else {
        setError(result.message || "Failed to discover trends.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while discovering trends.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateCampaign = async (trendName: string) => {
    setGeneratingFor(trendName);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/trends/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": getAuthHeader()
        },
        body: JSON.stringify({
          brand_id: brandId,
          trend_name: trendName
        }),
      });
      
      const result = await response.json();
      if (response.ok && result.success) {
        // Optional: you can show a success toast here or redirect
        alert(`Campaign generated successfully! Campaign ID: ${result.data.campaign_id}`);
      } else {
        alert("Failed to generate campaign: " + (result.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Error generating campaign.");
    } finally {
      setGeneratingFor(null);
    }
  };

  const ScoreCircle = ({ score, label }: { score: number, label: string }) => {
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    const colorClass = score >= 80 ? "text-emerald-500" : score >= 60 ? "text-amber-500" : "text-red-500";

    return (
      <div className="flex flex-col items-center gap-2">
        <div className="relative flex items-center justify-center">
          <svg className="transform -rotate-90 w-16 h-16">
            <circle cx="32" cy="32" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100" />
            <circle cx="32" cy="32" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className={clsx("transition-all duration-1000", colorClass)} />
          </svg>
          <span className="absolute text-sm font-bold text-slate-800">{score}%</span>
        </div>
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-center">{label}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary-600" />
            Trend Analytics Engine
          </h1>
          <p className="text-sm text-slate-500 mt-1">Discover real-time market trends perfectly aligned with your brand identity.</p>
        </div>
        
        <button 
          onClick={discoverTrends}
          disabled={isLoading}
          className="btn-primary flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {isLoading ? "Scanning Market Signals..." : "Discover AI Trends"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-center gap-3">
          <Activity className="w-5 h-5 text-red-500" />
          <p className="font-medium text-sm">{error}</p>
        </div>
      )}

      {/* 2. Empty State Implementation */}
      {!isLoading && trends.length === 0 && !error && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 bg-[#F0F7FF] text-[#2563EB] flex items-center justify-center rounded-2xl mb-4 border border-[#E0EFFF]">
            <Zap className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">No Trends Discovered Yet</h2>
          <p className="text-slate-600 max-w-md mb-6">
            Click the "Discover AI Trends" button above to scan social signals and market data for high-impact opportunities tailored to your brand DNA.
          </p>
        </div>
      )}

      {isLoading && trends.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse shadow-sm">
              <div className="h-6 bg-slate-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-slate-100 rounded w-1/4 mb-6"></div>
              <div className="flex justify-between">
                <div className="h-16 w-16 bg-slate-100 rounded-full"></div>
                <div className="h-16 w-16 bg-slate-100 rounded-full"></div>
                <div className="h-16 w-16 bg-slate-100 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Populated State (Data Visualization) */}
      {trends.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {trends.map((trend) => (
            <div key={trend.id} className="bg-white rounded-xl p-6 flex flex-col justify-between shadow-sm border border-slate-200 border-t-4 border-t-blue-500">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-slate-800 leading-tight">{trend.trend}</h3>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-md shrink-0">
                    {trend.category}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 mt-6 mb-6">
                  <ScoreCircle score={trend.alignment_score} label="Brand Fit" />
                  <ScoreCircle score={trend.trend_score} label="Virality" />
                  <ScoreCircle score={trend.competition_score} label="Saturation" />
                </div>
              </div>
              
              <div className="space-y-4 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-500">
                    <Target className="w-4 h-4" /> Platform Focus
                  </span>
                  <span className="font-semibold text-slate-800">{trend.recommended_platform}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-500">
                    <BarChart2 className="w-4 h-4" /> Best Time
                  </span>
                  <span className="font-semibold text-slate-800">{trend.best_posting_time}</span>
                </div>
                
                <div className="pt-2 mb-2">
                  <div className="flex flex-wrap gap-2">
                    {trend.hashtags.map((tag, idx) => (
                      <span key={idx} className="flex items-center text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        <Hash className="w-3 h-3 mr-0.5" /> {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => generateCampaign(trend.trend)}
                  disabled={generatingFor === trend.trend}
                  className="w-full flex items-center justify-center gap-2 border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {generatingFor === trend.trend ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                  ) : (
                    <PenTool className="w-4 h-4 text-slate-500" />
                  )}
                  {generatingFor === trend.trend ? "Generating..." : "Generate Campaign"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
