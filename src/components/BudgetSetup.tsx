import React, { useState } from "react";
import { SystemStatus } from "../types";
import { ShieldCheck, HardDriveDownload, Sparkles, RefreshCw, Lock, Save, AlertTriangle } from "lucide-react";

interface BudgetSetupProps {
  status: SystemStatus;
  onUpdateBudget: (daily: number, perJob: number) => Promise<void>;
  onSwitchTab: (tab: "Processor" | "Reporting") => void;
  onClearDB: () => Promise<void>;
}

export default function BudgetSetup({ status, onUpdateBudget, onSwitchTab, onClearDB }: BudgetSetupProps) {
  const [dailyLimit, setDailyLimit] = useState<string>(status.dailyBudgetLimit.toFixed(2));
  const [jobLimit, setJobLimit] = useState<string>(status.perJobLimit.toFixed(2));
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    const daily = parseFloat(dailyLimit) || 10.00;
    const job = parseFloat(jobLimit) || 1.00;

    try {
      await onUpdateBudget(daily, job);
      setTimeout(() => {
        setSaving(false);
        setSaveSuccess(true);
      }, 700);
    } catch (err) {
      setSaving(false);
      console.error(err);
    }
  };

  const handleBlur = (val: string, setter: (s: string) => void, fallback: string) => {
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setter(num.toFixed(2));
    } else {
      setter(fallback);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold font-display-lg text-white tracking-tight">Financial Guardrails Configuration</h2>
            <span className="px-2.5 py-0.5 text-[10px] font-bold font-label-sm bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-full uppercase">Real-Time Control</span>
          </div>
          <p className="text-slate-400 font-body-sm text-sm mt-1">Set up computational budgets to prevent runaway academic rewrite costs.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowClearConfirm(true)}
            className="glass-btn-red px-3.5 py-2 text-xs rounded-xl flex items-center gap-2 font-label-md cursor-pointer font-bold"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
            Reset Database
          </button>
        </div>
      </div>

      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121827] rounded-2xl border border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start gap-3.5 text-rose-400">
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold font-display-lg text-lg text-white">Confirm Database Reset</h3>
                <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">This will permanently clear your job execution cache, cost logs, metrics, and restore standard factory template parameters.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
              <button 
                onClick={() => setShowClearConfirm(false)}
                className="glass-btn-secondary px-4 py-2 text-sm rounded-xl font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  await onClearDB();
                  setDailyLimit("10.00");
                  setJobLimit("1.00");
                  setShowClearConfirm(false);
                }}
                className="glass-btn-red px-4 py-2 text-sm rounded-xl font-medium cursor-pointer"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step Indicator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-4 p-4 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900 text-white shadow-lg shadow-indigo-950/20">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-base shadow-md shadow-indigo-500/30 shrink-0 font-display-lg">1</div>
          <div>
            <h3 className="font-bold text-base font-display-lg text-white">Budget Setup</h3>
            <p className="text-xs text-indigo-200/70 font-body-sm">Define spending limits</p>
          </div>
        </div>

        <button 
          onClick={() => {
            if (status.budgetSaved) onSwitchTab("Processor");
          }}
          disabled={!status.budgetSaved}
          className={`text-left flex items-center gap-4 p-4 rounded-2xl border transition-all ${
            status.budgetSaved 
              ? "border-slate-800 bg-[#121827] hover:border-indigo-500/50 hover:bg-[#161f33] cursor-pointer" 
              : "border-slate-800/50 bg-[#0d1322]/50 opacity-60 cursor-not-allowed"
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base shrink-0 font-display-lg ${
            status.budgetSaved ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-slate-800 text-slate-500"
          }`}>2</div>
          <div className="flex-1">
            <h3 className="font-bold text-base font-display-lg text-slate-200">Process Jobs</h3>
            <p className="text-xs text-slate-400 font-body-sm">
              {status.budgetSaved ? "Click here to run DeepSeek Rewrites →" : "Locked until guardrails saved"}
            </p>
          </div>
        </button>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Financial Overview Card */}
        <div className="lg:col-span-4 bg-[#121827] border border-slate-800 p-6 rounded-2xl flex flex-col justify-between min-h-[280px] shadow-xl relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-extrabold text-white font-display-lg">Active Guardrail Logic</h3>
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 font-body-sm">
              These hard ceilings protect your research credits from runaway queries, nested loop calls, and computational cost spikes in the background.
            </p>
          </div>
          
          {/* Daily Consumption Progress */}
          <div className="mb-4 space-y-2 border-t border-slate-800/80 pt-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-wider font-label-sm">Daily Consumption</span>
              <span className="font-bold text-slate-200 font-label-md">
                ${status.budgetUsed.toFixed(2)} / ${status.dailyBudgetLimit.toFixed(2)}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  status.budgetUsed >= status.dailyBudgetLimit ? "bg-rose-500 animate-pulse" : "bg-gradient-to-r from-indigo-500 to-emerald-400"
                }`} 
                style={{ width: `${Math.min(Math.round((status.budgetUsed / status.dailyBudgetLimit) * 100), 100)}%` }}
              ></div>
            </div>
          </div>

          <div className={`rounded-xl p-4 transition-all duration-300 border ${
            status.isTerminated 
              ? "bg-rose-950/30 border-rose-800/50" 
              : status.budgetSaved 
              ? "bg-emerald-950/30 border-emerald-800/50" 
              : "bg-slate-900/50 border-slate-800"
          }`}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-label-sm">System Gateway</span>
              {status.isTerminated ? (
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-sm shadow-rose-500"></span>
              ) : (
                <span className={`w-2.5 h-2.5 rounded-full ${status.budgetSaved ? "bg-emerald-400 shadow-sm shadow-emerald-400" : "bg-slate-500"}`}></span>
              )}
            </div>
            <p className={`text-xs font-bold ${
              status.isTerminated 
                ? "text-rose-400" 
                : status.budgetSaved 
                ? "text-emerald-400" 
                : "text-slate-400"
            }`}>
              {status.isTerminated 
                ? "EMERGENCY SUSPENSION: Safeguard Tripped"
                : status.budgetSaved 
                ? "Authorized. Processor Active" 
                : "Awaiting primary configuration..."
              }
            </p>
          </div>
        </div>

        {/* Configuration Form Card */}
        <div className="lg:col-span-8 bg-[#121827] border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Daily Limit Entry */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 font-label-sm" htmlFor="daily_budget">
                  Daily Budget Limit (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                  <input 
                    type="number"
                    id="daily_budget"
                    step="0.01"
                    min="0.10"
                    max="100.00"
                    value={dailyLimit}
                    onChange={(e) => setDailyLimit(e.target.value)}
                    onBlur={(e) => handleBlur(e.target.value, setDailyLimit, "10.00")}
                    className="w-full pl-8 pr-4 py-3 bg-[#0d1322] border border-slate-800 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-bold text-white outline-none transition-all text-sm font-label-md"
                    placeholder="10.00"
                    required
                  />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-body-sm">
                  Maximum aggregated computational expenditure permitted per 24-hour cycle.
                </p>
              </div>

              {/* Per Job Limit Entry */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 font-label-sm" htmlFor="job_limit">
                  Per-Job Hard Limit (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                  <input 
                    type="number"
                    id="job_limit"
                    step="0.01"
                    min="0.05"
                    max="10.00"
                    value={jobLimit}
                    onChange={(e) => setJobLimit(e.target.value)}
                    onBlur={(e) => handleBlur(e.target.value, setJobLimit, "1.00")}
                    className="w-full pl-8 pr-4 py-3 bg-[#0d1322] border border-slate-800 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-bold text-white outline-none transition-all text-sm font-label-md"
                    placeholder="1.00"
                    required
                  />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-body-sm">
                  Maximum spend capacity allowed for a singular DeepSeek rewrite transaction.
                </p>
              </div>

            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Double-Verification & Scale-to-Zero Active</span>
              </div>
              
              <button 
                type="submit"
                disabled={saving}
                className={`w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  saving 
                    ? "glass-btn-secondary" 
                    : saveSuccess 
                    ? "glass-btn-emerald" 
                    : "glass-btn-primary"
                }`}
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : saveSuccess ? (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Guardrails Protected</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Budget</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Feature Blocks Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#121827] p-6 rounded-2xl border border-slate-800 shadow-lg">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3.5">
            <Lock className="w-4.5 h-4.5" />
          </div>
          <h4 className="font-bold text-sm text-white mb-1.5 font-display-lg">Automatic Scale-to-Zero</h4>
          <p className="text-xs text-slate-400 leading-relaxed font-body-sm">
            Monitors real-time API logs closely. Automatically suspends queries the millisecond threshold limits are breached to guarantee zero cost overrun.
          </p>
        </div>

        <div className="bg-[#121827] p-6 rounded-2xl border border-slate-800 shadow-lg">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3.5">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <h4 className="font-bold text-sm text-white mb-1.5 font-display-lg">Precision Asset Tracking</h4>
          <p className="text-xs text-slate-400 leading-relaxed font-body-sm">
            Tracks DeepSeek character-to-token structures on physical processors. Real-time billing registers exact dollar spends down to three decimal houses.
          </p>
        </div>

        <div className="bg-[#121827] p-6 rounded-2xl border border-slate-800 shadow-lg">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3.5">
            <HardDriveDownload className="w-4.5 h-4.5" />
          </div>
          <h4 className="font-bold text-sm text-white mb-1.5 font-display-lg">Audit Ready Telemetry</h4>
          <p className="text-xs text-slate-400 leading-relaxed font-body-sm">
            Every parameter change is timestamped in our local file backend. Access perfect histories anytime using the Reporting view.
          </p>
        </div>
      </div>
    </div>
  );
}
