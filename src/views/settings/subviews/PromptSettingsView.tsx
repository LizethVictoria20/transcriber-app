
import React, { useState } from 'react';
import type { Prompts, SettingsViewType } from '../../../types';

interface PromptSettingsViewProps {
    prompts: Prompts;
    setPrompts: (prompts: Prompts) => void;
    setSettingsView: (view: SettingsViewType) => void;
}

export default function PromptSettingsView({ prompts, setPrompts, setSettingsView }: PromptSettingsViewProps) {
    const [localPrompts, setLocalPrompts] = useState<Prompts>(prompts);
    const [saved, setSaved] = useState(false);
    
    const handleSave = () => {
        setPrompts(localPrompts);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div>
            <div className="settings-page-header">
                 <button className="button secondary" onClick={() => setSettingsView('main')}>
                    &larr; Volver
                </button>
                <h2>Cadenas de Prompts</h2>
            </div>
            <p className="settings-description">
                Personaliza las instrucciones (prompts) que se envían a los modelos de IA. Esto te permite ajustar el tono, formato o estilo de las respuestas.
            </p>

            <div className="form-group">
                <label htmlFor="prompt-transcription">Prompt de Transcripción Estándar</label>
                <textarea 
                    id="prompt-transcription"
                    value={localPrompts.transcription}
                    onChange={(e) => setLocalPrompts({...localPrompts, transcription: e.target.value})}
                />
            </div>

            <div className="form-group">
                <label htmlFor="prompt-translate">Prompt de Traducción (Inglés -&gt; Español)</label>
                <textarea 
                    id="prompt-translate"
                    value={localPrompts.transcriptionTranslate}
                    onChange={(e) => setLocalPrompts({...localPrompts, transcriptionTranslate: e.target.value})}
                />
            </div>

            <div className="form-group">
                <label htmlFor="prompt-summary">Prompt de Resumen General</label>
                <textarea 
                    id="prompt-summary"
                    value={localPrompts.summary}
                    onChange={(e) => setLocalPrompts({...localPrompts, summary: e.target.value})}
                />
                <small>Utiliza [TRANSCRIPTION] como marcador de posición para el texto extraído.</small>
            </div>

             <div className="form-group">
                <label htmlFor="prompt-page-summary">Prompt de Resumen por Página</label>
                <textarea 
                    id="prompt-page-summary"
                    value={localPrompts.pageSummary}
                    onChange={(e) => setLocalPrompts({...localPrompts, pageSummary: e.target.value})}
                />
                <small>Instrucción para generar la tabla de resumen desglosada por páginas.</small>
            </div>

            <div className="form-group">
                <label htmlFor="prompt-auto-tagging">Prompt de Etiquetado Inteligente</label>
                <textarea 
                    id="prompt-auto-tagging"
                    value={localPrompts.autoTagging}
                    onChange={(e) => setLocalPrompts({...localPrompts, autoTagging: e.target.value})}
                />
                <small>Instrucción para generar etiquetas sugeridas en formato JSON.</small>
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
