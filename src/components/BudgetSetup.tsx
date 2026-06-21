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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold font-display-lg text-black">Financial Guardrails Configuration</h2>
          <p className="text-slate-500 font-body-sm text-sm mt-1">Set up computational budgets to prevent runaway academic rewrite costs.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowClearConfirm(true)}
            className="px-3 py-2 border border-red-200 hover:bg-red-50 text-red-700 text-xs rounded transition-colors flex items-center gap-1.5 font-label-md"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Database
          </button>
        </div>
      </div>

      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-start gap-3 text-red-600">
              <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold font-display-lg text-lg text-black">Confirm Database Reset</h3>
                <p className="text-sm text-slate-500 mt-1">This will permanently clear your job execution cache, cost logs, metrics, and restore standard factory template parameters.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm rounded font-medium"
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
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded font-medium"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step Indicator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-4 p-4 rounded-xl border border-black bg-[#131b2e] text-white">
          <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold text-lg">1</div>
          <div>
            <h3 className="font-semibold text-base font-display-lg">Budget Setup</h3>
            <p className="text-xs text-slate-400 opacity-90">Define spending limits</p>
          </div>
        </div>

        <button 
          onClick={() => {
            if (status.budgetSaved) onSwitchTab("Processor");
          }}
          disabled={!status.budgetSaved}
          className={`text-left flex items-center gap-4 p-4 rounded-xl border transition-all ${
            status.budgetSaved 
              ? "border-slate-200 bg-white hover:border-black cursor-pointer" 
              : "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed"
          }`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
            status.budgetSaved ? "bg-[#006c49] text-white" : "bg-slate-200 text-slate-500"
          }`}>2</div>
          <div className="flex-1">
            <h3 className="font-semibold text-base font-display-lg text-black">Process Jobs</h3>
            <p className="text-xs text-slate-500">
              {status.budgetSaved ? "Click here to run DeepSeek Rewrites →" : "Locked until guardrails saved"}
            </p>
          </div>
        </button>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Financial Overview Card */}
        <div className="lg:col-span-4 bg-white border border-slate-200 p-6 rounded-xl flex flex-col justify-between min-h-[280px]">
          <div>
            <h3 className="text-lg font-bold text-black mb-3 font-display-lg">Active Guardrail Logic</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6 font-body-sm">
              These hard ceilings protect your research credits from runaway queries, nested loop calls, and computational cost spikes in the background.
            </p>
          </div>
          
          {/* Daily Consumption Progress */}
          <div className="mb-4 space-y-2 border-t border-slate-100 pt-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-wider font-label-sm">Daily Consumption</span>
              <span className="font-bold text-black font-label-md">
                ${status.budgetUsed.toFixed(2)} / ${status.dailyBudgetLimit.toFixed(2)}
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  status.budgetUsed >= status.dailyBudgetLimit ? "bg-red-500 animate-pulse" : "bg-[#006c49]"
                }`} 
                style={{ width: `${Math.min(Math.round((status.budgetUsed / status.dailyBudgetLimit) * 100), 100)}%` }}
              ></div>
            </div>
          </div>

          <div className={`rounded-lg p-4 transition-all duration-300 ${
            status.isTerminated 
              ? "bg-red-50 border border-red-200" 
              : status.budgetSaved 
              ? "bg-[#6cf8bb]/15 border border-[#6cf8bb]/40" 
              : "bg-slate-100 border border-slate-200"
          }`}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">System Gateway</span>
              {status.isTerminated ? (
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
              ) : (
                <span className={`w-2.5 h-2.5 rounded-full ${status.budgetSaved ? "bg-[#006c49]" : "bg-slate-400"}`}></span>
              )}
            </div>
            <p className={`text-sm font-semibold ${
              status.isTerminated 
                ? "text-red-700" 
                : status.budgetSaved 
                ? "text-[#00714d]" 
                : "text-slate-600"
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
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Daily Limit Entry */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-black" htmlFor="daily_budget">
                  Daily Budget Limit (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                  <input 
                    type="number"
                    id="daily_budget"
                    step="0.01"
                    min="0.10"
                    max="100.00"
                    value={dailyLimit}
                    onChange={(e) => setDailyLimit(e.target.value)}
                    onBlur={(e) => handleBlur(e.target.value, setDailyLimit, "10.00")}
                    className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-black focus:border-black font-semibold text-black outline-none transition-all text-sm"
                    placeholder="10.00"
                    required
                  />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-body-sm">
                  Maximum aggregated computational expenditure permitted per 24-hour cycle.
                </p>
              </div>

              {/* Per Job Limit Entry */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-black" htmlFor="job_limit">
                  Per-Job Hard Limit (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                  <input 
                    type="number"
                    id="job_limit"
                    step="0.01"
                    min="0.05"
                    max="10.00"
                    value={jobLimit}
                    onChange={(e) => setJobLimit(e.target.value)}
                    onBlur={(e) => handleBlur(e.target.value, setJobLimit, "1.00")}
                    className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-black focus:border-black font-semibold text-black outline-none transition-all text-sm"
                    placeholder="1.00"
                    required
                  />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-body-sm">
                  Maximum spend capacity allowed for a singular DeepSeek rewrite transaction.
                </p>
              </div>

            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-[#006c49] text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Double-Verification & Scale-to-Zero Active</span>
              </div>
              
              <button 
                type="submit"
                disabled={saving}
                className={`w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  saving 
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed" 
                    : saveSuccess 
                    ? "bg-[#006c49] hover:bg-[#005c3d] text-white" 
                    : "bg-black hover:bg-slate-800 text-white"
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
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
          <div className="w-8 h-8 rounded bg-slate-200/50 flex items-center justify-center text-slate-700 mb-3">
            <Lock className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-black mb-1 font-display-lg">Automatic Scale-to-Zero</h4>
          <p className="text-xs text-slate-500 leading-relaxed font-body-sm">
            Monitors real-time API logs closely. Automatically suspends queries the millisecond threshold limits are breached to guarantee zero cost overrun.
          </p>
        </div>

        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
          <div className="w-8 h-8 rounded bg-slate-200/50 flex items-center justify-center text-slate-700 mb-3">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-black mb-1 font-display-lg">Precision Asset Tracking</h4>
          <p className="text-xs text-slate-500 leading-relaxed font-body-sm">
            Tracks DeepSeek character-to-token structures on physical processors. Real-time billing registers exact dollar spends down to three decimal houses.
          </p>
        </div>

        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
          <div className="w-8 h-8 rounded bg-slate-200/50 flex items-center justify-center text-slate-700 mb-3">
            <HardDriveDownload className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-black mb-1 font-display-lg">Audit Ready Telemetry</h4>
          <p className="text-xs text-slate-500 leading-relaxed font-body-sm">
            Every parameter change is timestamped in our local file backend. Access perfect histories anytime using the Reporting view.
          </p>
        </div>
      </div>
    </div>
  );
}
