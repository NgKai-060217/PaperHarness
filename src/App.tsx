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
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-slate-800 border-t-indigo-500 animate-spin"></div>
          <Cpu className="w-5 h-5 text-indigo-400 absolute" />
        </div>
        <p className="text-xs font-bold font-label-md text-slate-400 tracking-wider uppercase">Initializing OpenHarness Core Engine...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0b0f19] min-h-screen pb-24 md:pb-8 flex flex-col text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Subtle ambient lighting glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="fixed top-1/3 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none z-0"></div>

      {/* 2. Top Navigation App Bar (Desktop size) */}
      <header className="fixed top-0 left-0 w-full z-50 bg-[#0d1322]/85 backdrop-blur-xl border-b border-slate-800/80 flex justify-between items-center h-16 px-4 md:px-10 shadow-lg shadow-black/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 border border-indigo-400/20">
            <Wallet className="w-4.5 h-4.5" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-extrabold font-display-lg text-white select-none tracking-tight">OpenHarness</h1>
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold font-label-sm bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-md uppercase tracking-wider">AI SaaS</span>
          </div>
        </div>

        {/* Desktop items navigation */}
        <div className="hidden md:flex items-center gap-1.5 bg-[#121827] p-1 rounded-xl border border-slate-800">
          <button 
            type="button"
            onClick={() => handleSwitchTab("Dashboard" as any)}
            className={`px-4 py-1.5 text-xs font-bold font-label-md rounded-lg transition-all cursor-pointer ${
              activeTab === ("Dashboard" as any)
                ? "glass-btn-primary shadow-sm" 
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            Dashboard
          </button>
          
          <button 
            type="button"
            onClick={() => handleSwitchTab("Processor")}
            disabled={!status.budgetSaved}
            className={`px-4 py-1.5 text-xs font-bold font-label-md rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "Processor"
                ? "glass-btn-primary shadow-sm" 
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 disabled:opacity-40 disabled:hover:bg-transparent"
            }`}
          >
            Processor
            {!status.budgetSaved && <Lock className="w-3 h-3 text-slate-500" />}
          </button>

          <button 
            type="button"
            onClick={() => handleSwitchTab("Reporting")}
            className={`px-4 py-1.5 text-xs font-bold font-label-md rounded-lg transition-all cursor-pointer ${
              activeTab === "Reporting"
                ? "glass-btn-primary shadow-sm" 
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            Reporting
          </button>
        </div>

        {/* Global operational indicators */}
        <div className="flex items-center gap-2.5">
          {errorText && (
            <span className="hidden lg:inline-flex items-center gap-1.5 bg-amber-950/40 text-amber-300 px-3 py-1 rounded-full text-xs font-medium border border-amber-800/50">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Offline Cache</span>
            </span>
          )}
          
          <span className="hidden sm:inline-flex bg-[#121827] border border-slate-800 text-slate-300 text-xs font-bold px-3.5 py-1.5 rounded-full items-center gap-2 select-none font-label-md">
            <span className="font-semibold text-slate-400">Daily:</span>
            <span className="text-indigo-300 font-medium">${status.budgetUsed.toFixed(2)}</span>
            <span className="text-slate-500 font-normal">/ ${status.dailyBudgetLimit.toFixed(2)}</span>
          </span>

          <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 select-none border ${
            status.isTerminated 
              ? "bg-rose-950/40 border-rose-800/60 text-rose-300" 
              : "bg-emerald-950/40 border-emerald-800/60 text-emerald-300"
          }`}>
            <span className={`w-2 h-2 rounded-full ${status.isTerminated ? "bg-rose-500" : "bg-emerald-400 animate-pulse"}`}></span>
            Status: {status.isTerminated ? "Suspended" : "Normal"}
          </span>
        </div>
      </header>

      {/* Main Content Pane */}
      <main className="pt-24 flex-1 max-w-7xl w-full mx-auto px-4 md:px-10 z-10">
        
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
      <nav className="md:hidden fixed bottom-0 left-0 w-full h-20 bg-[#0d1322]/95 backdrop-blur-xl border-t border-slate-800 flex justify-around items-center px-4 pb-safe z-50">
        <button 
          type="button"
          onClick={() => handleSwitchTab("Dashboard" as any)}
          className={`flex flex-col items-center justify-center text-slate-400 px-3 py-1 transition-all cursor-pointer ${
            activeTab === ("Dashboard" as any) ? "text-indigo-400 font-semibold" : "opacity-70 hover:opacity-100"
          }`}
        >
          <Layers className="w-5 h-5 mb-1" />
          <span className="text-[10px] uppercase font-bold font-label-sm">Dashboard</span>
        </button>

        <button 
          type="button"
          onClick={() => handleSwitchTab("Processor")}
          disabled={!status.budgetSaved}
          className={`flex flex-col items-center justify-center text-slate-400 px-3 py-1 transition-all cursor-pointer relative ${
            activeTab === "Processor" ? "text-emerald-400 font-semibold scale-105" : "opacity-70 hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed"
          }`}
        >
          <div className={`p-2 rounded-full ${activeTab === "Processor" ? "bg-emerald-500/20" : ""}`}>
            <Cpu className="w-5 h-5 mb-0.5" />
          </div>
          <span className="text-[10px] uppercase font-bold font-label-sm">Processor</span>
          {!status.budgetSaved && (
            <Lock className="w-2.5 h-2.5 text-slate-500 absolute right-1 top-2" />
          )}
        </button>

        <button 
          type="button"
          onClick={() => handleSwitchTab("Reporting")}
          className={`flex flex-col items-center justify-center text-slate-400 px-3 py-1 transition-all cursor-pointer ${
            activeTab === "Reporting" ? "text-indigo-400 font-semibold" : "opacity-70 hover:opacity-100"
          }`}
        >
          <FileSpreadsheet className="w-5 h-5 mb-1" />
          <span className="text-[10px] uppercase font-bold font-label-sm">Reporting</span>
        </button>
      </nav>

    </div>
  );
}
