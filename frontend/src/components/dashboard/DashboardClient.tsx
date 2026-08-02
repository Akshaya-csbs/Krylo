"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { OverviewView } from "@/components/dashboard/OverviewView";
import { AssetIngestionView } from "@/components/dashboard/AssetIngestionView";
import { BrandIdentityView } from "@/components/dashboard/BrandIdentityView";
import { LayeredAnalysisView } from "@/components/dashboard/LayeredAnalysisView";
import { TrendAnalyticsView } from "@/components/dashboard/TrendAnalyticsView";
import { ImpactSimulationView } from "@/components/dashboard/ImpactSimulationView";
import { SettingsView } from "@/components/dashboard/SettingsView";
import { useEffect } from "react";
export function DashboardClient({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      if (onNavigate) {
        onNavigate("login");
      } else {
        window.location.href = "/login";
      }
    }
  }, [onNavigate]);

  const renderView = () => {
    switch (activeTab) {
      case "dashboard":
        return <OverviewView setActiveTab={setActiveTab} />;
      case "assets":
        return <AssetIngestionView />;
      case "identity":
        return <BrandIdentityView />;
      case "layered-analysis":
        return <LayeredAnalysisView />;
      case "trends":
        return <TrendAnalyticsView />;
      case "simulation":
        return <ImpactSimulationView />;
      case "settings":
        return <SettingsView />;
      default:
        return <OverviewView setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isMobileMenuOpen} 
        setIsOpen={setIsMobileMenuOpen} 
      />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav 
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          onBrandClick={() => setActiveTab("identity")}
          onLogout={() => onNavigate && onNavigate("login")}
        />
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="mx-auto max-w-7xl">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}
