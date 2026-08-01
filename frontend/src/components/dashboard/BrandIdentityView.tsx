"use client";

import { useState, useEffect } from "react";
import { Loader2, Fingerprint, Activity, Tag, Users, CheckCircle, RefreshCw, Layers } from "lucide-react";
import { clsx } from "clsx";

interface BrandIdentityData {
  voice?: Record<string, unknown> | string;
  visual?: Record<string, unknown> | string;
  emotion?: Record<string, unknown> | string;
  audience?: Record<string, unknown> | string;
  keywords?: string[];
  personality?: string[] | string;
  design_rules?: string[] | string;
  brand_summary?: string;
  confidence_score?: number;
}

export function BrandIdentityView() {
  const [identity, setIdentity] = useState<BrandIdentityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRebuilding, setIsRebuilding] = useState(false);
  const [error, setError] = useState("");

  const brandId = "66f4321949182390a845942d";

  // Safely convert Dict or string field to a displayable string
  const safeText = (field: Record<string, unknown> | string | undefined): string => {
    if (!field) return "—";
    if (typeof field === "string") return field;
    // If it's an object (dict), try to extract a meaningful value
    const val = Object.values(field)[0];
    if (typeof val === "string") return val;
    return JSON.stringify(field).replace(/[{}"]|^{|}$/g, "");
  };

  const safeList = (field: string[] | string | undefined): string[] => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    return [field];
  };

  useEffect(() => {
    fetchIdentity();
  }, []);

  const fetchIdentity = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`http://localhost:8000/api/v1/identity/${brandId}`, {
        headers: { 'Authorization': 'Bearer mock_token_for_development' }
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setIdentity(result.data);
        } else {
          setIdentity(null);
        }
      } else {
        setIdentity(null);
      }
    } catch (err) {
      console.error(err);
      setIdentity(null);
    } finally {
      setIsLoading(false);
    }
  };

  const rebuildIdentity = async () => {
    setIsRebuilding(true);
    setError("");
    try {
      const response = await fetch(`http://localhost:8000/api/v1/identity/build/${brandId}?force_rebuild=true`, {
        method: "POST",
        headers: { 'Authorization': 'Bearer mock_token_for_development' }
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setIdentity(result.data.identity);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRebuilding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading Brand Identity Matrix...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-center gap-3">
        <Activity className="w-5 h-5 text-red-500" />
        <p className="font-medium text-sm">{error}</p>
        <button onClick={fetchIdentity} className="ml-auto underline text-sm hover:text-red-900">Retry</button>
      </div>
    );
  }

  if (!identity) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <div className="w-16 h-16 bg-primary-50 text-primary-600 flex items-center justify-center rounded-full mb-4">
          <Fingerprint className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">No Identity Model Found</h2>
        <p className="text-slate-500 max-w-md mb-6">
          Your brand's neural identity has not been generated yet. Klyro needs to analyze your assets and onboarding inputs to synthesize your core matrix.
        </p>
        <button 
          onClick={rebuildIdentity}
          disabled={isRebuilding}
          className="btn-primary flex items-center gap-2"
        >
          {isRebuilding ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Synthesize Identity Model
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Fingerprint className="w-6 h-6 text-primary-600" />
            Brand Identity Matrix
          </h1>
          <p className="text-sm text-slate-500 mt-1">AI-synthesized representation of your core brand DNA.</p>
        </div>
        
        <button 
          onClick={rebuildIdentity}
          disabled={isRebuilding}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-primary-600 transition-colors shadow-sm"
        >
          {isRebuilding ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Re-Analyze Brand
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 md:col-span-2 bg-gradient-to-br from-primary-600 to-indigo-700 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-lg font-semibold text-primary-50 flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              Executive Summary
            </h3>
            <p className="text-sm text-primary-100 leading-relaxed font-medium">
              {identity.brand_summary}
            </p>
          </div>
          <Fingerprint className="absolute -bottom-8 -right-8 w-48 h-48 text-white opacity-5" />
        </div>

        <div className="glass-card p-6 flex flex-col justify-center items-center text-center bg-white border-b-4 border-b-emerald-500">
          <p className="text-sm font-medium text-slate-500 mb-1">AI Confidence Score</p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-extrabold text-slate-800">{identity.confidence_score}</span>
            <span className="text-lg font-semibold text-slate-400">%</span>
          </div>
          <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-2 bg-emerald-50 px-2.5 py-1 rounded-full">
            <CheckCircle className="w-3.5 h-3.5" /> High Alignment
          </p>
        </div>
      </div>

      {/* Core Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="glass-card p-6 border-l-4 border-l-primary-500">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary-600" />
            </div>
            <h3 className="text-md font-bold text-slate-800">Brand Voice & Tone</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
            {safeText(identity.voice)}
          </p>
        </div>

        <div className="glass-card p-6 border-l-4 border-l-indigo-500">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Layers className="w-4 h-4 text-indigo-600" />
            </div>
            <h3 className="text-md font-bold text-slate-800">Visual Aesthetic</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
            {safeText(identity.visual)}
          </p>
        </div>

        <div className="glass-card p-6 border-l-4 border-l-pink-500">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center">
              <Tag className="w-4 h-4 text-pink-600" />
            </div>
            <h3 className="text-md font-bold text-slate-800">Emotional Core</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
            {safeText(identity.emotion)}
          </p>
        </div>

        <div className="glass-card p-6 border-l-4 border-l-amber-500">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Users className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="text-md font-bold text-slate-800">Target Audience</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
            {safeText(identity.audience)}
          </p>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-md font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Tag className="w-4 h-4 text-slate-400" />
            Core Keywords
          </h3>
          <div className="flex flex-wrap gap-2">
            {safeList(identity.keywords).map((kw, i) => (
              <span key={i} className="px-3 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-full shadow-sm">
                {kw}
              </span>
            ))}
          </div>
        </div>
        
        <div className="glass-card p-6">
           <h3 className="text-md font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-400" />
            Design Rules
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {safeText(identity.design_rules)}
          </p>
        </div>
      </div>
    </div>
  );
}
