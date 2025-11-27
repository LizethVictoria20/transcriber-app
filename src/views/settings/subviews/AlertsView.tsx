import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineArrowLeft,
  HiOutlineCog,
  HiOutlineInformationCircle,
  HiOutlinePlay,
  HiOutlineChartBar,
  HiOutlineLockClosed,
  HiCheckCircle,
} from "react-icons/hi2";
import type { AlertSettings } from "../../../types";

interface AlertsViewProps {
  alertSettings: AlertSettings;
  setAlertSettings: (settings: AlertSettings) => void;
}

type Severity = "critical" | "high" | "medium";
type IconType = "cog" | "chart" | "lock";
type AlertKey = keyof AlertSettings;

interface AlertItem {
  key: AlertKey;
  title: string;
  desc: string;
  severity: Severity;
  iconType: IconType;
}

const alertsConfig: AlertItem[] = [
  // CRÍTICOS (Rojos)
  {
    key: "databaseUnavailable",
    title: "Base de datos no disponible",
    desc: "Alerta crítica cuando PostgreSQL no responde o está desconectado",
    severity: "critical",
    iconType: "cog",
  },
  {
    key: "workerFailure",
    title: "Falla en workers de procesamiento",
    desc: "Notifica cuando los workers principales se desconectan o fallan",
    severity: "critical",
    iconType: "cog",
  },
  {
    key: "memoryExhausted",
    title: "Memoria del sistema agotada",
    desc: "Alerta cuando el uso de memoria supera el 90% disponible",
    severity: "critical",
    iconType: "cog",
  },
  {
    key: "diskSpaceCritical",
    title: "Espacio en disco críticamente bajo",
    desc: "Notifica cuando queda menos del 10% de espacio disponible",
    severity: "critical",
    iconType: "cog",
  },
  {
    key: "aiApisUnavailable",
    title: "APIs de IA no disponibles",
    desc: "Alerta cuando OpenAI o Google Gemini devuelven errores continuos",
    severity: "critical",
    iconType: "cog",
  },
  {
    key: "documentProcessingFailure",
    title: "Falla en procesamiento de documentos",
    desc: "Error crítico en la cadena de transcripción de PDFs",
    severity: "critical",
    iconType: "cog",
  },
  // ALTOS (Naranjas)
  {
    key: "responseTimeSlow",
    title: "Tiempo de respuesta extremadamente lento",
    desc: "Alerta cuando las respuestas superan 30 segundos consistentemente",
    severity: "high",
    iconType: "chart",
  },
  {
    key: "transcriptionQueueBlocked",
    title: "Cola de transcripción bloqueada",
    desc: "Trabajos de transcripción acumulados sin procesar por más de 1 hora",
    severity: "high",
    iconType: "chart",
  },
  {
    key: "aiApiErrors",
    title: "Errores repetidos en APIs de IA",
    desc: "Más del 20% de solicitudes a proveedores de IA fallan",
    severity: "high",
    iconType: "cog",
  },
  {
    key: "fileUploadFailures",
    title: "Fallas en carga de archivos",
    desc: "Usuarios no pueden subir PDFs correctamente al sistema",
    severity: "high",
    iconType: "cog",
  },
  // MEDIOS (Amarillos)
  {
    key: "sslCertificateExpiry",
    title: "Certificados SSL próximos a vencer",
    desc: "Certificados de seguridad vencen en menos de 30 días",
    severity: "medium",
    iconType: "lock",
  },
  {
    key: "highCpuUsage",
    title: "Uso elevado de CPU",
    desc: "El procesador supera el 85% de uso por más de 15 minutos",
    severity: "medium",
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

export default function AlertsView({ alertSettings, setAlertSettings }: AlertsViewProps) {
  const navigate = useNavigate();
  const [testingAlert, setTestingAlert] = useState<string | null>(null);
  const [showTestNotification, setShowTestNotification] = useState(false);
  const [testMessage, setTestMessage] = useState("");

  const toggleAlert = (key: AlertKey) => {
    setAlertSettings({
      ...alertSettings,
      [key]: {
        ...alertSettings[key],
        enabled: !alertSettings[key].enabled,
      },
    });
  };

  const testAlert = (alert: AlertItem) => {
    const key = alert.key;
    setTestingAlert(key);
    
    // Simular prueba de alerta
    setTimeout(() => {
      const now = new Date().toISOString();
      
      // Actualizar configuración con última activación y contador
      setAlertSettings({
        ...alertSettings,
        [key]: {
          ...alertSettings[key],
          lastTriggered: now,
          triggerCount: alertSettings[key].triggerCount + 1,
        },
      });

      // Mostrar notificación de prueba
      setTestMessage(`✓ Alerta "${alert.title}" probada exitosamente`);
      setShowTestNotification(true);
      
      setTestingAlert(null);
      
      // Ocultar notificación después de 3 segundos
      setTimeout(() => {
        setShowTestNotification(false);
      }, 3000);
    }, 1000);
  };

  // Contadores dinámicos
  const activeCount = alertsConfig.filter((alert) => alertSettings[alert.key].enabled).length;
  const criticalCount = alertsConfig.filter(
    (alert) => alert.severity === "critical" && alertSettings[alert.key].enabled
  ).length;

  const formatLastTriggered = (dateString?: string) => {
    if (!dateString) return "Nunca";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Hace un momento";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit',
      year: '2-digit'
    });
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 font-sans text-slate-800 dark:text-slate-100 pb-24">
      {/* Test Notification */}
      {showTestNotification && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in dark:bg-emerald-600">
          <HiCheckCircle className="w-6 h-6" />
          <span className="font-medium">{testMessage}</span>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="flex items-center gap-4 mb-10">
        <button
          className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors dark:hover:bg-slate-800 dark:text-slate-300"
          onClick={() => navigate("/settings")}
        >
          <HiOutlineArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Configuración de Monitoreo
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Gestiona las reglas de incidentes críticos y recibe notificaciones en tiempo real.
          </p>
        </div>
      </div>

      {/* --- STATUS HEADER --- */}
      <div className="flex items-center justify-between mb-6 px-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">
          ESTADO ACTUAL
        </span>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {activeCount} Activas
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {criticalCount} Críticas
            </span>
          </div>
        </div>
      </div>

      {/* --- LISTA DE ALERTAS --- */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden dark:bg-gray-900 dark:border-slate-700">
        {alertsConfig.map((alert, index) => {
          const styles = getSeverityStyles(alert.severity);
          const config = alertSettings[alert.key];
          const isTesting = testingAlert === alert.key;

          return (
            <div
              key={alert.key}
              className={`p-6 flex flex-col md:flex-row items-start md:items-center gap-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/60 transition-colors ${
                index !== alertsConfig.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""
              }`}
            >
              {/* 1. Estado e Icono */}
              <div className="flex items-center gap-4 shrink-0 mt-1 md:mt-0">
                <div className={`w-2.5 h-2.5 rounded-full ${styles.dot}`}></div>
                <div className="text-slate-500 dark:text-slate-400">
                  {getIcon(alert.iconType)}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
                    {alert.title}
                  </h3>
                  <HiOutlineInformationCircle className="w-4 h-4 text-slate-400 cursor-help dark:text-slate-500" />
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium border ${styles.badge}`}
                  >
                    {styles.label}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mb-3 leading-relaxed dark:text-slate-400">
                  {alert.desc}
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        config.enabled ? "bg-emerald-500" : "bg-slate-300"
                      }`}
                    ></div>
                    <span
                      className={`text-xs font-bold tracking-wide ${
                        config.enabled
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-slate-400 dark:text-slate-500"
                      }`}
                    >
                      {config.enabled ? "HABILITADA" : "DESHABILITADA"}
                    </span>
                  </div>

                  {/* Información de activación */}
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      <span className="font-semibold">Última activación:</span>{" "}
                      {formatLastTriggered(config.lastTriggered)}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span>
                      <span className="font-semibold">Activaciones:</span>{" "}
                      {config.triggerCount}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-5 shrink-0 w-full md:w-auto justify-between md:justify-end mt-2 md:mt-0">
                <button 
                  onClick={() => testAlert(alert)}
                  disabled={isTesting || !config.enabled}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    isTesting
                      ? "border-slate-200 text-slate-400 cursor-wait bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500"
                      : !config.enabled
                      ? "border-slate-200 text-slate-400 cursor-not-allowed bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500"
                      : "border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  <HiOutlinePlay className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
                  {isTesting ? "Probando..." : "Probar"}
                </button>

                <ToggleSwitch
                  checked={config.enabled}
                  onChange={() => toggleAlert(alert.key)}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Info adicional */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg dark:bg-blue-950/40 dark:border-blue-900/70">
        <div className="flex gap-3">
          <HiOutlineInformationCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900 dark:text-blue-100">
            <p className="font-semibold mb-1">Sobre las alertas de prueba</p>
            <p className="text-blue-700 dark:text-blue-300">
              El botón "Probar" simula la activación de cada alerta para verificar que el sistema 
              de monitoreo funciona correctamente. Las alertas reales se activarán automáticamente 
              cuando se cumplan las condiciones especificadas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
