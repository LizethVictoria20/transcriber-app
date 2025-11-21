
import React from 'react';
import { useAuth } from '../context/AuthContext';

interface MainLayoutProps {
    children: React.ReactNode;
    currentView: string;
    onNavigate: (view: string) => void;
}

export default function MainLayout({ children, currentView, onNavigate }: MainLayoutProps) {
    const { user, signOut } = useAuth();

    return (
        <>
            <header>
                <div className="logo">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                    <h1>PDF Transcriber</h1>
                </div>
                <div style={{display: 'flex', gap: '1.5rem', alignItems: 'center'}}>
                    <nav>
                        <button onClick={() => onNavigate('transcribe')} className={currentView === 'transcribe' ? 'active' : ''}>Transcribir</button>
                        <button onClick={() => onNavigate('history')} className={currentView === 'history' ? 'active' : ''}>Transcripciones</button>
                        <button onClick={() => onNavigate('settings')} className={currentView === 'settings' ? 'active' : ''}>Configuración</button>
                    </nav>
                    {user && (
                        <div className="user-profile-menu">
                            <div className="user-avatar" title={user.email}>
                                {user.avatarUrl ? (
                                    <img src={user.avatarUrl} alt={user.name} />
                                ) : (
                                    <span>{user.name ? user.name.substring(0,2).toUpperCase() : 'U'}</span>
                                )}
                            </div>
                            <button 
                                onClick={signOut} 
                                className="button small secondary"
                                style={{padding: '0.5rem'}}
                                title="Cerrar Sesión"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: '18px', height: '18px'}}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </header>
            <main>
                {children}
            </main>
        </>
    );
}
