"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { OverviewView } from "@/components/dashboard/OverviewView";
import { AssetIngestionView } from "@/components/dashboard/AssetIngestionView";
import { BrandIdentityView } from "@/components/dashboard/BrandIdentityView";
import { ValidationView } from "@/components/dashboard/ValidationView";
import { TrendAnalyticsView } from "@/components/dashboard/TrendAnalyticsView";
import { ImpactSimulationView } from "@/components/dashboard/ImpactSimulationView";
import { SettingsView } from "@/components/dashboard/SettingsView";
import { CopilotView } from "@/components/dashboard/CopilotView";

export default function DashboardClient() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderView = () => {
    switch (activeTab) {
      case "dashboard":
        return <OverviewView setActiveTab={setActiveTab} />;
      case "assets":
        return <AssetIngestionView />;
      case "identity":
        return <BrandIdentityView />;
      case "validation":
        return <ValidationView />;
      case "trends":
        return <TrendAnalyticsView />;
      case "simulation":
        return <ImpactSimulationView />;
      case "copilot":
        return <CopilotView />;
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
        <TopNav onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="mx-auto max-w-7xl">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}
