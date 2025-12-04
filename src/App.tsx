
import React, { useState, useEffect } from 'react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { useLocalStorage } from './hooks/useLocalStorage';
import AppRoutes from './routes';
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
    // Critical Alerts
    databaseUnavailable: { enabled: true, triggerCount: 0 },
    workerFailure: { enabled: true, triggerCount: 0 },
    memoryExhausted: { enabled: true, triggerCount: 0 },
    diskSpaceCritical: { enabled: true, triggerCount: 0 },
    aiApisUnavailable: { enabled: true, triggerCount: 0 },
    documentProcessingFailure: { enabled: true, triggerCount: 0 },
    // High Severity
    responseTimeSlow: { enabled: true, triggerCount: 0 },
    transcriptionQueueBlocked: { enabled: true, triggerCount: 0 },
    aiApiErrors: { enabled: true, triggerCount: 0 },
    fileUploadFailures: { enabled: true, triggerCount: 0 },
    // Medium Severity
    sslCertificateExpiry: { enabled: false, triggerCount: 0 },
    highCpuUsage: { enabled: false, triggerCount: 0 },
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
    const navigate = useNavigate();
    
    // Transcriptions now come from DB, no local storage sync needed for the list itself
    const [transcriptions, setTranscriptions] = useState<TranscriptionItem[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

    const [selectedTranscription, setSelectedTranscription] = useState<TranscriptionItem | null>(null);
    
    // Settings still in LocalStorage for now (can be migrated to DB 'user_settings' table later)
    const [theme, setTheme] = useLocalStorage<string>('theme', 'light');
    const [apiKeys, setApiKeys] = useLocalStorage<ApiKeys>('apiKeys', { openai: '' });
    const [prompts, setPrompts] = useLocalStorage<Prompts>('prompts', defaultPrompts);
    const [alertSettings, setAlertSettings] = useLocalStorage<AlertSettings>('alertSettings_v2', defaultAlertSettings);
    const [sotSettings, setSotSettings] = useLocalStorage<SotSettings>('sotSettings', defaultSotSettings);
    const [systemPreferences, setSystemPreferences] = useLocalStorage<SystemPreferences>('systemPreferences_v2', defaultSystemPreferences);

    useEffect(() => {
    const root = window.document.documentElement;

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
            dbService.getAllTranscriptions(user.id)
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

    const handleTranscriptionComplete = (newTranscription: TranscriptionItem) => {
        // Add to local state immediately for UI responsiveness
        setTranscriptions(prev => [newTranscription, ...prev]);
        setSelectedTranscription(newTranscription);
        navigate('/history');
    };

    const handleSelectTranscription = (item: TranscriptionItem) => {
        setSelectedTranscription(item);
        navigate(`/history/${item.id}`);
    };

    const handleBackFromDetail = () => {
        setSelectedTranscription(null);
        navigate('/history');
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

    const handleDeleteTranscription = async (id: number) => {
        console.log('🟢 handleDeleteTranscription llamado con ID:', id);
        console.log('🟢 Transcripciones actuales:', transcriptions.length);
        
        console.log('🟢 Actualizando estado local...');
        // Optimistic update in local state
        setTranscriptions(prev => {
            const newList = prev.filter(t => t.id !== id);
            console.log('🟢 Nueva lista tiene', newList.length, 'items');
            return newList;
        });
        
        if (selectedTranscription && selectedTranscription.id === id) {
            setSelectedTranscription(null);
        }

        console.log('🟢 Llamando a dbService.deleteTranscription...');
        try {
            await dbService.deleteTranscription(id);
            console.log('✅ Transcripción eliminada de la BD exitosamente');
        } catch (error) {
            console.error("❌ Error eliminando de la BD:", error);
            alert("No se pudo eliminar la transcripción de la base de datos. Recarga la página para reintentar.");

            // Try to reload data to keep UI consistent
            try {
                setIsLoadingData(true);
                const data = await dbService.getAllTranscriptions(user ? user.id : null);
                setTranscriptions(data);
            } catch (reloadError) {
                console.error("Failed to reload transcriptions after delete error", reloadError);
            } finally {
                setIsLoadingData(false);
            }
        }
    }

    const clearHistory = async () => {
        if (!transcriptions.length) {
            return;
        }

        const ids = transcriptions.map(t => t.id);

        // Optimistic: limpiamos la vista inmediatamente
        setTranscriptions([]);
        setSelectedTranscription(null);

        try {
            await Promise.all(ids.map(id => dbService.deleteTranscription(id)));
        } catch (error) {
            console.error("Failed to clear history from DB", error);
            alert("Ocurrió un error eliminando el historial en la base de datos. Recarga la página para verificar el estado.");

            // Intentar recargar datos reales desde la BD
            try {
                setIsLoadingData(true);
                const data = await dbService.getAllTranscriptions(user ? user.id : null);
                setTranscriptions(data);
            } catch (reloadError) {
                console.error("Failed to reload transcriptions after clear error", reloadError);
            } finally {
                setIsLoadingData(false);
            }
        }
    }

    return (
        <AppRoutes
            transcriptions={transcriptions}
            isLoadingData={isLoadingData}
            selectedTranscription={selectedTranscription}
            theme={theme}
            apiKeys={apiKeys}
            prompts={prompts}
            alertSettings={alertSettings}
            sotSettings={sotSettings}
            systemPreferences={systemPreferences}
            setTheme={setTheme}
            setApiKeys={setApiKeys}
            setPrompts={setPrompts}
            setAlertSettings={setAlertSettings}
            setSotSettings={setSotSettings}
            setSystemPreferences={setSystemPreferences}
            handleTranscriptionComplete={handleTranscriptionComplete}
            handleUpdateTranscription={handleUpdateTranscription}
            handleUpdateTags={handleUpdateTags}
            clearHistory={clearHistory}
            handleDeleteTranscription={handleDeleteTranscription}
            onSelectTranscription={handleSelectTranscription}
            onBack={handleBackFromDetail}
        />
    );
}

export default function App() {
    return (
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    );
}
