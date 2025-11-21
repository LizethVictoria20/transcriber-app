import React, { useState } from 'react';
import type { SotSettings, SettingsViewType } from './types';

interface SotViewProps {
    sotSettings: SotSettings;
    setSotSettings: (settings: SotSettings) => void;
    setSettingsView: (view: SettingsViewType) => void;
}

export default function SotView({ sotSettings, setSotSettings, setSettingsView }: SotViewProps) {
    const [localSettings, setLocalSettings] = useState<SotSettings>(sotSettings);
    const [saved, setSaved] = useState(false);
    
    const handleSave = () => {
        setSotSettings(localSettings);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div>
            <div className="settings-page-header">
                 <button className="button secondary" onClick={() => setSettingsView('main')}>
                    &larr; Volver
                </button>
                <h2>SOT (Fuente de Verdad)</h2>
            </div>

            <p className="settings-description">
                Gestiona la documentación y especificaciones del sistema. Este es el lugar central para registrar la versión, cambios importantes y cómo funciona el sistema.
            </p>
            <div className="form-group">
                <label htmlFor="sot-version">Versión del Sistema</label>
                 <input
                    type="text"
                    id="sot-version"
                    value={localSettings.version}
                    onChange={(e) => setLocalSettings({...localSettings, version: e.target.value})}
                />
                <small>La versión actual del sistema (ej. 1.0.0).</small>
            </div>
            <div className="form-group">
                <label htmlFor="sot-changes">Cambios Importantes (Changelog)</label>
                <textarea
                    id="sot-changes"
                    value={localSettings.importantChanges}
                    onChange={(e) => setLocalSettings({...localSettings, importantChanges: e.target.value})}
                    style={{minHeight: '150px'}}
                />
                <small>Lista de los cambios más recientes o significativos en el sistema.</small>
            </div>
            <div className="form-group">
                <label htmlFor="sot-description">Descripción del Sistema</label>
                <textarea
                    id="sot-description"
                    value={localSettings.systemDescription}
                    onChange={(e) => setLocalSettings({...localSettings, systemDescription: e.target.value})}
                    style={{minHeight: '200px'}}
                />
                <small>Una descripción detallada de cómo funciona el sistema, su arquitectura, componentes clave y cómo fue creado.</small>
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