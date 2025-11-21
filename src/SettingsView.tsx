import React from 'react';
import type { SettingsViewType } from './types';

interface SettingsViewProps {
    theme: string;
    setTheme: (theme: string) => void;
    setSettingsView: (view: SettingsViewType) => void;
}

export default function SettingsView({ theme, setTheme, setSettingsView }: SettingsViewProps) {

    return (
        <div>
            <h2>Configuración</h2>

            <div className="settings-category">
                 <h3 className="settings-section-header">Inteligencia Artificial</h3>
                 <div className="settings-menu">
                     <div className="settings-menu-item" onClick={() => setSettingsView('api')}>
                         <div className="settings-menu-item-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" /></svg>
                        </div>
                        <div className="settings-menu-item-text">
                            <h4>APIs y Credenciales</h4>
                            <p>Gestiona las claves de API para servicios de terceros.</p>
                        </div>
                    </div>
                     <div className="settings-menu-item" onClick={() => setSettingsView('prompts')}>
                         <div className="settings-menu-item-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 1-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 1 3.09-3.09L12 5.25l.813 2.846a4.5 4.5 0 0 1 3.09 3.09L18.75 12l-2.846.813a4.5 4.5 0 0 1-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.898 20.572 16.5 21.75l-.398-1.178a3.375 3.375 0 0 0-2.3-2.3L12.75 18l1.178-.398a3.375 3.375 0 0 0 2.3-2.3L16.5 14.25l.398 1.178a3.375 3.375 0 0 0 2.3 2.3l1.178.398-1.178.398a3.375 3.375 0 0 0-2.3 2.3Z" /></svg>
                        </div>
                        <div className="settings-menu-item-text">
                            <h4>Cadenas de Prompts</h4>
                            <p>Personaliza las instrucciones enviadas a los modelos de IA.</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="settings-category">
                 <h3 className="settings-section-header">Monitoreo</h3>
                 <div className="settings-menu">
                    <div className="settings-menu-item" onClick={() => setSettingsView('metrics')}>
                         <div className="settings-menu-item-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>
                        </div>
                        <div className="settings-menu-item-text">
                            <h4>Métricas y Dashboard</h4>
                            <p>Vista rápida de métricas del sistema y estado operativo.</p>
                        </div>
                    </div>
                    <div className="settings-menu-item" onClick={() => setSettingsView('alerts')}>
                        <div className="settings-menu-item-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg>
                        </div>
                        <div className="settings-menu-item-text">
                            <h4>Alertas y Notificaciones</h4>
                            <p>Configurar umbrales de alertas y ver el estado del sistema.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="settings-category">
                 <h3 className="settings-section-header">Sistemas</h3>
                 <div className="settings-menu">
                    <div className="settings-menu-item" onClick={() => setSettingsView('systemPrefs')}>
                        <div className="settings-menu-item-icon">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                        </div>
                        <div className="settings-menu-item-text">
                            <h4>Preferencias del Sistema</h4>
                            <p>Zona horaria, idioma, límites y políticas de carga.</p>
                        </div>
                    </div>
                    <div className="settings-menu-item" onClick={() => setSettingsView('sot')}>
                         <div className="settings-menu-item-icon">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6-2.292m0 0V21" /></svg>
                        </div>
                        <div className="settings-menu-item-text">
                            <h4>SOT (Fuente de Verdad)</h4>
                            <p>Documentación y especificaciones del sistema.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="settings-category">
                <h3 className="settings-section-header">Apariencia</h3>
                <p className="settings-description">Selecciona un tema para la aplicación.</p>
                <div className="theme-options">
                    <button 
                        className={`button ${theme === 'light' ? '' : 'secondary'}`} 
                        onClick={() => setTheme('light')}
                    >
                        Claro
                    </button>
                    <button 
                        className={`button ${theme === 'dark' ? '' : 'secondary'}`} 
                        onClick={() => setTheme('dark')}
                    >
                        Oscuro
                    </button>
                </div>
            </div>
            
        </div>
    );
}