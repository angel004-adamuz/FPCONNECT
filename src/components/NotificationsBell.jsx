import { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { notificationsService } from '../services';
import { useUIStore } from '../store/uiStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL
  || (import.meta.env.VITE_API_BASE_URL?.startsWith('http')
    ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '')
    : (import.meta.env.DEV ? 'http://127.0.0.1:3000' : window.location.origin));

const formatNotificationDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function NotificationsBell({ user, accentColor = '#00A878' }) {
  const { showToast } = useUIStore();
  const socketRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationsService.getAll();
      setNotifications(response.data?.notifications || []);
    } catch (err) {
      showToast(err.message || 'No se pudieron cargar las notificaciones', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return undefined;

    loadNotifications();

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    socketRef.current = socket;
    socket.emit('user:connect', user.id);
    socket.on('new_notification', (notification) => {
      setNotifications((prev) => {
        if (prev.some((item) => item.id === notification.id)) return prev;
        return [notification, ...prev];
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.id]);

  const markRead = async (notification) => {
    if (notification.isRead) return;

    setNotifications((prev) => prev.map((item) => (
      item.id === notification.id ? { ...item, isRead: true, readAt: new Date().toISOString() } : item
    )));

    try {
      await notificationsService.markRead(notification.id);
    } catch (err) {
      showToast(err.message || 'No se pudo marcar la notificación', 'error');
      loadNotifications();
    }
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((item) => (
      item.isRead ? item : { ...item, isRead: true, readAt: new Date().toISOString() }
    )));

    try {
      await notificationsService.markAllRead();
    } catch (err) {
      showToast(err.message || 'No se pudieron marcar las notificaciones', 'error');
      loadNotifications();
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="fp-button fp-button--ghost"
        style={{ position: 'relative', minWidth: 44, padding: '10px 12px' }}
        title="Notificaciones"
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: -6,
            right: -6,
            minWidth: 18,
            height: 18,
            borderRadius: 999,
            background: '#ef4444',
            color: '#fff',
            fontSize: 11,
            display: 'grid',
            placeItems: 'center',
            fontWeight: 800,
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <section style={{
          position: 'absolute',
          top: 'calc(100% + 10px)',
          right: 0,
          width: 'min(380px, calc(100vw - 24px))',
          maxHeight: '70vh',
          overflow: 'hidden',
          borderRadius: 14,
          border: '1px solid rgba(255,255,255,0.14)',
          background: '#081018',
          boxShadow: '0 20px 60px rgba(0,0,0,0.38)',
          zIndex: 1200,
          color: '#fff',
        }}>
          <header style={{
            padding: 14,
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
          }}>
            <div>
              <strong style={{ display: 'block', fontSize: 14 }}>Notificaciones</strong>
              <span style={{ color: '#ffffff80', fontSize: 12 }}>{unreadCount} sin leer</span>
            </div>
            <button
              type="button"
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="fp-button fp-button--ghost"
              style={{ padding: '7px 9px', fontSize: 12, opacity: unreadCount === 0 ? 0.45 : 1 }}
            >
              Leer todo
            </button>
          </header>

          <div style={{ maxHeight: 'calc(70vh - 64px)', overflowY: 'auto', padding: 8 }}>
            {loading && (
              <p style={{ color: '#ffffff80', textAlign: 'center', padding: 18, margin: 0, fontSize: 13 }}>Cargando...</p>
            )}
            {!loading && notifications.length === 0 && (
              <p style={{ color: '#ffffff80', textAlign: 'center', padding: 18, margin: 0, fontSize: 13 }}>No hay notificaciones todavía.</p>
            )}
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => markRead(notification)}
                style={{
                  width: '100%',
                  display: 'grid',
                  gridTemplateColumns: '10px 1fr',
                  gap: 10,
                  textAlign: 'left',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: notification.isRead ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.08)',
                  color: '#fff',
                  borderRadius: 11,
                  padding: 11,
                  marginBottom: 8,
                  cursor: 'pointer',
                }}
              >
                <span style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: notification.isRead ? 'rgba(255,255,255,0.22)' : accentColor,
                  marginTop: 5,
                }} />
                <span style={{ minWidth: 0 }}>
                  <strong style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>{notification.title}</strong>
                  <span style={{ display: 'block', color: notification.isRead ? '#ffffff9a' : '#fff', fontSize: 13, lineHeight: 1.35 }}>
                    {notification.message}
                  </span>
                  <small style={{ display: 'block', color: '#ffffff70', fontSize: 11, marginTop: 7 }}>
                    {formatNotificationDate(notification.createdAt)}
                  </small>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
