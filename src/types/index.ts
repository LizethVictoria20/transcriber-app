export type ApiKeys = {
  openai: string;
  gemini?: string;
};

export interface Prompts {
  transcription: string;
  transcriptionTranslate: string;
  summary: string;
  pageSummary: string;
  autoTagging: string;
}

export interface AlertConfig {
  enabled: boolean;
  lastTriggered?: string;
  triggerCount: number;
}

export interface AlertSettings {
  // Critical Alerts
  databaseUnavailable: AlertConfig;
  workerFailure: AlertConfig;
  memoryExhausted: AlertConfig;
  diskSpaceCritical: AlertConfig;
  aiApisUnavailable: AlertConfig;
  documentProcessingFailure: AlertConfig;
  // High Severity
  responseTimeSlow: AlertConfig;
  transcriptionQueueBlocked: AlertConfig;
  aiApiErrors: AlertConfig;
  fileUploadFailures: AlertConfig;
  // Medium Severity
  sslCertificateExpiry: AlertConfig;
  highCpuUsage: AlertConfig;
}

export interface SotSettings {
  version: string;
  importantChanges: string;
  systemDescription: string;
}

export interface RetryCategory {
  maxRetries: number;
  backoff: "fixed" | "exponential";
}

export interface SystemPreferences {
  timezone: string;
  language: string;
  maxUploadSizeMB: number;
  maxPageLimit: number;
  showEstimates: boolean;
  costPerPage: number;
  timePerPage: number;
  retryPolicy: {
    network: RetryCategory;
    timeout: RetryCategory;
    rateLimit: RetryCategory;
  };
}

export interface TranscriptionItem {
  id: number;
  name: string;
  fileName: string;
  pages: string;
  pageCount: number;
  originalPageCount?: number;
  provider: "gemini" | "openai";
  transcription: string;
  date: string;
  error?: string;
  tags?: string[];
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

export type SettingsViewType =
  | "main"
  | "metrics"
  | "api"
  | "prompts"
  | "alerts"
  | "sot"
  | "systemPrefs";
