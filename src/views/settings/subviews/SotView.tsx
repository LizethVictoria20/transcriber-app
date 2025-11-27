import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineArrowLeft,
  HiOutlineBookOpen,
  HiOutlineTag,
  HiOutlineClipboardDocumentList,
  HiCheckCircle,
  HiOutlineDocumentText,
  HiOutlinePencilSquare,
} from "react-icons/hi2";
import type { SotSettings } from "../../../types";

interface SotViewProps {
  sotSettings: SotSettings;
  setSotSettings: (settings: SotSettings) => void;
}

export default function SotView({
  sotSettings,
  setSotSettings,
}: SotViewProps) {
  const navigate = useNavigate();
  const [localSettings, setLocalSettings] = useState<SotSettings>(sotSettings);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSotSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 font-sans text-slate-800 dark:text-slate-100 pb-32">
      {/* --- HEADER --- */}
      <div className="flex items-center gap-4 mb-8">
        <button
          className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors border border-transparent hover:border-slate-200 dark:hover:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
          onClick={() => navigate("/settings")}
          title="Volver al menú"
        >
          <HiOutlineArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Fuente de Verdad (SOT)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Documentación centralizada, especificaciones y control de versiones
            del sistema.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* --- TARJETA 1: VERSIÓN --- */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center dark:bg-gray-900 dark:border-slate-700">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0 dark:bg-indigo-950/40 dark:text-indigo-300">
            <HiOutlineTag className="w-8 h-8" />
          </div>
          <div className="flex-1 w-full">
            <label
              htmlFor="sot-version"
              className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 dark:text-slate-400"
            >
              Versión Actual del Sistema
            </label>
            <div className="relative max-w-xs">
              <input
                type="text"
                id="sot-version"
                value={localSettings.version}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    version: e.target.value,
                  })
                }
                className="w-full pl-4 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500/30"
                placeholder="v1.0.0"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2 dark:text-slate-500">
              Identificador único para el despliegue actual.
            </p>
          </div>
        </div>

        {/* --- TARJETA 2: DESCRIPCIÓN TÉCNICA --- */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden dark:bg-gray-900 dark:border-slate-700">
          <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between dark:bg-slate-900/60 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <HiOutlineBookOpen className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 uppercase tracking-wide">
                Arquitectura y Descripción
              </h3>
            </div>
            <HiOutlinePencilSquare className="w-5 h-5 text-slate-300 dark:text-slate-500" />
          </div>

          <div className="p-6">
            <textarea
              id="sot-description"
              value={localSettings.systemDescription}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  systemDescription: e.target.value,
                })
              }
              className="w-full min-h-[200px] p-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 leading-relaxed focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-y placeholder:text-slate-300 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/30"
              placeholder="Describe aquí la arquitectura del sistema, flujos de datos y componentes principales..."
            />
            <p className="text-xs text-slate-400 mt-3 flex items-center gap-1 dark:text-slate-500">
              <HiOutlineInformationCircle className="w-4 h-4" />
              Utiliza este espacio para documentar cómo funciona el sistema
              internamente.
            </p>
          </div>
        </div>

        {/* --- TARJETA 3: CHANGELOG --- */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden dark:bg-gray-900 dark:border-slate-700">
          <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center gap-2 dark:bg-slate-900/60 dark:border-slate-800">
            <HiOutlineClipboardDocumentList className="w-5 h-5 text-slate-400 dark:text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 uppercase tracking-wide">
              Registro de Cambios (Changelog)
            </h3>
          </div>

          <div className="p-6">
            <textarea
              id="sot-changes"
              value={localSettings.importantChanges}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  importantChanges: e.target.value,
                })
              }
              className="w-full min-h-[150px] p-4 rounded-xl border border-slate-200 bg-slate-900 text-slate-300 font-mono text-xs leading-relaxed focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-y dark:border-slate-700"
              placeholder="- v1.0.0: Lanzamiento inicial&#10;- v1.0.1: Corrección de bugs en API..."
            />
            <p className="text-xs text-slate-400 mt-3 dark:text-slate-500">
              Se recomienda usar formato de lista con fechas o versiones.
            </p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 pl-5 pr-2 py-2 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center gap-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 dark:bg-slate-900/90 dark:border-slate-700">
          <div className="flex items-center">
            {saved ? (
              <span className="flex items-center gap-2 text-emerald-600 text-sm font-semibold animate-fadeIn dark:text-emerald-400">
                <HiCheckCircle className="w-5 h-5" />
                <span>Documentación actualizada</span>
              </span>
            ) : (
              <span className="text-sm text-slate-500 font-medium flex items-center gap-2 dark:text-slate-400">
                <HiOutlineDocumentText className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <span>Edición de SOT</span>
              </span>
            )}
          </div>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-slate-900 hover:bg-blue-600 text-white text-sm font-bold rounded-full shadow-md transition-all transform active:scale-95 dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

function HiOutlineInformationCircle({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
      />
    </svg>
  );
}
