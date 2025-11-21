
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function LoginView() {
    const { signIn, signUp } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await signIn(email, password);
            } else {
                await signUp(email, password);
            }
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error de autenticación');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="logo" style={{justifyContent: 'center', marginBottom: '1rem'}}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                        <span>PDF Transcriber</span>
                    </div>
                    <h2>{isLogin ? 'Bienvenido de nuevo' : 'Crear cuenta nueva'}</h2>
                    <p>{isLogin ? 'Ingresa tus credenciales para continuar' : 'Regístrate para empezar a transcribir'}</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Correo Electrónico</label>
                        <input 
                            type="email" 
                            id="email" 
                            className="custom-input"
                            placeholder="nombre@ejemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input 
                            type="password" 
                            id="password" 
                            className="custom-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    {error && <div className="error-message" style={{fontSize: '0.9rem', textAlign: 'center'}}>{error}</div>}

                    <button type="submit" className="button" style={{width: '100%', marginTop: '1rem'}} disabled={loading}>
                        {loading ? <span className="loader"></span> : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}
                    </button>
                </form>

                <div className="login-footer">
                    <p>
                        {isLogin ? "¿No tienes una cuenta?" : "¿Ya tienes una cuenta?"}
                        <button className="link-button" onClick={() => setIsLogin(!isLogin)}>
                            {isLogin ? "Regístrate gratis" : "Inicia sesión"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
