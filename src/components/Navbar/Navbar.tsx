import React from "react";
import { useAuth } from "../../context/AuthContext";
import {
  HiDocumentText,
  HiOutlineDocumentText,
  HiOutlineClipboardDocumentList,
  HiOutlineCog6Tooth,
} from "react-icons/hi2";

import { IoLogOutOutline } from "react-icons/io5";

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export default function Navbar({ currentView, onNavigate }: NavbarProps) {
  const { user, signOut } = useAuth();

  // Función para estilos de botones de navegación
  const getNavLinkClass = (viewName: string) => {
    const isActive = currentView === viewName;
    return `flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
      isActive
        ? "text-blue-700 bg-blue-50 shadow-sm ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20" // Estado Activo (Light/Dark)
        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800" // Estado Inactivo (Light/Dark)
    }`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-gray-200/60 bg-white/90 backdrop-blur-md transition-all dark:bg-[#111827]/90 dark:border-gray-800">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 md:px-8">
        {/* --- LOGO & BRANDING --- */}
        <div
          className="flex items-center gap-3.5 select-none cursor-pointer group"
          onClick={() => onNavigate("transcribe")}
        >
          {/* Icono Logo */}
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-lg shadow-blue-600/20 transition-transform group-hover:scale-105 dark:shadow-blue-900/40">
            <HiDocumentText className="h-6 w-6" />
          </div>

          {/* Texto Logo */}
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none dark:text-gray-100">
              Auto Transcriptor
            </h1>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-gray-400">
              IA para Procesos Judiciales
            </p>
          </div>
        </div>

        {/* --- NAVEGACIÓN CENTRAL --- */}
        <nav className="hidden md:flex items-center gap-2 bg-white/50 p-1.5 rounded-2xl border border-gray-100 shadow-sm dark:bg-gray-800/50 dark:border-gray-700">
          <button
            onClick={() => onNavigate("transcribe")}
            className={getNavLinkClass("transcribe")}
          >
            <HiOutlineDocumentText
              className={`w-5 h-5 ${
                currentView === "transcribe"
                  ? "text-blue-600 dark:text-blue-400"
                  : ""
              }`}
            />
            Transcribir
          </button>

          <button
            onClick={() => onNavigate("history")}
            className={getNavLinkClass("history")}
          >
            <HiOutlineClipboardDocumentList
              className={`w-5 h-5 ${
                currentView === "history"
                  ? "text-blue-600 dark:text-blue-400"
                  : ""
              }`}
            />
            Mis Expedientes
          </button>

          <button
            onClick={() => onNavigate("settings")}
            className={getNavLinkClass("settings")}
          >
            <HiOutlineCog6Tooth
              className={`w-5 h-5 ${
                currentView === "settings"
                  ? "text-blue-600 dark:text-blue-400"
                  : ""
              }`}
            />
            Configuración
          </button>
        </nav>

        {/* --- PERFIL DE USUARIO --- */}
        {user && (
          <div className="flex items-center gap-5">
            {/* Info Usuario */}
            <div className="flex items-center gap-3 pl-5 border-l border-gray-200 dark:border-gray-700">
              <div className="hidden lg:block text-right">
                <p className="text-sm font-semibold text-slate-900 leading-tight dark:text-gray-100">
                  {user.name || "Usuario"}
                </p>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-medium text-emerald-600 uppercase tracking-wide dark:text-emerald-400">
                    Conectado
                  </span>
                </div>
              </div>

              {/* Avatar */}
              <div
                className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-slate-100 shadow-sm ring-2 ring-transparent hover:ring-blue-100 transition-all cursor-pointer dark:border-gray-700 dark:bg-gray-800 dark:hover:ring-blue-900"
                title={user.email || "Perfil"}
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Perfil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-xs font-bold text-white dark:from-gray-700 dark:to-gray-900">
                    {user.name ? user.name.substring(0, 2).toUpperCase() : "US"}
                  </div>
                )}
              </div>
            </div>

            {/* Botón Logout */}
            <button
              onClick={signOut}
              className="group relative flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:border-red-900/50 dark:hover:text-red-400"
              title="Cerrar Sesión"
            >
              <IoLogOutOutline className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
