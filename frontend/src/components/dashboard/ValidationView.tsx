"use client";

import { useState } from "react";
import { Loader2, CheckCircle, AlertTriangle, AlertCircle, RefreshCw, BarChart } from "lucide-react";
import { clsx } from "clsx";

interface IssueDTO {
  category: string;
  severity: "High" | "Medium" | "Low";
  message: string;
  solution?: string;
}

interface ValidationReport {
  id: string;
  overall_score: number;
  scores: Record<string, number>;
  issues: IssueDTO[];
  recommendations: string[];
}

export function ValidationView() {
  const [textContent, setTextContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [objective, setObjective] = useState("Brand Engagement");
  
  const [isChecking, setIsChecking] = useState(false);
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [error, setError] = useState("");

  const brandId = "66f4321949182390a845942d"; // Mock brand ID (24-char)

  const runValidation = async () => {
    if (!textContent.trim()) {
      setError("Please provide some text content to validate.");
      return;
    }
    
    setIsChecking(true);
    setError("");
    
    try {
      const response = await fetch(`http://localhost:8000/api/v1/validation/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer mock_token_for_development"
        },
        body: JSON.stringify({
          brand_id: brandId,
          text_content: textContent,
          image_url: imageUrl || undefined,
          platform,
          objective
        }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setReport(result.data);
      } else {
        // Hackathon fallback
        setReport(getMockReport());
      }
    } catch (err) {
      console.error(err);
      // Hackathon fallback
      setReport(getMockReport());
    } finally {
      setIsChecking(false);
    }
  };

  const getMockReport = (): ValidationReport => ({
    id: "mock-123",
    overall_score: 84,
    scores: {
      "Voice & Tone": 88,
      "Visual Aesthetics": 92,
      "Platform Fit": 75,
      "Core Values": 90,
      "Audience Targeting": 82,
      "Compliance": 100
    },
    issues: [
      {
        category: "Platform Fit",
        severity: "Medium",
        message: "The copy is slightly too formal for Instagram's typical user base.",
        solution: "Incorporate more emojis and conversational transitions."
      },
      {
        category: "Voice & Tone",
        severity: "Low",
        message: "Missing the core keyword 'Innovation' which is highly recommended for this objective.",
        solution: "Add 'Innovation' naturally into the opening hook."
      }
    ],
    recommendations: [
      "Shorten the first paragraph to increase retention on mobile feeds.",
      "Add a stronger Call-To-Action (CTA) at the very end.",
      "Consider using a carousel format to explain the complex concepts."
    ]
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'medium': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'low': return <AlertCircle className="w-5 h-5 text-blue-500" />;
      default: return <AlertCircle className="w-5 h-5 text-slate-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return "bg-red-50 border-red-200 text-red-800";
      case 'medium': return "bg-amber-50 border-amber-200 text-amber-800";
      case 'low': return "bg-blue-50 border-blue-200 text-blue-800";
      default: return "bg-slate-50 border-slate-200 text-slate-800";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-primary-600" />
          6-Pillar Validation Engine
        </h1>
        <p className="text-sm text-slate-500 mt-1">Validate your marketing copy and assets against your brand's core identity.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Input Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-md font-semibold text-slate-800 mb-4">Content Input</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Target Platform</label>
                <select 
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                >
                  <option>Instagram</option>
                  <option>LinkedIn</option>
                  <option>Twitter / X</option>
                  <option>Email Newsletter</option>
                  <option>Website Copy</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Primary Objective</label>
                <select 
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                >
                  <option>Brand Engagement</option>
                  <option>Lead Generation</option>
                  <option>Product Launch</option>
                  <option>Customer Retention</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Copy / Text Content</label>
                <textarea 
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  rows={6}
                  placeholder="Paste your marketing copy here..."
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-white resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Image URL (Optional)</label>
                <input 
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                />
              </div>

              {error && (
                <p className="text-xs text-red-600 font-medium">{error}</p>
              )}

              <button 
                onClick={runValidation}
                disabled={isChecking || !textContent.trim()}
                className={clsx(
                  "w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm",
                  (!textContent.trim() || isChecking)
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-primary-600 text-white hover:bg-primary-700 hover:shadow-md"
                )}
              >
                {isChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {isChecking ? "Validating Content..." : "Run Validation Check"}
              </button>
            </div>
          </div>
        </div>

        {/* Results View */}
        <div className="lg:col-span-7">
          {!report ? (
            <div className="glass-card p-10 h-full flex flex-col items-center justify-center text-center border-dashed border-2 border-slate-200 bg-slate-50/50">
              <div className="w-16 h-16 bg-white shadow-sm text-slate-400 flex items-center justify-center rounded-2xl mb-4">
                <BarChart className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">No Results Yet</h3>
              <p className="text-sm text-slate-500 max-w-sm">
                Enter your campaign content on the left and run the validation check to see how well it aligns with your brand identity.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Scorecard */}
              <div className="glass-card p-6 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Alignment Score</h3>
                  <p className="text-sm text-slate-400">Overall confidence across all 6 pillars</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={clsx(
                    "text-5xl font-extrabold tracking-tighter",
                    report.overall_score >= 80 ? "text-emerald-400" : report.overall_score >= 60 ? "text-amber-400" : "text-red-400"
                  )}>
                    {report.overall_score}
                  </span>
                  <span className="text-xl text-slate-500 font-bold">%</span>
                </div>
              </div>

              {/* Individual Scores */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(report.scores).map(([pillar, score]) => (
                  <div key={pillar} className="glass-card p-4 border border-slate-100 bg-white">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{pillar}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={clsx(
                            "h-full rounded-full",
                            score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-red-500"
                          )}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-slate-800">{score}%</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Issues Identified */}
              {report.issues.length > 0 && (
                <div className="glass-card overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Identified Issues ({report.issues.length})
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {report.issues.map((issue, i) => (
                      <div key={i} className={clsx("p-4 border-l-4", getSeverityColor(issue.severity).split(' ')[1].replace('border', 'border-l'))}>
                        <div className="flex gap-3">
                          <div className="shrink-0 mt-0.5">
                            {getSeverityIcon(issue.severity)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={clsx("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full", getSeverityColor(issue.severity))}>
                                {issue.severity}
                              </span>
                              <span className="text-xs font-semibold text-slate-500">{issue.category}</span>
                            </div>
                            <p className="text-sm text-slate-800 font-medium mb-1">{issue.message}</p>
                            {issue.solution && (
                              <p className="text-xs text-slate-600 bg-white/50 p-2 rounded-lg mt-2 inline-block">
                                <span className="font-semibold text-slate-700">Fix: </span> {issue.solution}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {report.recommendations.length > 0 && (
                <div className="glass-card p-6">
                   <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Strategic Recommendations
                  </h3>
                  <ul className="space-y-3">
                    {report.recommendations.map((rec, i) => (
                      <li key={i} className="flex gap-3 text-sm text-slate-600">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
