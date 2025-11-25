import React from "react";

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-slate-200 dark:bg-[#111827] dark:border-gray-800 transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-6 gap-4 text-sm">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-slate-900 dark:text-white tracking-tight">
              Auto Transcriptor
            </span>
            <span className="h-4 w-px bg-slate-300 dark:bg-gray-700 mx-1"></span>
            <span className="text-slate-500 dark:text-gray-400 font-medium">
              Sistema Activo v1.0
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-500 dark:text-gray-400 lg:flex">
            <span>&copy; 2025 Todos los derechos reservados</span>
            <span className="h-4 w-px bg-slate-300 dark:bg-gray-700 mx-1"></span>
            <span>SOT Activo</span>
          </div>

          <div className="text-slate-500 dark:text-gray-400">
            Desarrollado por{" "}
            <span className="font-bold text-slate-900 dark:text-white">
              Mentes Publicitarias S.A.S.
            </span>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-gray-800 py-4 flex justify-end">
          <p className="text-xs text-slate-400 dark:text-gray-500 font-medium">
            Plataforma de transcripción automatizada • Impulsada por
            inteligencia artificial
          </p>
        </div>
      </div>
    </footer>
  );
}
