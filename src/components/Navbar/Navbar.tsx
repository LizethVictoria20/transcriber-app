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

  return (
    <header className="w-full bg-white border-b border-gray-100 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-center px-6 md:px-8 h-16 gap-52">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-600 border border-blue-300 shadow-md">
            <HiDocumentText className="w-6 h-6 text-white" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Auto Transcriptor
            </h1>
            <p className="text-xs text-slate-600">
              IA para Procesos Judiciales
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-4">
          <button
            onClick={() => onNavigate("transcribe")}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
              currentView === "transcribe"
                ? "text-gray-900 bg-gray-50"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 decoration-solid"
            }`}
          >
            <HiOutlineDocumentText className="w-4.5 h-4.5" />
            Transcribir
          </button>
          <button
            onClick={() => onNavigate("history")}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
              currentView === "history"
                ? "text-gray-900 bg-gray-50"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <HiOutlineClipboardDocumentList className="w-4.5 h-4.5" />
            Transcripciones
          </button>
          <button
            onClick={() => onNavigate("settings")}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
              currentView === "settings"
                ? "text-gray-900 bg-gray-50"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <HiOutlineCog6Tooth className="w-4.5 h-4.5" />
            Configuración
          </button>
        </nav>

        {/* User Profile Section */}
        {user && (
          <div className="flex items-center gap-3">
            {/* Status Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              <span className="text-xs font-medium text-emerald-700">
                Activo
              </span>
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-gray-200"></div>

            {/* User Avatar */}
            <div
              className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white font-medium text-xs cursor-pointer hover:ring-2 hover:ring-gray-200 transition-all"
              title={user.email || "Usuario"}
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name || "Usuario"}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span>
                  {user.name ? user.name.substring(0, 2).toUpperCase() : "U"}
                </span>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={signOut}
              className="p-1.5 rounded-md hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-all cursor-pointer"
              title="Cerrar Sesión"
            >
              <IoLogOutOutline className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
