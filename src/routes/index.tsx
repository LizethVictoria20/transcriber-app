import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import MainLayout from '../layouts/MainLayout';

// Views
import LoginView from '../views/auth/LoginView';
import TranscribeView from '../views/transcribe/TranscribeView';
import HistoryView from '../views/history/HistoryView';
import TranscriptionDetailView from '../views/history/TranscriptionDetailView';
import SettingsContainer from '../views/settings/SettingsContainer';

// Types
import type { TranscriptionItem, Prompts, ApiKeys, AlertSettings, SotSettings, SystemPreferences } from '../types';

interface AppRoutesProps {
  transcriptions: TranscriptionItem[];
  isLoadingData: boolean;
  selectedTranscription: TranscriptionItem | null;
  theme: string;
  apiKeys: ApiKeys;
  prompts: Prompts;
  alertSettings: AlertSettings;
  sotSettings: SotSettings;
  systemPreferences: SystemPreferences;
  setTheme: (theme: string) => void;
  setApiKeys: (keys: ApiKeys) => void;
  setPrompts: (prompts: Prompts) => void;
  setAlertSettings: (settings: AlertSettings) => void;
  setSotSettings: (settings: SotSettings) => void;
  setSystemPreferences: (prefs: SystemPreferences) => void;
  handleTranscriptionComplete: (transcription: TranscriptionItem) => void;
  handleUpdateTranscription: (id: number, text: string) => Promise<void>;
  handleUpdateTags: (id: number, tags: string[]) => Promise<void>;
  clearHistory: () => void;
  handleDeleteTranscription: (id: number) => Promise<void>;
  onSelectTranscription: (item: TranscriptionItem) => void;
  onBack: () => void;
}

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="loader" style={{ fontSize: '2rem', color: 'var(--primary-color)' }}></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function AppRoutes({
  transcriptions,
  isLoadingData,
  selectedTranscription,
  theme,
  apiKeys,
  prompts,
  alertSettings,
  sotSettings,
  systemPreferences,
  setTheme,
  setApiKeys,
  setPrompts,
  setAlertSettings,
  setSotSettings,
  setSystemPreferences,
  handleTranscriptionComplete,
  handleUpdateTranscription,
  handleUpdateTags,
  clearHistory,
  handleDeleteTranscription,
  onSelectTranscription,
  onBack,
}: AppRoutesProps) {
  const { user } = useAuth();

  // If not logged in, show login
  if (!user) {
    return <LoginView />;
  }

  return (
    <MainLayout>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<Navigate to="/transcribe" replace />} />

        {/* Transcribe route */}
        <Route
          path="/transcribe"
          element={
            <ProtectedRoute>
              <TranscribeView
                onTranscriptionComplete={handleTranscriptionComplete}
                apiKeys={apiKeys}
                prompts={prompts}
              />
            </ProtectedRoute>
          }
        />

        {/* History routes */}
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              {isLoadingData ? (
                <p style={{ padding: '2rem', textAlign: 'center' }}>Cargando datos...</p>
              ) : (
                <HistoryView
                  transcriptions={transcriptions}
                  clearHistory={clearHistory}
                  onDeleteTranscription={handleDeleteTranscription}
                  onSelectTranscription={onSelectTranscription}
                />
              )}
            </ProtectedRoute>
          }
        />

        <Route
          path="/history/:id"
          element={
            <ProtectedRoute>
              {selectedTranscription ? (
                <TranscriptionDetailView
                  item={selectedTranscription}
                  onBack={onBack}
                  onUpdateTranscription={handleUpdateTranscription}
                  onUpdateTags={handleUpdateTags}
                  apiKeys={apiKeys}
                  prompts={prompts}
                />
              ) : (
                <Navigate to="/history" replace />
              )}
            </ProtectedRoute>
          }
        />

        {/* Settings route */}
        <Route
          path="/settings/*"
          element={
            <ProtectedRoute>
              <SettingsContainer
                theme={theme}
                setTheme={setTheme}
                transcriptions={transcriptions}
                apiKeys={apiKeys}
                setApiKeys={setApiKeys}
                prompts={prompts}
                setPrompts={setPrompts}
                alertSettings={alertSettings}
                setAlertSettings={setAlertSettings}
                sotSettings={sotSettings}
                setSotSettings={setSotSettings}
                systemPreferences={systemPreferences}
                setSystemPreferences={setSystemPreferences}
              />
            </ProtectedRoute>
          }
        />

        {/* Login route */}
        <Route path="/login" element={<LoginView />} />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
}

