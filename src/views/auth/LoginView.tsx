import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function LoginView() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err: any) {
      setError("Credenciales incorrectas o error en el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 font-sans">
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
              Inicia sesión en tu cuenta
            </h1>
            <p className="text-gray-500 mb-8">
              ¡Bienvenido de nuevo! Por favor ingresa tus datos.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  placeholder="Ingresa tu correo"
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
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="text-gray-600">Recordar por 30 días</span>
                </label>
                <button
                  type="button"
                  className="text-blue-600 font-semibold hover:underline cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </button>
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
                className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl cursor-pointer transition-colors shadow-lg shadow-blue-500/30"
              >
                {loading ? "Cargando..." : "Iniciar Sesión"}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-600">
              ¿No tienes una cuenta?{" "}
              <button className="text-blue-600 font-bold hover:underline cursor-pointer">
                Regístrate gratis
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
              Transforma Archivos <br />
              en Datos Editables <br />
              <span className="text-blue-400">Sin Esfuerzo</span>
            </h2>
          </div>

          {/* Tarjeta de Testimonio */}
          <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 mt-auto">
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className="w-5 h-5 text-yellow-400 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>

            <p className="text-white text-lg font-medium leading-relaxed mb-6">
              "Las medidas de seguridad robustas de PDF Transcriber nos dan
              tranquilidad. Confiamos en la plataforma para transcribir nuestros
              datos legales sensibles, asegurando confidencialidad y precisión
              en cada documento."
            </p>

            <div className="flex items-center justify-between">
              {/* Botones de navegación del slider (estéticos) */}
              <div className="flex gap-3">
                <button className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition">
                  ←
                </button>
                <button className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition">
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
