
import React, { useState } from 'react';
import type { SystemPreferences, SettingsViewType, RetryCategory } from '../../../types';

interface SystemPreferencesViewProps {
    preferences: SystemPreferences;
    setPreferences: (prefs: SystemPreferences) => void;
    setSettingsView: (view: SettingsViewType) => void;
}

export default function SystemPreferencesView({ preferences, setPreferences, setSettingsView }: SystemPreferencesViewProps) {
    const [localPrefs, setLocalPrefs] = useState<SystemPreferences>(preferences);
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setPreferences(localPrefs);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleToggle = (key: keyof SystemPreferences) => {
        if (typeof localPrefs[key] === 'boolean') {
            setLocalPrefs(prev => ({ ...prev, [key]: !prev[key] }));
        }
    };

    const updateRetryPolicy = (
        category: keyof SystemPreferences['retryPolicy'], 
        field: keyof RetryCategory, 
        value: any
    ) => {
        setLocalPrefs(prev => ({
            ...prev,
            retryPolicy: {
                ...prev.retryPolicy,
                [category]: {
                    ...prev.retryPolicy[category],
                    [field]: value
                }
            }
        }));
    };

    const InfoTooltip = ({ text }: { text: string }) => (
        <div className="info-tooltip-container">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="info-icon">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 0 1 .67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 1 1-.671-1.34l.041-.022ZM12 9a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
            </svg>
            <span className="tooltip-content">{text}</span>
        </div>
    );

    const renderRetryRow = (
        title: string, 
        categoryKey: keyof SystemPreferences['retryPolicy']
    ) => {
        const category = localPrefs.retryPolicy?.[categoryKey] || { maxRetries: 0, backoff: 'fixed' };

        return (
            <div style={{marginBottom: '1.5rem'}}>
                <h4 style={{fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-color)'}}>{title}</h4>
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor={`retry-${categoryKey}-count`}>
                            Máximo de Reintentos
                            <InfoTooltip text="Número máximo de veces que el sistema intentará repetir una operación fallida antes de marcarla como error definitivo." />
                        </label>
                        <input 
                            type="number" 
                            id={`retry-${categoryKey}-count`}
                            min="0"
                            max="10"
                            value={category.maxRetries}
                            onChange={(e) => updateRetryPolicy(categoryKey, 'maxRetries', parseInt(e.target.value) || 0)}
                            className="custom-input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor={`retry-${categoryKey}-backoff`}>
                            Estrategia de Backoff
                            <InfoTooltip text="Estrategia de espera entre reintentos: Fijo mantiene 30 segundos constantes, Exponencial duplica el tiempo en cada intento (30s, 60s, 120s...)." />
                        </label>
                        <select 
                            id={`retry-${categoryKey}-backoff`}
                            value={category.backoff}
                            onChange={(e) => updateRetryPolicy(categoryKey, 'backoff', e.target.value)}
                            className="custom-select"
                        >
                            <option value="fixed">Fijo</option>
                            <option value="exponential">Exponencial</option>
                        </select>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className="settings-page-header">
                 <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition" onClick={() => setSettingsView('main')}>
                    &larr; Volver
                </button>
                <h2>Preferencias del Sistema</h2>
            </div>

            <p className="settings-description">
                Configure las variables globales del sistema, incluyendo localización, límites operativos y políticas de ejecución.
            </p>

            <div className="settings-category">
                <h3 className="settings-section-header">Configuración General</h3>
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="timezone-select">Zona Horaria</label>
                        <select 
                            id="timezone-select"
                            value={localPrefs.timezone}
                            onChange={(e) => setLocalPrefs({...localPrefs, timezone: e.target.value})}
                            className="custom-select"
                        >
                            <option value="browser">Predeterminado del Navegador</option>
                            <option value="UTC">UTC (Tiempo Universal Coordinado)</option>
                            <option value="America/Bogota">América/Bogotá (COT)</option>
                            <option value="America/New_York">América/New York (EST/EDT)</option>
                            <option value="America/Mexico_City">América/Ciudad de México (CST)</option>
                            <option value="America/Lima">América/Lima (PET)</option>
                            <option value="America/Santiago">América/Santiago (CLT)</option>
                            <option value="America/Buenos_Aires">América/Buenos Aires (ART)</option>
                            <option value="Europe/Madrid">Europa/Madrid (CET/CEST)</option>
                            <option value="Europe/London">Europa/Londres (GMT/BST)</option>
                        </select>
                        <small>Afecta cómo se muestran las fechas en el historial.</small>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="language-select">Idioma del Sistema</label>
                        <select 
                            id="language-select"
                            value={localPrefs.language}
                            onChange={(e) => setLocalPrefs({...localPrefs, language: e.target.value})}
                            className="custom-select"
                        >
                            <option value="es">Español</option>
                            <option value="en">English</option>
                        </select>
                         <small>Idioma de la interfaz de usuario.</small>
                    </div>
                </div>
            </div>

            <div className="settings-category">
                <h3 className="settings-section-header">Límites de Carga</h3>
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="max-upload">
                            Tamaño de archivo (MB)
                            <InfoTooltip text="Tamaño máximo permitido para archivos PDF que se pueden subir al sistema. Archivos más grandes serán rechazados antes del procesamiento." />
                        </label>
                        <input 
                            type="number" 
                            id="max-upload"
                            min="1"
                            max="500"
                            value={localPrefs.maxUploadSizeMB}
                            onChange={(e) => setLocalPrefs({...localPrefs, maxUploadSizeMB: parseInt(e.target.value) || 10})}
                            className="custom-input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="max-pages">
                            Máximo de Páginas por Documento
                            <InfoTooltip text="Número máximo de páginas que puede tener un documento PDF. Documentos con más páginas serán rechazados para evitar sobrecargar el sistema." />
                        </label>
                        <input 
                            type="number" 
                            id="max-pages"
                            min="1"
                            max="1000"
                            value={localPrefs.maxPageLimit}
                            onChange={(e) => setLocalPrefs({...localPrefs, maxPageLimit: parseInt(e.target.value) || 100})}
                            className="custom-input"
                        />
                    </div>
                </div>
            </div>

            <div className="settings-category">
                <h3 className="settings-section-header">Estimación de Costos y Tiempo</h3>
                <div className="alert-settings-list" style={{marginBottom: '1.5rem'}}>
                     <div className="alert-setting-item">
                        <div className="alert-setting-text">
                            <span className="alert-setting-label">Mostrar Estimaciones</span>
                            <p className="alert-setting-description">Visualizar el costo estimado y tiempo de procesamiento antes de iniciar una transcripción.</p>
                        </div>
                        <label className="toggle-switch">
                            <input 
                                type="checkbox" 
                                checked={localPrefs.showEstimates} 
                                onChange={() => handleToggle('showEstimates')} 
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="cost-per-page">
                            Costo Promedio por Página (USD)
                            <InfoTooltip text="Costo estimado promedio por página procesada en USD. Usado para calcular el costo total aproximado de una transcripción." />
                        </label>
                        <input 
                            type="number" 
                            id="cost-per-page"
                            step="0.000001"
                            min="0"
                            value={localPrefs.costPerPage}
                            onChange={(e) => setLocalPrefs({...localPrefs, costPerPage: parseFloat(e.target.value) || 0})}
                            className="custom-input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="time-per-page">
                            Tiempo Medio por Página (segundos)
                            <InfoTooltip text="Tiempo promedio en segundos que toma procesar cada página. Usado para calcular la duración estimada de una transcripción." />
                        </label>
                        <input 
                            type="number" 
                            id="time-per-page"
                            step="0.1"
                            min="0"
                            value={localPrefs.timePerPage}
                            onChange={(e) => setLocalPrefs({...localPrefs, timePerPage: parseFloat(e.target.value) || 0})}
                            className="custom-input"
                        />
                    </div>
                </div>
            </div>

            <div className="settings-category">
                <h3 className="settings-section-header">Política de Reintento</h3>
                {renderRetryRow("Errores de Red", "network")}
                {renderRetryRow("Timeouts", "timeout")}
                {renderRetryRow("Límites de Tasa (429)", "rateLimit")}
            </div>

            <div className="settings-actions">
                <button className="button" onClick={handleSave}>
                    Guardar Cambios
                </button>
                {saved && <span className="save-confirm">¡Guardado!</span>}
            </div>
        </div>
    );
}
