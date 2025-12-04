import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../../components/ConfirmModal";

export default function RegisterView() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validaciones
    if (!name.trim()) {
      setError("Por favor ingresa tu nombre.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, name.trim());
      setShowVerificationModal(true);
    } catch (err: any) {
      setError(err.message || "Error al crear la cuenta. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" bg-[#0F172A] flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-6xl rounded-4xl shadow-2xl overflow-hidden flex min-h-[700px]">
        {/* --- SECCIÓN IZQUIERDA: FORMULARIO --- */}
        <div className="w-full lg:w-1/2 p-8 md:p-16 flex flex-col justify-center relative">
          <div className="absolute top-8 left-8 md:left-16 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                />
              </svg>
            </div>
            <span className="font-bold text-xl text-gray-800 tracking-tight">
              PDF Transcriber
            </span>
          </div>

          <div className="max-w-md w-full mx-auto mt-12 lg:mt-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Crea tu cuenta
            </h1>
            <p className="text-gray-500 mb-8">
              Comienza a transcribir tus documentos de forma inteligente.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  placeholder="Tu nombre completo"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-400"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  placeholder="tu@correo.com"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  placeholder="Repite tu contraseña"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-400"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded">
                  {error}
                </div>
              )}

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl cursor-pointer transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creando cuenta..." : "Crear Cuenta"}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-600">
              ¿Ya tienes una cuenta?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-blue-600 font-bold hover:underline cursor-pointer"
              >
                Inicia sesión
              </button>
            </div>
          </div>
        </div>

        {/* --- SECCIÓN DERECHA: IMAGEN/BRANDING --- */}
        <div className="hidden lg:flex w-1/2 bg-[#0B1221] relative flex-col justify-between p-12 overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/4"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-900/40 rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/4"></div>
          <div className="absolute bottom-0 right-0 w-[800px] h-[800px] border-40 border-blue-800/20 rounded-full transform translate-x-1/3 translate-y-1/2"></div>

          <div className="relative z-10 mt-12">
            <h2 className="text-5xl font-bold text-white leading-tight mb-6">
              Transcribe documentos <br />
              con la potencia de la <br />
              <span className="text-blue-400">inteligencia artificial</span>
            </h2>
            <p className="text-gray-300 text-lg">
              Transcribe documentos legales, contratos, facturas y más con la
              potencia de la inteligencia artificial.
            </p>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showVerificationModal}
        title="Verifica tu correo electrónico"
        message={
          email
            ? `Hemos enviado un enlace de verificación a ${email}. Revisa tu bandeja de entrada (y la carpeta de spam) y confirma tu cuenta para poder iniciar sesión.`
            : "Hemos enviado un enlace de verificación a tu correo. Revisa tu bandeja de entrada (y la carpeta de spam) y confirma tu cuenta para poder iniciar sesión."
        }
        confirmText="Ir a iniciar sesión"
        cancelText="Cerrar"
        onConfirm={() => {
          setShowVerificationModal(false);
          navigate("/login");
        }}
        onCancel={() => setShowVerificationModal(false)}
        variant="info"
      />
    </div>
  );
}

