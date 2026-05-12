import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { useUIStore } from './store/uiStore';
import LoginPage from './pages/LoginPage';
import AlumnoApp from './pages/AlumnoApp';
import CentroApp from './pages/CentroApp';
import EmpresaApp from './pages/EmpresaApp';

const GlobalToast = () => {
  const { toastMessage, toastType } = useUIStore();
  if (!toastMessage) return null;
  return (
    <div style={{
      position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
      backgroundColor: toastType === 'error' ? '#ef4444' : '#10b981',
      color: '#fff', padding: '12px 24px', borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 9999,
      fontFamily: "'Inter', sans-serif", fontWeight: 'bold', fontSize: '14px',
      animation: 'slideUp 0.3s ease-out'
    }}>
      {toastMessage}
    </div>
  );
};

export default function App() {
  const { isAuthenticated, isInitializing, user, initialize, logout, fetchMe } = useAuthStore();
  const { showToast } = useUIStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Capturar token de Google OAuth al volver del callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const refreshToken = params.get('refreshToken');
    const error = params.get('error');

    if (error) {
      showToast('Error al iniciar sesión con Google', 'error');
      window.history.replaceState({}, document.title, '/');
      return;
    }

    if (token && refreshToken) {
      // Guardar tokens en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);

      // Limpiar la URL
      window.history.replaceState({}, document.title, '/');

      // Cargar datos del usuario
      fetchMe().catch(() => {
        showToast('Error al cargar el perfil', 'error');
      });
    }
  }, []);

  const renderApp = () => {
    if (isInitializing) {
      return (
        <div style={{
          minHeight: '100vh', display: 'grid', placeItems: 'center',
          color: '#fff', fontFamily: "'Inter', sans-serif", background: 'var(--fp-bg, #080f14)',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>FPConnect</div>
            <div style={{ color: 'var(--fp-muted, #94a3b8)', fontSize: 14 }}>Cargando sesión...</div>
          </div>
        </div>
      );
    }

    if (!isAuthenticated || !user) return <LoginPage />;

    const role = user.role;
    if (role === 'ALUMNO') return <AlumnoApp user={user} onLogout={logout} />;
    if (role === 'CENTRO') return <CentroApp user={user} onLogout={logout} />;
    if (role === 'EMPRESA') return <EmpresaApp user={user} onLogout={logout} />;

    return <LoginPage />;
  };

  return (
    <>
      <GlobalToast />
      <main className="fp-root-main">
        {renderApp()}
      </main>
    </>
  );
}