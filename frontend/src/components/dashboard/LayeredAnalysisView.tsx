"use client";

import { useState } from "react";
import { Layers, FileText, Image as ImageIcon, File, Link as LinkIcon, Loader2, AlertCircle, CheckCircle, PenTool, Search } from "lucide-react";
import { clsx } from "clsx";

interface AnalysisResponse {
  summary: string;
  flaws: string[];
  recommendations: string[];
  refined_prompt: string;
}

export function LayeredAnalysisView() {
  const [activeTab, setActiveTab] = useState<"text" | "image" | "pdf" | "link">("text");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);

  const brandId = "66f4321949182390a845942d";

  const handleAnalyze = async () => {
    if (activeTab === "text" && !content.trim()) return;
    if (activeTab === "link" && !content.trim()) return;
    if ((activeTab === "image" || activeTab === "pdf") && !file) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      let payloadContent = content;

      if (activeTab === "image" || activeTab === "pdf") {
        if (file) {
          // Convert file to base64 for simplicity in hackathon
          payloadContent = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        }
      }

      const response = await fetch("http://localhost:8000/api/v1/validation/layered-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer mock_token_for_development"
        },
        body: JSON.stringify({
          brand_id: brandId,
          input_type: activeTab,
          content: payloadContent
        }),
      });

      const resData = await response.json();
      
      if (response.ok && resData.success) {
        setResult(resData.data);
      } else {
        setError(resData.message || "Failed to analyze content.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred during analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "text", label: "Text", icon: FileText },
    { id: "image", label: "Image", icon: ImageIcon },
    { id: "pdf", label: "PDF", icon: File },
    { id: "link", label: "Link", icon: LinkIcon },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary-600" />
            Layered Analysis
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Analyze any content format against your brand's core identity guidelines.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Input Source</h2>
            
            <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setContent("");
                      setFile(null);
                      setResult(null);
                    }}
                    className={clsx(
                      "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-4">
              {activeTab === "text" && (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste your copy, caption, or article here..."
                  className="w-full h-48 p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                />
              )}
              {activeTab === "link" && (
                <input
                  type="url"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="https://example.com/blog-post"
                  className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              )}
              {(activeTab === "image" || activeTab === "pdf") && (
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 flex flex-col items-center justify-center text-center">
                  <input
                    type="file"
                    accept={activeTab === "image" ? "image/*" : "application/pdf"}
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                    <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mb-3">
                      {activeTab === "image" ? <ImageIcon className="w-6 h-6" /> : <File className="w-6 h-6" />}
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      {file ? file.name : `Click to upload ${activeTab.toUpperCase()}`}
                    </span>
                    <span className="text-xs text-slate-400 mt-1">
                      {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Max size 10MB"}
                    </span>
                  </label>
                </div>
              )}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isLoading || (activeTab === "text" && !content) || (activeTab === "link" && !content) || ((activeTab === "image" || activeTab === "pdf") && !file)}
              className="w-full mt-6 btn-primary flex items-center justify-center gap-2 py-3"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
              {isLoading ? "Running Deep Analysis..." : "Analyze Content"}
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2">
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-red-700 flex items-start gap-3 mb-6">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {!result && !isLoading && !error && (
            <div className="bg-white p-12 rounded-xl border border-slate-200 h-full flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Awaiting Input</h3>
              <p className="text-sm text-slate-500 max-w-sm mt-2">
                Provide your content on the left to receive a layered brand intelligence breakdown.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="bg-white p-12 rounded-xl border border-slate-200 h-full flex flex-col items-center justify-center shadow-sm">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-4" />
              <p className="text-sm font-medium text-slate-600 animate-pulse">Cross-referencing brand guidelines...</p>
            </div>
          )}

          {result && !isLoading && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50 px-6 py-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Executive Summary</h3>
                </div>
                <div className="p-6">
                  <p className="text-sm text-slate-600 leading-relaxed">{result.summary}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="border-b border-red-50 bg-red-50/50 px-6 py-4 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-red-700">Identified Flaws</h3>
                  </div>
                  <div className="p-6">
                    {result.flaws.length > 0 ? (
                      <ul className="space-y-3">
                        {result.flaws.map((flaw, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                            {flaw}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500 italic">No flaws identified! Perfect brand alignment.</p>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="border-b border-emerald-50 bg-emerald-50/50 px-6 py-4 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-700">Recommendations</h3>
                  </div>
                  <div className="p-6">
                    {result.recommendations.length > 0 ? (
                      <ul className="space-y-3">
                        {result.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500 italic">No further recommendations.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 rounded-xl shadow-sm overflow-hidden">
                <div className="border-b border-slate-800 bg-slate-900/50 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">Refined Prompt Generation</h3>
                  </div>
                  <button 
                    onClick={() => navigator.clipboard.writeText(result.refined_prompt)}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Copy Prompt
                  </button>
                </div>
                <div className="p-6 bg-slate-900">
                  <p className="text-sm text-slate-300 font-mono leading-relaxed">
                    {result.refined_prompt}
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
