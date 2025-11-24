import React, { useState } from "react";
import {
  HiOutlineArrowLeft,
  HiOutlineCog,
  HiOutlineInformationCircle,
  HiOutlinePlay,
  HiOutlineChartBar,
  HiOutlineLockClosed,
} from "react-icons/hi2";
import type { SettingsViewType } from "../../../types";

interface AlertsViewProps {
  setSettingsView: (view: SettingsViewType) => void;
}

type Severity = "critical" | "high" | "medium";
type IconType = "cog" | "chart" | "lock";

interface AlertItem {
  id: number;
  title: string;
  desc: string;
  severity: Severity;
  enabled: boolean;
  iconType: IconType;
}

const initialAlertsData: AlertItem[] = [
  // CRÍTICOS (Rojos)
  {
    id: 1,
    title: "Base de datos no disponible",
    desc: "Alerta crítica cuando PostgreSQL no responde o está desconectado",
    severity: "critical",
    enabled: true,
    iconType: "cog",
  },
  {
    id: 2,
    title: "Falla en workers de procesamiento",
    desc: "Notifica cuando los workers principales se desconectan o fallan",
    severity: "critical",
    enabled: true,
    iconType: "cog",
  },
  {
    id: 3,
    title: "Memoria del sistema agotada",
    desc: "Alerta cuando el uso de memoria supera el 90% disponible",
    severity: "critical",
    enabled: true,
    iconType: "cog",
  },
  {
    id: 4,
    title: "Espacio en disco críticamente bajo",
    desc: "Notifica cuando queda menos del 10% de espacio disponible",
    severity: "critical",
    enabled: true,
    iconType: "cog",
  },
  {
    id: 5,
    title: "APIs de IA no disponibles",
    desc: "Alerta cuando OpenAI o Google Gemini devuelven errores continuos",
    severity: "critical",
    enabled: true,
    iconType: "cog",
  },
  {
    id: 6,
    title: "Falla en procesamiento de documentos",
    desc: "Error crítico en la cadena de transcripción de PDFs",
    severity: "critical",
    enabled: true,
    iconType: "cog",
  },
  // ALTOS (Naranjas)
  {
    id: 7,
    title: "Tiempo de respuesta extremadamente lento",
    desc: "Alerta cuando las respuestas superan 30 segundos consistentemente",
    severity: "high",
    enabled: true,
    iconType: "chart",
  },
  {
    id: 8,
    title: "Cola de transcripción bloqueada",
    desc: "Trabajos de transcripción acumulados sin procesar por más de 1 hora",
    severity: "high",
    enabled: true,
    iconType: "chart",
  },
  {
    id: 9,
    title: "Errores repetidos en APIs de IA",
    desc: "Más del 20% de solicitudes a proveedores de IA fallan",
    severity: "high",
    enabled: true,
    iconType: "cog",
  },
  {
    id: 10,
    title: "Fallas en carga de archivos",
    desc: "Usuarios no pueden subir PDFs correctamente al sistema",
    severity: "high",
    enabled: true,
    iconType: "cog",
  },
  // MEDIOS (Amarillos)
  {
    id: 11,
    title: "Certificados SSL próximos a vencer",
    desc: "Certificados de seguridad vencen en menos de 30 días",
    severity: "medium",
    enabled: false,
    iconType: "lock",
  },
  {
    id: 12,
    title: "Uso elevado de CPU",
    desc: "El procesador supera el 85% de uso por más de 15 minutos",
    severity: "medium",
    enabled: false,
    iconType: "chart",
  },
];

const ToggleSwitch = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) => (
  <button
    onClick={onChange}
    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
      checked ? "bg-slate-900" : "bg-slate-200"
    }`}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${
        checked ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

const getSeverityStyles = (severity: Severity) => {
  switch (severity) {
    case "critical":
      return {
        dot: "bg-red-500",
        badge: "bg-red-50 text-red-600 border-red-100",
        label: "Crítico",
      };
    case "high":
      return {
        dot: "bg-orange-500",
        badge: "bg-orange-50 text-orange-600 border-orange-100",
        label: "Alto",
      };
    case "medium":
      return {
        dot: "bg-yellow-400",
        badge: "bg-yellow-50 text-yellow-700 border-yellow-100",
        label: "Medio",
      };
    default:
      return {
        dot: "bg-slate-400",
        badge: "bg-slate-50 text-slate-600 border-slate-100",
        label: "Normal",
      };
  }
};

const getIcon = (type: IconType) => {
  switch (type) {
    case "chart":
      return <HiOutlineChartBar className="w-6 h-6" />;
    case "lock":
      return <HiOutlineLockClosed className="w-6 h-6" />;
    case "cog":
    default:
      return <HiOutlineCog className="w-6 h-6" />;
  }
};

export default function AlertsView({ setSettingsView }: AlertsViewProps) {
  const [alerts, setAlerts] = useState(initialAlertsData);

  const toggleAlert = (id: number) => {
    setAlerts(
      alerts.map((alert) =>
        alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
      )
    );
  };

  // Contadores dinámicos
  const activeCount = alerts.filter((a) => a.enabled).length;
  const criticalCount = alerts.filter(
    (a) => a.severity === "critical" && a.enabled
  ).length;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 font-sans text-slate-800 pb-24">
      {/* --- HEADER --- */}
      <div className="flex items-center gap-4 mb-10">
        <button
          className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          onClick={() => setSettingsView("main")}
        >
          <HiOutlineArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Configuración de Monitoreo
          </h2>
          <p className="text-sm text-slate-500">
            Gestiona las reglas de incidentes críticos.
          </p>
        </div>
      </div>

      {/* --- STATUS HEADER --- */}
      <div className="flex items-center justify-between mb-6 px-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          ESTADO ACTUAL
        </span>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
            <span className="text-sm font-medium text-slate-700">
              {activeCount} Activas
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
            <span className="text-sm font-medium text-slate-700">
              {criticalCount} Críticas
            </span>
          </div>
        </div>
      </div>

      {/* --- LISTA DE ALERTAS --- */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {alerts.map((alert, index) => {
          const styles = getSeverityStyles(alert.severity);

          return (
            <div
              key={alert.id}
              className={`p-6 flex flex-col md:flex-row items-start md:items-center gap-6 hover:bg-slate-50/50 transition-colors ${
                index !== alerts.length - 1 ? "border-b border-slate-100" : ""
              }`}
            >
              {/* 1. Estado e Icono */}
              <div className="flex items-center gap-4 shrink-0 mt-1 md:mt-0">
                <div className={`w-2.5 h-2.5 rounded-full ${styles.dot}`}></div>
                <div className="text-slate-500">{getIcon(alert.iconType)}</div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-slate-900">
                    {alert.title}
                  </h3>
                  <HiOutlineInformationCircle className="w-4 h-4 text-slate-400 cursor-help" />
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium border ${styles.badge}`}
                  >
                    {styles.label}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mb-3 leading-relaxed">
                  {alert.desc}
                </p>

                <div className="flex items-center gap-2">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      alert.enabled ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                  ></div>
                  <span
                    className={`text-xs font-bold tracking-wide ${
                      alert.enabled ? "text-emerald-600" : "text-slate-400"
                    }`}
                  >
                    {alert.enabled ? "HABILITADA" : "DESHABILITADA"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-5 shrink-0 w-full md:w-auto justify-between md:justify-end mt-2 md:mt-0">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-white hover:border-slate-300 transition-all">
                  <HiOutlinePlay className="w-4 h-4" />
                  Probar
                </button>

                <ToggleSwitch
                  checked={alert.enabled}
                  onChange={() => toggleAlert(alert.id)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
