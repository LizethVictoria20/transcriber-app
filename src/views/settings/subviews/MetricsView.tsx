
import React, { useMemo } from 'react';
import type { TranscriptionItem, SettingsViewType } from '../../../types';

interface MetricsViewProps {
    transcriptions: TranscriptionItem[];
    setSettingsView: (view: SettingsViewType) => void;
}

export default function MetricsView({ transcriptions, setSettingsView }: MetricsViewProps) {
     const metrics = useMemo(() => {
        const totalTranscriptions = transcriptions.length;
        if (totalTranscriptions === 0) {
            return null;
        }

        const totalPages = transcriptions.reduce((sum, item) => sum + item.pageCount, 0);

        const transcriptionsByProvider = transcriptions.reduce((acc, item) => {
            acc[item.provider] = (acc[item.provider] || 0) + 1;
            return acc;
        }, {} as Record<'gemini' | 'openai', number>);

        const totalCost = transcriptions.reduce((sum, item) => {
            let cost = 0;
            if (item.provider === 'gemini') {
                cost = item.pageCount * 0.000125;
            } else {
                cost = item.pageCount * (850 / 1000000) * 5;
            }
            return sum + cost;
        }, 0);

        return {
            totalTranscriptions,
            totalPages,
            totalCost,
            transcriptionsByProvider,
        };
    }, [transcriptions]);

    return (
        <div>
            <div className="settings-page-header">
                <button className="button secondary" onClick={() => setSettingsView('main')}>
                    &larr; Volver
                </button>
                <h2>Métricas y Dashboard</h2>
            </div>
            
             <p className="settings-description">
                Vista rápida de métricas del sistema y estado operativo.
            </p>

            {!metrics ? (
                 <p>No hay datos disponibles. Realiza algunas transcripciones para ver las métricas.</p>
            ) : (
                <>
                    <div className="metrics-grid">
                        <div className="metric-card">
                            <div className="metric-label">Transcripciones Totales</div>
                            <div className="metric-value">{metrics.totalTranscriptions}</div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-label">Páginas Totales</div>
                            <div className="metric-value">{metrics.totalPages}</div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-label">Costo Total Estimado</div>
                            <div className="metric-value">${metrics.totalCost.toFixed(4)}</div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-label">Salud del Sistema</div>
                            <div className="metric-value" style={{fontSize: '1.2rem'}}>
                                <span className="status-indicator operational"></span> Operativo
                            </div>
                        </div>
                         <div className="metric-card">
                            <div className="metric-label">Tasa de Error</div>
                            <div className="metric-value">N/A</div>
                            <small className="metric-note">El seguimiento de errores no está implementado.</small>
                        </div>
                    </div>
                    <h3 style={{marginTop: '2rem'}}>Desglose por Modelo</h3>
                    <div className="metrics-grid">
                        <div className="metric-card">
                            <div className="metric-label">Google Gemini</div>
                            <div className="metric-value">{metrics.transcriptionsByProvider.gemini || 0}</div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-label">OpenAI GPT-4o</div>
                            <div className="metric-value">{metrics.transcriptionsByProvider.openai || 0}</div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
