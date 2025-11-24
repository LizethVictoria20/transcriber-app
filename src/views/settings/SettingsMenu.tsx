import React from "react";
import type { SettingsViewType } from "../../types";
import {
  HiOutlineKey,
  HiOutlineChatBubbleBottomCenterText,
  HiOutlineChartBar,
  HiOutlineBellAlert,
  HiOutlineCog6Tooth,
  HiOutlineBookOpen,
  HiOutlineMoon,
  HiOutlineSun,
} from "react-icons/hi2";

interface SettingsMenuProps {
  theme: string;
  setTheme: (theme: string) => void;
  setSettingsView: (view: SettingsViewType) => void;
}

export default function SettingsMenu({
  theme,
  setTheme,
  setSettingsView,
}: SettingsMenuProps) {
  return (
    <div className="max-w-5xl mx-auto py-8 px-4 font-sans text-slate-800">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Configuración del Sistema
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Gestiona las preferencias, integraciones y comportamiento de la
          aplicación.
        </p>
      </div>

      <div className="space-y-10">
        {/* --- SECCIÓN 1: INTELIGENCIA ARTIFICIAL --- */}
        <section>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 ml-1">
            Inteligencia Artificial
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => setSettingsView("api")}
              className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex items-start gap-4"
            >
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-100 transition-colors">
                <HiOutlineKey className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base group-hover:text-blue-700 transition-colors">
                  APIs y Credenciales
                </h4>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  Gestiona las claves de acceso para OpenAI, Google Gemini y
                  otros servicios.
                </p>
              </div>
            </div>

            <div
              onClick={() => setSettingsView("prompts")}
              className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all cursor-pointer flex items-start gap-4"
            >
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-100 transition-colors">
                <HiOutlineChatBubbleBottomCenterText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base group-hover:text-purple-700 transition-colors">
                  Cadenas de Prompts
                </h4>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  Personaliza las instrucciones del sistema para mejorar la
                  precisión de la IA.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- SECCIÓN 2: MONITOREO --- */}
        <section>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 ml-1">
            Monitoreo y Estado
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => setSettingsView("metrics")}
              className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex items-start gap-4"
            >
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-100 transition-colors">
                <HiOutlineChartBar className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors">
                  Métricas y Dashboard
                </h4>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  Visualiza el rendimiento, consumo de tokens y estadísticas de
                  uso.
                </p>
              </div>
            </div>

            <div
              onClick={() => setSettingsView("alerts")}
              className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-orange-300 transition-all cursor-pointer flex items-start gap-4"
            >
              <div className="p-3 bg-orange-50 text-orange-600 rounded-xl group-hover:bg-orange-100 transition-colors">
                <HiOutlineBellAlert className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base group-hover:text-orange-700 transition-colors">
                  Alertas y Notificaciones
                </h4>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  Configura umbrales de error y notificaciones automáticas del
                  sistema.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- SECCIÓN 3: SISTEMAS Y GENERAL --- */}
        <section>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 ml-1">
            Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => setSettingsView("systemPrefs")}
              className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-400 transition-all cursor-pointer flex items-start gap-4"
            >
              <div className="p-3 bg-slate-100 text-slate-600 rounded-xl group-hover:bg-slate-200 transition-colors">
                <HiOutlineCog6Tooth className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base group-hover:text-slate-800 transition-colors">
                  Preferencias Generales
                </h4>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  Zona horaria, idioma, límites de carga y políticas de
                  retención de datos.
                </p>
              </div>
            </div>

            <div
              onClick={() => setSettingsView("sot")}
              className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex items-start gap-4"
            >
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-100 transition-colors">
                <HiOutlineBookOpen className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base group-hover:text-indigo-700 transition-colors">
                  Documentación (SOT)
                </h4>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  Fuente de verdad, manuales técnicos y especificaciones del
                  proyecto.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- SECCIÓN 4: APARIENCIA --- */}
        <section>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 ml-1">
            Apariencia
          </h3>
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-2 flex gap-2 w-full max-w-md">
            <button
              onClick={() => setTheme("light")}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                theme === "light"
                  ? "bg-white text-blue-600 shadow-sm border border-slate-200"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              <HiOutlineSun className="w-5 h-5" />
              Modo Claro
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                theme === "dark"
                  ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              <HiOutlineMoon className="w-5 h-5" />
              Modo Oscuro
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
