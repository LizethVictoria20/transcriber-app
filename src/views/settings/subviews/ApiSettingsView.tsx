import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ApiKeys } from "../../../types";
import {
  HiOutlineArrowLeft,
  HiOutlineShieldCheck,
  HiOutlineKey,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiCheckCircle,
  HiOutlineCpuChip,
  HiSparkles,
} from "react-icons/hi2";

interface ApiSettingsViewProps {
  apiKeys: ApiKeys;
  setApiKeys: (keys: ApiKeys) => void;
}

export default function ApiSettingsView({
  apiKeys,
  setApiKeys,
}: ApiSettingsViewProps) {
  const navigate = useNavigate();
  const [localKeys, setLocalKeys] = useState<ApiKeys>(apiKeys);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setApiKeys(localKeys);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 font-sans text-slate-800">
      {/* --- HEADER --- */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/settings")}
          className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
        >
          <HiOutlineArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            APIs y Credenciales
          </h2>
          <p className="text-sm text-slate-500">
            Configura los motores de inteligencia artificial.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 mb-8">
        <div className="p-2 bg-blue-100 rounded-lg text-blue-600 shrink-0 h-fit">
          <HiOutlineShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-sm text-blue-800 leading-relaxed">
          <p className="font-bold mb-1">Tus claves están seguras</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-slate-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
              <HiOutlineCpuChip className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">OpenAI (GPT-4o)</h3>
              <p className="text-xs text-slate-500">
                Recomendado para mayor precisión legal.
              </p>
            </div>
          </div>

          <div className="relative">
            <input
              type={showOpenAIKey ? "text" : "password"}
              id="openai-key"
              placeholder="sk-..."
              value={localKeys.openai}
              onChange={(e) =>
                setLocalKeys({ ...localKeys, openai: e.target.value })
              }
              className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm font-mono text-slate-700 placeholder:text-slate-300"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <HiOutlineKey className="w-5 h-5" />
            </div>
            <button
              onClick={() => setShowOpenAIKey(!showOpenAIKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors p-1"
            >
              {showOpenAIKey ? (
                <HiOutlineEyeSlash className="w-5 h-5" />
              ) : (
                <HiOutlineEye className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="mt-3 flex justify-end">
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
            >
              Obtener API Key &rarr;
            </a>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-slate-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg border border-purple-100">
              <HiSparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Google Gemini</h3>
              <p className="text-xs text-slate-500">
                Opción rápida y económica para borradores.
              </p>
            </div>
          </div>

          <div className="relative">
            <input
              type={showOpenAIKey ? "text" : "password"}
              id="gemini-key"
              placeholder="AIza..."
              value={localKeys.gemini || ""}
              onChange={(e) =>
                setLocalKeys({ ...localKeys, gemini: e.target.value })
              }
              className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm font-mono text-slate-700 placeholder:text-slate-300"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <HiOutlineKey className="w-5 h-5" />
            </div>
            <button
              onChange={(e) =>
                setLocalKeys({ ...localKeys, gemini: e.target.value })
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 transition-colors p-1"
            >
              {showOpenAIKey ? (
                <HiOutlineEyeSlash className="w-5 h-5" />
              ) : (
                <HiOutlineEye className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="mt-3 flex justify-end">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-purple-600 hover:text-purple-800 hover:underline flex items-center gap-1"
            >
              Obtener API Key &rarr;
            </a>
          </div>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-slate-200 flex items-center justify-end gap-4">
        {saved && (
          <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 animate-fadeIn">
            <HiCheckCircle className="w-5 h-5" />
            ¡Cambios guardados!
          </span>
        )}
        <button
          onClick={handleSave}
          className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 transition-all transform active:scale-95 flex items-center gap-2"
        >
          Guardar Configuración
        </button>
      </div>
    </div>
  );
}
