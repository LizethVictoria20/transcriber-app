
import React, { useState } from 'react';
import type { SettingsViewType, AlertSettings } from '../../../types';

interface AlertsViewProps {
    setSettingsView: (view: SettingsViewType) => void;
    alertSettings: AlertSettings;
    setAlertSettings: (settings: AlertSettings) => void;
}

const systemStatus = [
    { label: "Base de Datos", value: "Disponible", status: "operational" },
    { label: "Workers de Transcripción", value: "Operativo", status: "operational" },
    { label: "API de Google Gemini", value: "Operacional", status: "operational" },
    { label: "API de OpenAI", value: "Operacional", status: "operational" },
    { label: "Estado de la Memoria", value: "45% Usado", status: "operational" },
    { label: "Espacio del Disco", value: "60% Usado", status: "operational" },
    { label: "Uso de la CPU", value: "15% Carga", status: "operational" },
    { label: "Tiempo de Respuesta Promedio", value: "5.2s", status: "operational" },
    { label: "Falla de Procesamiento", value: "0.1% Tasa", status: "operational" },
    { label: "Falla de Carga de Archivos", value: "0.05% Tasa", status: "operational" },
    { label: "Cola de Transcripción", value: "0 Trabajos", status: "operational" },
    { label: "Certificado SSL", value: "Expira en 80 días", status: "warning" },
];

const AlertSettingItem: React.FC<{
    label: string;
    description: string;
    isEnabled: boolean;
    onToggle: () => void;
}> = ({ label, description, isEnabled, onToggle }) => (
    <div className="alert-setting-item">
        <div className="alert-setting-text">
            <span className="alert-setting-label">{label}</span>
            <p className="alert-setting-description">{description}</p>
        </div>
        <label className="toggle-switch">
            <input type="checkbox" checked={isEnabled} onChange={onToggle} />
            <span className="toggle-slider"></span>
        </label>
    </div>
);


export default function AlertsView({ setSettingsView, alertSettings, setAlertSettings }: AlertsViewProps) {
    const [localSettings, setLocalSettings] = useState<AlertSettings>(alertSettings);
    const [saved, setSaved] = useState(false);

    const handleToggle = (key: keyof AlertSettings) => {
        setLocalSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = () => {
        setAlertSettings(localSettings);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div>
            <div className="settings-page-header">
                <button className="button secondary" onClick={() => setSettingsView('main')}>
                    &larr; Volver
                </button>
                <h2>Alertas y Notificaciones</h2>
            </div>
             <p className="settings-description">
                Configurar umbrales de alertas y canales de notificación. El estado del sistema se actualiza en tiempo real.
            </p>

            <div className="settings-category">
                <h3 className="settings-section-header">Configuración de Alertas</h3>
                <div className="alert-settings-list">
                    <AlertSettingItem
                        label="Notificaciones por Correo Electrónico"
                        description="Activa para recibir todas las alertas habilitadas por correo electrónico."
                        isEnabled={localSettings.emailNotifications}
                        onToggle={() => handleToggle('emailNotifications')}
                    />
                     <AlertSettingItem
                        label="Falla de Procesamiento"
                        description="Recibir una alerta si la tasa de fallos de transcripción supera el 5%."
                        isEnabled={localSettings.failureRate}
                        onToggle={() => handleToggle('failureRate')}
                    />
                     <AlertSettingItem
                        label="Espacio de Disco Bajo"
                        description="Recibir una alerta si el espacio de disco disponible cae por debajo del 20%."
                        isEnabled={localSettings.lowDiskSpace}
                        onToggle={() => handleToggle('lowDiskSpace')}
                    />
                     <AlertSettingItem
                        label="Vencimiento del Certificado SSL"
                        description="Recibir una alerta cuando el certificado SSL esté a menos de 30 días de expirar."
                        isEnabled={localSettings.sslCertificateExpiry}
                        onToggle={() => handleToggle('sslCertificateExpiry')}
                    />
                </div>
                 <div className="form-group" style={{marginTop: '1.5rem'}}>
                    <label htmlFor="email-notification">Dirección de Correo para Alertas</label>
                    <input type="text" id="email-notification" placeholder="ejemplo@dominio.com" disabled={!localSettings.emailNotifications} />
                    <small>Las alertas se enviarán a esta dirección. (Función no implementada)</small>
                </div>
            </div>

            <div className="settings-actions">
                <button className="button" onClick={handleSave}>
                    Guardar Cambios
                </button>
                {saved && <span className="save-confirm">¡Guardado!</span>}
            </div>

            <div className="settings-category">
                <h3 className="settings-section-header">Estado del Sistema</h3>
                <div className="system-status-list">
                    {systemStatus.map(item => (
                        <div key={item.label} className="status-item">
                            <span className="status-item-label">{item.label}</span>
                            <span className="status-item-value">
                                {item.value}
                                <span className={`status-indicator ${item.status}`}></span>
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
