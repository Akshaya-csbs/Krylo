"use client";

import { useState, useEffect } from "react";
import { Loader2, TrendingUp, Activity, BarChart2, Zap, Target, Search, Hash } from "lucide-react";
import { clsx } from "clsx";

interface TrendReportDTO {
  id: string;
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
  const [error, setError] = useState("");

  const brandId = "66f4321949182390a845942d"; // Mock brand ID (24-char)

  useEffect(() => {
    // Optionally fetch existing trends on mount, or wait for user to hit Discover
  }, []);

  const discoverTrends = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`http://localhost:8000/api/v1/trends/discover`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer mock_token_for_development"
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
        // Hackathon fallback
        setTrends(getMockTrends());
      }
    } catch (err) {
      console.error(err);
      // Hackathon fallback
      setTrends(getMockTrends());
    } finally {
      setIsLoading(false);
    }
  };

  const getMockTrends = (): TrendReportDTO[] => ([
    {
      id: "t1",
      trend: "Ethical AI in Enterprise",
      category: "Technology",
      alignment_score: 95,
      trend_score: 88,
      competition_score: 45,
      forecast_score: 92,
      recommended_platform: "LinkedIn",
      best_posting_time: "Tuesday, 10:00 AM",
      hashtags: ["EthicalAI", "EnterpriseTech", "FutureOfWork"]
    },
    {
      id: "t2",
      trend: "Sustainable Scaling",
      category: "Business",
      alignment_score: 85,
      trend_score: 92,
      competition_score: 60,
      forecast_score: 89,
      recommended_platform: "Twitter / X",
      best_posting_time: "Wednesday, 2:00 PM",
      hashtags: ["Sustainability", "TechScaling", "GreenTech"]
    }
  ]);

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
          <span className="absolute text-sm font-bold text-slate-800">{score}</span>
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
          className="btn-primary flex items-center gap-2"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {isLoading ? "Analyzing Global Patterns..." : "Discover AI Trends"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-center gap-3">
          <Activity className="w-5 h-5 text-red-500" />
          <p className="font-medium text-sm">{error}</p>
        </div>
      )}

      {!isLoading && trends.length === 0 && !error && (
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-primary-50 text-primary-500 flex items-center justify-center rounded-2xl mb-4 shadow-sm border border-primary-100">
            <Zap className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">No Trends Discovered Yet</h2>
          <p className="text-slate-500 max-w-md mb-6">
            Click the "Discover AI Trends" button above to scan social signals and market data for high-impact opportunities tailored to your brand DNA.
          </p>
        </div>
      )}

      {isLoading && trends.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
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

      {trends.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {trends.map((trend) => (
            <div key={trend.id} className="glass-card p-6 flex flex-col justify-between border-t-4 border-t-primary-500">
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
                
                <div className="pt-2">
                  <div className="flex flex-wrap gap-2">
                    {trend.hashtags.map((tag, idx) => (
                      <span key={idx} className="flex items-center text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                        <Hash className="w-3 h-3 mr-0.5" /> {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
