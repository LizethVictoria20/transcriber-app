import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineArrowLeft,
  HiOutlineGlobeAlt,
  HiOutlineClock,
  HiOutlineCurrencyDollar,
  HiOutlineCalculator,
  HiCheckCircle,
  HiOutlineInformationCircle,
  HiOutlineCog6Tooth,
} from "react-icons/hi2";
import { HiOutlineRefresh } from "react-icons/hi";
import { FaCloudArrowUp } from "react-icons/fa6";

import type {
  SystemPreferences,
  RetryCategory,
} from "../../../types";

interface SystemPreferencesViewProps {
  preferences: SystemPreferences;
  setPreferences: (prefs: SystemPreferences) => void;
}

export default function SystemPreferencesView({
  preferences,
  setPreferences,
}: SystemPreferencesViewProps) {
  const navigate = useNavigate();
  const [localPrefs, setLocalPrefs] = useState<SystemPreferences>(preferences);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setPreferences(localPrefs);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleToggle = (key: keyof SystemPreferences) => {
    if (typeof localPrefs[key] === "boolean") {
      setLocalPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const updateRetryPolicy = (
    category: keyof SystemPreferences["retryPolicy"],
    field: keyof RetryCategory,
    value: any
  ) => {
    setLocalPrefs((prev) => ({
      ...prev,
      retryPolicy: {
        ...prev.retryPolicy,
        [category]: {
          ...prev.retryPolicy[category],
          [field]: value,
        },
      },
    }));
  };

  const ToggleSwitch = ({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: () => void;
  }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        checked ? "bg-slate-900" : "bg-slate-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 font-sans text-slate-800 dark:text-slate-100 pb-32">
      {/* --- HEADER --- */}
      <div className="flex items-center gap-4 mb-8">
        <button
          className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors border border-transparent hover:border-slate-200 dark:hover:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
          onClick={() => navigate("/settings")}
        >
          <HiOutlineArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Preferencias del Sistema
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Ajustes globales de localización, límites y comportamiento
            operativo.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* --- 1. LOCALIZACIÓN --- */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 dark:bg-gray-900 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <HiOutlineGlobeAlt className="w-5 h-5 text-slate-400 dark:text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 uppercase tracking-wide">
              Localización
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 dark:text-slate-400">
                Zona Horaria
              </label>
              <div className="relative">
                <HiOutlineClock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 dark:text-slate-500" />
                <select
                  value={localPrefs.timezone}
                  onChange={(e) =>
                    setLocalPrefs({ ...localPrefs, timezone: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none appearance-none cursor-pointer hover:border-slate-300 transition-all dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 dark:hover:border-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/30"
                >
                  <option value="browser">Predeterminado del Navegador</option>
                  <option value="UTC">UTC (Universal)</option>
                  <option value="America/Bogota">América/Bogotá (COT)</option>
                  <option value="America/New_York">
                    América/New York (EST)
                  </option>
                  <option value="Europe/Madrid">Europa/Madrid (CET)</option>
                  <option value="Europe/London">Europa/Londres (GMT)</option>
                </select>
              </div>
              <p className="text-xs text-slate-400 mt-1.5 ml-1 dark:text-slate-500">
                Define cómo se visualizan las fechas en el historial.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 dark:text-slate-400">
                Idioma
              </label>
              <div className="relative">
                <HiOutlineGlobeAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 dark:text-slate-500" />
                <select
                  value={localPrefs.language}
                  onChange={(e) =>
                    setLocalPrefs({ ...localPrefs, language: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none appearance-none cursor-pointer hover:border-slate-300 transition-all dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 dark:hover:border-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/30"
                >
                  <option value="es">Español (España)</option>
                  <option value="en">English (US)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* --- 2. LÍMITES Y CARGA --- */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 dark:bg-gray-900 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <FaCloudArrowUp className="w-5 h-5 text-slate-400 dark:text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 uppercase tracking-wide">
              Restricciones de Carga
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 dark:text-slate-400">
                Tamaño Máximo (MB)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={localPrefs.maxUploadSizeMB}
                  onChange={(e) =>
                    setLocalPrefs({
                      ...localPrefs,
                      maxUploadSizeMB: parseInt(e.target.value) || 10,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-bold text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/30"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                  MB
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 dark:text-slate-400">
                Límite de Páginas
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={localPrefs.maxPageLimit}
                  onChange={(e) =>
                    setLocalPrefs({
                      ...localPrefs,
                      maxPageLimit: parseInt(e.target.value) || 100,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-bold text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/30"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                  Págs
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- 3. ESTIMACIONES --- */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 dark:bg-gray-900 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <HiOutlineCalculator className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 uppercase tracking-wide">
                Cálculo de Costos
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600 dark:text-slate-300">
                Mostrar estimaciones
              </span>
              <ToggleSwitch
                checked={localPrefs.showEstimates}
                onChange={() => handleToggle("showEstimates")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1 flex items-center gap-1 dark:text-slate-400">
                Costo Base
                <HiOutlineInformationCircle
                  className="w-3 h-3 text-slate-400 cursor-help dark:text-slate-500"
                  title="Costo promedio por página en USD"
                />
              </label>
              <div className="relative">
                <HiOutlineCurrencyDollar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 dark:text-slate-500" />
                <input
                  type="number"
                  step="0.000001"
                  min="0"
                  value={localPrefs.costPerPage}
                  onChange={(e) =>
                    setLocalPrefs({
                      ...localPrefs,
                      costPerPage: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-mono dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/30"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1 flex items-center gap-1 dark:text-slate-400">
                Tiempo Procesamiento
                <HiOutlineInformationCircle
                  className="w-3 h-3 text-slate-400 cursor-help dark:text-slate-500"
                  title="Tiempo medio por página en segundos"
                />
              </label>
              <div className="relative">
                <HiOutlineClock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 dark:text-slate-500" />
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={localPrefs.timePerPage}
                  onChange={(e) =>
                    setLocalPrefs({
                      ...localPrefs,
                      timePerPage: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-mono dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/30"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                  Seg
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- 4. POLÍTICA DE REINTENTOS --- */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden dark:bg-gray-900 dark:border-slate-700">
          <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center gap-2 dark:bg-slate-900/60 dark:border-slate-800">
            <HiOutlineRefresh className="w-5 h-5 text-slate-400 dark:text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 uppercase tracking-wide">
              Recuperación de Fallos
            </h3>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {(["network", "timeout", "rateLimit"] as const).map((key) => {
              const category = localPrefs.retryPolicy[key];
              const labels = {
                network: "Errores de Red",
                timeout: "Timeouts",
                rateLimit: "Límite de Tasa (429)",
              };

              return (
                <div
                  key={key}
                  className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/30 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {labels[key]}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
                      Configura cómo el sistema reacciona ante{" "}
                      {labels[key].toLowerCase()}.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 dark:text-slate-500">
                        Intentos
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={category.maxRetries}
                        onChange={(e) =>
                          updateRetryPolicy(
                            key,
                            "maxRetries",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-20 px-2 py-1.5 rounded-lg border border-slate-200 text-sm text-center font-bold focus:border-blue-500 outline-none dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 dark:focus:border-blue-500"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 dark:text-slate-500">
                        Estrategia
                      </label>
                      <select
                        value={category.backoff}
                        onChange={(e) =>
                          updateRetryPolicy(key, "backoff", e.target.value)
                        }
                        className="w-32 px-2 py-1.5 rounded-lg border border-slate-200 text-sm bg-white focus:border-blue-500 outline-none cursor-pointer dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                      >
                        <option value="fixed">Fijo (30s)</option>
                        <option value="exponential">Exponencial</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* --- FOOTER FLOTANTE --- */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 pl-5 pr-2 py-2 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center gap-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300">
          <div className="flex items-center">
            {saved ? (
              <span className="flex items-center gap-2 text-emerald-600 text-sm font-semibold animate-fadeIn">
                <HiCheckCircle className="w-5 h-5" />
                <span>Preferencias actualizadas</span>
              </span>
            ) : (
              <span className="text-sm text-slate-500 font-medium flex items-center gap-2">
                <HiOutlineCog6Tooth className="w-4 h-4 text-slate-400" />
                <span>Configuración del sistema</span>
              </span>
            )}
          </div>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-slate-900 hover:bg-blue-600 text-white text-sm font-bold rounded-full shadow-md transition-all transform active:scale-95"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
