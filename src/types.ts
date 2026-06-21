export interface JobRecord {
  id: string;
  action: string;
  sourceName: string;
  wordCount: number;
  cost: number;
  status: "Success" | "Failed";
  date: string;
  sourceText: string;
  outputText: string;
  processingTimeMs: number;
  aiRisk?: number;
  similarity?: number;
  isUserJob?: boolean;
}

export interface SystemStatus {
  dailyBudgetLimit: number;
  perJobLimit: number;
  budgetUsed: number;
  budgetSaved: boolean;
  isTerminated: boolean;
  jobs: JobRecord[];
}

export type TabType = "Dashboard" | "Processor" | "Reporting";
