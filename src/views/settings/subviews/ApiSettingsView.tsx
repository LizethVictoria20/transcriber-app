import React, { useState } from "react";
import type { SettingsViewType, ApiKeys } from "../../../types";

interface ApiSettingsViewProps {
  apiKeys: ApiKeys;
  setApiKeys: (keys: ApiKeys) => void;
  setSettingsView: (view: SettingsViewType) => void;
}

export default function ApiSettingsView({
  apiKeys,
  setApiKeys,
  setSettingsView,
}: ApiSettingsViewProps) {
  const [localKeys, setLocalKeys] = useState<ApiKeys>(apiKeys);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setApiKeys(localKeys);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div className="settings-page-header">
        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition font-semibold"
          onClick={() => setSettingsView("main")}
        >
          &larr; Volver
        </button>
        <h2>APIs y Credenciales</h2>
      </div>
      <p className="settings-description">
        Introduce tu clave de API para el servicio de OpenAI. Tu clave se guarda
        de forma segura en tu navegador y nunca sale de tu dispositivo. La clave
        API de Google Gemini se debe configurar a través de la variable de
        entorno API_KEY.
      </p>

      <div className="form-group">
        <label htmlFor="openai-key">Clave API de OpenAI</label>
        <div className="api-key-input-wrapper">
          <input
            type={showOpenAIKey ? "text" : "password"}
            id="openai-key"
            placeholder="Pega tu clave API de OpenAI aquí"
            value={localKeys.openai}
            onChange={(e) =>
              setLocalKeys({ ...localKeys, openai: e.target.value })
            }
          />
          <button
            onClick={() => setShowOpenAIKey(!showOpenAIKey)}
            className="toggle-visibility"
          >
            {showOpenAIKey ? "Ocultar" : "Mostrar"}
          </button>
        </div>
        <small>
          Obtén tu clave en{" "}
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
          >
            la plataforma de OpenAI
          </a>
          .
        </small>
      </div>

      <div className="form-group">
        <label htmlFor="gemini-key">Clave API de Google Gemini</label>
        <div className="api-key-input-wrapper">
          <input
            type={showOpenAIKey ? "text" : "password"}
            id="gemini-key"
            placeholder="Pega tu clave API de Gemini aquí"
            value={localKeys.gemini || ""}
            onChange={(e) =>
              setLocalKeys({ ...localKeys, gemini: e.target.value })
            }
          />
        </div>
        <small>
          Obtén tu clave en{" "}
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google AI Studio
          </a>
          .
        </small>
      </div>

      <div className="settings-actions">
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition font-semibold" onClick={handleSave}>
          Guardar Cambios
        </button>
        {saved && <span className="save-confirm">¡Guardado!</span>}
      </div>
    </div>
  );
}
