import React from "react";
import { Link } from "react-router-dom";
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
}

export default function SettingsMenu({
  theme,
  setTheme,
}: SettingsMenuProps) {
  return (
    <div className="max-w-5xl mx-auto py-8 px-4 font-sans text-slate-800 dark:text-gray-100">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Configuración del Sistema
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Gestiona las preferencias, integraciones y comportamiento de la
          aplicación.
        </p>
      </div>

      <div className="space-y-10">
        {/* --- SECCIÓN 1: INTELIGENCIA ARTIFICIAL --- */}
        <section>
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 ml-1">
            Inteligencia Artificial
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* API Keys Card */}
            <Link
              to="/settings/api"
              className="group bg-white dark:bg-gray-800 p-5 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500 transition-all cursor-pointer flex items-start gap-4"
            >
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                <HiOutlineKey className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-gray-100 text-base group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                  APIs y Credenciales
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Gestiona las claves de acceso para OpenAI, Google Gemini y
                  otros servicios.
                </p>
              </div>
            </Link>

            {/* Prompts Card */}
            <Link
              to="/settings/prompts"
              className="group bg-white dark:bg-gray-800 p-5 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-purple-300 dark:hover:border-purple-500 transition-all cursor-pointer flex items-start gap-4"
            >
              <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50 transition-colors">
                <HiOutlineChatBubbleBottomCenterText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-gray-100 text-base group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                  Cadenas de Prompts
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Personaliza las instrucciones del sistema para mejorar la
                  precisión de la IA.
                </p>
              </div>
            </Link>
          </div>
        </section>

        {/* --- SECCIÓN 2: MONITOREO --- */}
        <section>
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 ml-1">
            Monitoreo y Estado
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Metrics Card */}
            <Link
              to="/settings/metrics"
              className="group bg-white dark:bg-gray-800 p-5 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-500 transition-all cursor-pointer flex items-start gap-4"
            >
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
                <HiOutlineChartBar className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-gray-100 text-base group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                  Métricas y Dashboard
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Visualiza el rendimiento, consumo de tokens y estadísticas de
                  uso.
                </p>
              </div>
            </Link>

            {/* Alerts Card */}
            <Link
              to="/settings/alerts"
              className="group bg-white dark:bg-gray-800 p-5 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-orange-300 dark:hover:border-orange-500 transition-all cursor-pointer flex items-start gap-4"
            >
              <div className="p-3 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl group-hover:bg-orange-100 dark:group-hover:bg-orange-900/50 transition-colors">
                <HiOutlineBellAlert className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-gray-100 text-base group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors">
                  Alertas y Notificaciones
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Configura umbrales de error y notificaciones automáticas del
                  sistema.
                </p>
              </div>
            </Link>
          </div>
        </section>

        {/* --- SECCIÓN 3: SISTEMAS Y GENERAL --- */}
        <section>
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 ml-1">
            Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Preferences Card */}
            <Link
              to="/settings/system-preferences"
              className="group bg-white dark:bg-gray-800 p-5 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-slate-400 dark:hover:border-gray-500 transition-all cursor-pointer flex items-start gap-4"
            >
              <div className="p-3 bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 rounded-xl group-hover:bg-slate-200 dark:group-hover:bg-gray-600 transition-colors">
                <HiOutlineCog6Tooth className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-gray-100 text-base group-hover:text-slate-800 dark:group-hover:text-white transition-colors">
                  Preferencias Generales
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Zona horaria, idioma, límites de carga y políticas de
                  retención de datos.
                </p>
              </div>
            </Link>

            {/* Documentation Card */}
            <Link
              to="/settings/sot"
              className="group bg-white dark:bg-gray-800 p-5 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500 transition-all cursor-pointer flex items-start gap-4"
            >
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                <HiOutlineBookOpen className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-gray-100 text-base group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                  Documentación (SOT)
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Fuente de verdad, manuales técnicos y especificaciones del
                  proyecto.
                </p>
              </div>
            </Link>
          </div>
        </section>

        {/* --- SECCIÓN 4: APARIENCIA --- */}
        <section>
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 ml-1">
            Apariencia
          </h3>
          <div className="bg-slate-50 dark:bg-gray-800/50 rounded-2xl border border-slate-200 dark:border-gray-700 p-2 flex gap-2 w-full max-w-md">
            <button
              onClick={() => setTheme("light")}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                theme === "light"
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-gray-600"
                  : "text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 hover:bg-slate-200/50 dark:hover:bg-gray-700/50"
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
                  : "text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 hover:bg-slate-200/50 dark:hover:bg-gray-700/50"
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
