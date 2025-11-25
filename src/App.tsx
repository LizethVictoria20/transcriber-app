
import React, { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import MainLayout from './layouts/MainLayout';
import TranscribeView from './views/transcribe/TranscribeView';
import HistoryView from './views/history/HistoryView';
import TranscriptionDetailView from './views/history/TranscriptionDetailView';
import SettingsContainer from './views/settings/SettingsContainer';
import LoginView from './views/auth/LoginView';
import { AuthProvider, useAuth } from './context/AuthContext';
import { dbService } from './services/database';
import type { TranscriptionItem, Prompts, ApiKeys, AlertSettings, SotSettings, SystemPreferences } from './types';

const defaultPrompts: Prompts = {
    transcription: "Transcribe el texto de esta imagen. Mantén el formato original tanto como sea posible.",
    transcriptionTranslate: "Transcribe el texto de esta imagen traduciéndolo directamente del inglés al español. Mantén el formato original y el sentido del texto.",
    summary: "Analiza la siguiente transcripción de un documento y extrae las partes o temas más importantes. Para cada parte, proporciona un título conciso (topic) y un breve resumen (summary). La transcripción es:\n\n[TRANSCRIPTION]",
    pageSummary: "Analiza el siguiente texto, que contiene transcripciones de un documento PDF separadas por marcadores de página (ej: --- PÁGINA X ---). Genera un resumen conciso del contenido específico de cada página individualmente. La transcripción es:\n\n[TRANSCRIPTION]",
    autoTagging: "Analiza la siguiente transcripción y genera una lista de 3 a 5 etiquetas (tags) cortas y relevantes que clasifiquen este documento (ej: 'Factura', 'Legal', 'Médico', 'Contrato', 'Urgente'). Devuelve SOLO un array JSON de strings.\n\n[TRANSCRIPTION]"
};

const defaultAlertSettings: AlertSettings = {
    emailNotifications: true,
    failureRate: true,
    lowDiskSpace: false,
    sslCertificateExpiry: true,
};

const defaultSotSettings: SotSettings = {
    version: '1.0.0',
    importantChanges: '- Integración completa con Supabase (Database y Storage).\n- Persistencia en la nube.\n- Autenticación real.',
    systemDescription: 'PDF Transcriber es una aplicación web diseñada para extraer texto de documentos PDF utilizando modelos avanzados de inteligencia artificial. Los datos se almacenan de forma segura en Supabase (PostgreSQL).'
};

const defaultSystemPreferences: SystemPreferences = {
    timezone: 'browser',
    language: 'es',
    maxUploadSizeMB: 50,
    maxPageLimit: 100,
    showEstimates: true,
    costPerPage: 0.000125,
    timePerPage: 5.0,
    retryPolicy: {
        network: { maxRetries: 3, backoff: 'exponential' },
        timeout: { maxRetries: 1, backoff: 'fixed' },
        rateLimit: { maxRetries: 3, backoff: 'exponential' }
    }
};

function AppContent() {
    const { user, loading } = useAuth();
    const [view, setView] = useState('transcribe');
    
    // Transcriptions now come from DB, no local storage sync needed for the list itself
    const [transcriptions, setTranscriptions] = useState<TranscriptionItem[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

    const [selectedTranscription, setSelectedTranscription] = useState<TranscriptionItem | null>(null);
    
    // Settings still in LocalStorage for now (can be migrated to DB 'user_settings' table later)
    const [theme, setTheme] = useLocalStorage<string>('theme', 'light');
    const [apiKeys, setApiKeys] = useLocalStorage<ApiKeys>('apiKeys', { openai: '' });
    const [prompts, setPrompts] = useLocalStorage<Prompts>('prompts', defaultPrompts);
    const [alertSettings, setAlertSettings] = useLocalStorage<AlertSettings>('alertSettings', defaultAlertSettings);
    const [sotSettings, setSotSettings] = useLocalStorage<SotSettings>('sotSettings', defaultSotSettings);
    const [systemPreferences, setSystemPreferences] = useLocalStorage<SystemPreferences>('systemPreferences_v2', defaultSystemPreferences);

    useEffect(() => {
      const root = window.document.documentElement;

      // Primero removemos ambas clases para evitar conflictos
      root.classList.remove("light", "dark");

      if (theme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.add("light");
      }
    }, [theme]);

    // Load data from Supabase when user logs in
    useEffect(() => {
        if (user) {
            setIsLoadingData(true);
            dbService.getAllTranscriptions()
                .then(data => setTranscriptions(data))
                .catch(err => console.error("Failed to load transcriptions", err))
                .finally(() => setIsLoadingData(false));
        } else {
            setTranscriptions([]);
        }
    }, [user]);

    if (loading) {
        return (
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
                <div className="loader" style={{fontSize: '2rem', color: 'var(--primary-color)'}}></div>
            </div>
        );
    }

    if (!user) {
        return <LoginView />;
    }

    const handleTabChange = (newView: string) => {
        setView(newView);
        if (newView !== 'history') {
            setSelectedTranscription(null);
        }
    }

    const handleTranscriptionComplete = (newTranscription: TranscriptionItem) => {
        // Add to local state immediately for UI responsiveness
        setTranscriptions(prev => [newTranscription, ...prev]);
        setSelectedTranscription(newTranscription);
        setView('history');
    };

    const handleUpdateTranscription = async (id: number, newText: string) => {
        // Optimistic update
        setTranscriptions(prev => prev.map(item => 
            item.id === id ? { ...item, transcription: newText } : item
        ));
        if (selectedTranscription && selectedTranscription.id === id) {
            setSelectedTranscription(prev => prev ? { ...prev, transcription: newText } : null);
        }

        // Persist to DB
        try {
            await dbService.updateTranscriptionText(id, newText);
        } catch (error) {
            console.error("Failed to save changes to DB", error);
            alert("Error guardando cambios en la nube.");
        }
    };

    const handleUpdateTags = async (id: number, newTags: string[]) => {
        setTranscriptions(prev => prev.map(item => 
            item.id === id ? { ...item, tags: newTags } : item
        ));
        
        if (selectedTranscription && selectedTranscription.id === id) {
            setSelectedTranscription(prev => prev ? { ...prev, tags: newTags } : null);
        }

        try {
            await dbService.updateTranscriptionTags(id, newTags);
        } catch (error) {
            console.error("Failed to save tags to DB", error);
        }
    }

    const clearHistory = async () => {
        // Implementation note: Deleting from DB not implemented in this turn, 
        // just clearing local view for now or require a DB delete function.
        if(window.confirm("¿Estás seguro? Esto borrará la vista local. (La eliminación en BD requiere implementación adicional)")) {
            setTranscriptions([]);
            setSelectedTranscription(null);
        }
    }

    const renderHistory = () => {
        if (selectedTranscription) {
            return (
                <TranscriptionDetailView 
                    item={selectedTranscription} 
                    onBack={() => setSelectedTranscription(null)} 
                    onUpdateTranscription={handleUpdateTranscription}
                    onUpdateTags={handleUpdateTags}
                    apiKeys={apiKeys}
                    prompts={prompts}
                />
            );
        }
        return (
            <HistoryView 
                transcriptions={transcriptions} 
                clearHistory={clearHistory} 
                onSelectTranscription={setSelectedTranscription}
            />
        );
    };

    return (
        <MainLayout currentView={view} onNavigate={handleTabChange}>
            {view === 'transcribe' && <TranscribeView onTranscriptionComplete={handleTranscriptionComplete} apiKeys={apiKeys} prompts={prompts} />}
            {view === 'history' && (isLoadingData ? <p style={{padding:'2rem', textAlign:'center'}}>Cargando datos...</p> : renderHistory())}
            {view === 'settings' && (
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
            )}
        </MainLayout>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}
