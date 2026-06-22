import React, { useState, useEffect } from "react";
import { SystemStatus, TabType, JobRecord } from "./types";
import BudgetSetup from "./components/BudgetSetup";
import JobProcessor from "./components/JobProcessor";
import ReportingView from "./components/ReportingView";
import { 
  Lock, Wallet, ShieldAlert, Cpu, FileSpreadsheet, RefreshCw, Layers 
} from "lucide-react";

const INITIAL_STATUS: SystemStatus = {
  dailyBudgetLimit: 10.00,
  perJobLimit: 1.00,
  budgetUsed: 0.00,
  budgetSaved: true,
  isTerminated: false,
  jobs: []
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>("Processor");
  const [status, setStatus] = useState<SystemStatus>(INITIAL_STATUS);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Sync state with server on mount
  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/status");
      if (!res.ok) throw new Error("Could not fetch server configuration details.");
      const data: SystemStatus = await res.json();
      setStatus(data);
      setErrorText(null);
    } catch (err: any) {
      console.error(err);
      setErrorText("Database communication offline. Operating with high-fidelity client local buffers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Poll status occasionally to keep synchronized
    const tInterval = setInterval(fetchStatus, 9000);
    return () => clearInterval(tInterval);
  }, []);

  const handleUpdateBudget = async (daily: number, perJob: number) => {
    try {
      const res = await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dailyBudgetLimit: daily, perJobLimit: perJob })
      });
      if (!res.ok) throw new Error("Failed to write budget config on server.");
      const resJson = await res.json();
      setStatus(resJson.db);
    } catch (err: any) {
      console.error(err);
      // Client offline local fallback
      setStatus(prev => ({
        ...prev,
        dailyBudgetLimit: daily,
        perJobLimit: perJob,
        budgetSaved: true,
        isTerminated: false
      }));
    }
  };

  const handleProcessJob = async (sourceText: string, action: string, sourceName: string, clientDate?: string): Promise<JobRecord> => {
    const res = await fetch("/api/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceText, action, sourceName, clientDate })
    });
    
    if (!res.ok) {
      const errJson = await res.json();
      throw new Error(errJson.error || "Execution failed. Check budget guardrails configuration.");
    }

    const { job, db } = await res.json();
    setStatus(db);
    return job;
  };

  const handleTerminate = async () => {
    try {
      const res = await fetch("/api/terminate", { method: "POST" });
      if (res.ok) {
        setStatus(prev => ({ ...prev, isTerminated: true }));
      }
    } catch (err) {
      console.error(err);
      setStatus(prev => ({ ...prev, isTerminated: true }));
    }
  };

  const handleResume = async () => {
    try {
      const res = await fetch("/api/resume", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setStatus(data.db);
      }
    } catch (err) {
      console.error(err);
      setStatus(prev => ({ ...prev, isTerminated: false }));
    }
  };

  const handleClearDB = async () => {
    try {
      const res = await fetch("/api/clear", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setStatus(data.db);
        setActiveTab("Dashboard");
      }
    } catch (err) {
      console.error(err);
      setStatus({
        dailyBudgetLimit: 10.00,
        perJobLimit: 1.00,
        budgetUsed: 0.0,
        budgetSaved: false,
        isTerminated: false,
        jobs: []
      });
      setActiveTab("Dashboard");
    }
  };

  const handleSwitchTab = (tab: "Processor" | "Reporting" | "Dashboard") => {
    if (tab === "Processor" && !status.budgetSaved) {
      return; // Locked
    }
    setActiveTab(tab as TabType);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-black animate-spin"></div>
        <p className="text-sm font-semibold font-label-md text-slate-500">Initializing OpenHarness Core Engine...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f7f9fb] min-h-screen pb-24 md:pb-8 flex flex-col text-[#191c1e]">
      
      {/* 2. Top Navigation App Bar (Desktop size) */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white border-b border-slate-200 flex justify-between items-center h-16 px-4 md:px-10 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-black flex items-center justify-center text-white">
            <Wallet className="w-4.5 h-4.5" />
          </div>
          <h1 className="text-xl font-bold font-display-lg text-black select-none tracking-tight">OpenHarness</h1>
        </div>

        {/* Desktop items navigation */}
        <div className="hidden md:flex items-center gap-2 h-full">
          <button 
            type="button"
            onClick={() => handleSwitchTab("Dashboard" as any)}
            className={`px-4 py-2 text-xs font-bold font-label-md rounded border transition-all cursor-pointer ${
              activeTab === ("Dashboard" as any)
                ? "bg-black text-white border-black" 
                : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-black"
            }`}
          >
            Dashboard
          </button>
          
          <button 
            type="button"
            onClick={() => handleSwitchTab("Processor")}
            disabled={!status.budgetSaved}
            className={`px-4 py-2 text-xs font-bold font-label-md rounded border transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "Processor"
                ? "bg-black text-white border-black animate-pulse" 
                : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-black disabled:opacity-40 disabled:cursor-not-allowed"
            }`}
          >
            Processor
            {!status.budgetSaved && <Lock className="w-3 h-3 text-slate-400" />}
          </button>

          <button 
            type="button"
            onClick={() => handleSwitchTab("Reporting")}
            className={`px-4 py-2 text-xs font-bold font-label-md rounded border transition-all cursor-pointer ${
              activeTab === "Reporting"
                ? "bg-black text-white border-black" 
                : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-black"
            }`}
          >
            Reporting
          </button>
        </div>

        {/* Global operational indicators */}
        <div className="flex items-center gap-2.5">
          {errorText && (
            <span className="hidden lg:inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-medium border border-amber-200">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Offline Cache</span>
            </span>
          )}
          
          <span className="hidden sm:inline-flex bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-full items-center gap-1.5 select-none font-label-md">
            <span className="font-semibold text-slate-500">Daily Cost:</span>
            <span className="text-black font-medium">${status.budgetUsed.toFixed(2)}</span>
            <span className="text-slate-400 font-normal">/ ${status.dailyBudgetLimit.toFixed(2)}</span>
          </span>

          <span className="bg-[#6cf8bb]/15 border border-[#6cf8bb]/35 text-[#00714d] text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 select-none">
            <span className={`w-2 h-2 rounded-full ${status.isTerminated ? "bg-red-500" : "bg-[#006c49] animate-pulse"}`}></span>
            Status: {status.isTerminated ? "Suspended" : "Normal"}
          </span>
        </div>
      </header>

      {/* Main Content Pane */}
      <main className="pt-24 flex-1 max-w-7xl w-full mx-auto px-4 md:px-10">
        
        {/* Dynamic Rendering */}
        {activeTab === ("Dashboard" as any) && (
          <BudgetSetup 
            status={status} 
            onUpdateBudget={handleUpdateBudget}
            onSwitchTab={(tab) => handleSwitchTab(tab as any)}
            onClearDB={handleClearDB}
          />
        )}

        {activeTab === "Processor" && (
          <JobProcessor 
            status={status} 
            onProcessJob={handleProcessJob}
            onTerminate={handleTerminate}
            onResume={handleResume}
            onRefreshStatus={fetchStatus}
          />
        )}

        {activeTab === "Reporting" && (
          <ReportingView status={status} />
        )}

      </main>

      {/* Bottom Navigation bar (rendered solely on Mobile viewports) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full h-20 bg-white border-t border-slate-200 flex justify-around items-center px-4 pb-safe z-50">
        <button 
          type="button"
          onClick={() => handleSwitchTab("Dashboard" as any)}
          className={`flex flex-col items-center justify-center text-slate-500 px-3 py-1 transition-all cursor-pointer ${
            activeTab === ("Dashboard" as any) ? "text-black font-semibold" : "opacity-70 hover:opacity-100"
          }`}
        >
          <Layers className="w-5 h-5 mb-1" />
          <span className="text-[10px] uppercase font-bold font-label-sm">Dashboard</span>
        </button>

        <button 
          type="button"
          onClick={() => handleSwitchTab("Processor")}
          disabled={!status.budgetSaved}
          className={`flex flex-col items-center justify-center text-slate-500 px-3 py-1 transition-all cursor-pointer relative ${
            activeTab === "Processor" ? "text-[#00714d] font-semibold scale-105" : "opacity-70 hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed"
          }`}
        >
          <div className={`p-2 rounded-full ${activeTab === "Processor" ? "bg-[#6cf8bb]/20" : ""}`}>
            <Cpu className="w-5 h-5 mb-0.5" />
          </div>
          <span className="text-[10px] uppercase font-bold font-label-sm">Processor</span>
          {!status.budgetSaved && (
            <Lock className="w-2.5 h-2.5 text-slate-400 absolute right-1 top-2" />
          )}
        </button>

        <button 
          type="button"
          onClick={() => handleSwitchTab("Reporting")}
          className={`flex flex-col items-center justify-center text-slate-500 px-3 py-1 transition-all cursor-pointer ${
            activeTab === "Reporting" ? "text-black font-semibold" : "opacity-70 hover:opacity-100"
          }`}
        >
          <FileSpreadsheet className="w-5 h-5 mb-1" />
          <span className="text-[10px] uppercase font-bold font-label-sm">Reporting</span>
        </button>
      </nav>

    </div>
    
  );
}
