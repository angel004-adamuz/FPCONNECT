import { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { conversationsService, usersService } from '../services';
import { useUIStore } from '../store/uiStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL
  || (import.meta.env.VITE_API_BASE_URL?.startsWith('http')
    ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '')
    : (import.meta.env.DEV ? 'http://127.0.0.1:3000' : window.location.origin));

const getInitials = (user) => `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || 'FP';

const formatTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function MessagesPanel({ user, accentColor = '#00A878' }) {
  const { showToast } = useUIStore();
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const activeConversationRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [newChatQuery, setNewChatQuery] = useState('');
  const [userResults, setUserResults] = useState([]);

  const unreadTotal = useMemo(
    () => conversations.reduce((total, conversation) => total + (conversation.unreadCount || 0), 0),
    [conversations]
  );

  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  const loadConversations = async () => {
    const response = await conversationsService.getAll();
    setConversations(response.data || []);
  };

  useEffect(() => {
    if (!user?.id) return undefined;

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    socketRef.current = socket;
    socket.emit('user:connect', user.id);

    socket.on('new_message', ({ conversationId, message }) => {
      setConversations((prev) => {
        const existing = prev.find((conversation) => conversation.id === conversationId);
        if (!existing) {
          loadConversations().catch(() => {});
          return prev;
        }

        const updated = {
          ...existing,
          lastMessage: message,
          lastMessageAt: message.createdAt,
          unreadCount: message.recipientId === user.id && activeConversationRef.current?.id !== conversationId
            ? (existing.unreadCount || 0) + 1
            : existing.unreadCount || 0,
        };

        return [updated, ...prev.filter((conversation) => conversation.id !== conversationId)];
      });

      if (activeConversationRef.current?.id === conversationId) {
        setMessages((prev) => prev.some((item) => item.id === message.id) ? prev : [...prev, message]);
        conversationsService.markRead(conversationId).catch(() => {});
      }
    });

    socket.on('message_read', ({ conversationId }) => {
      setConversations((prev) => prev.map((conversation) => (
        conversation.id === conversationId ? { ...conversation, unreadCount: 0 } : conversation
      )));
    });

    loadConversations().catch((err) => showToast(err.message || 'No se pudieron cargar los mensajes', 'error'));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!open || !newChatQuery.trim()) {
      setUserResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const response = await usersService.searchUsers(newChatQuery.trim(), 1, 8);
        setUserResults((response.data?.users || []).filter((result) => result.id !== user.id));
      } catch {
        setUserResults([]);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [newChatQuery, open, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openConversation = async (conversation) => {
    setActiveConversation(conversation);
    setLoading(true);
    try {
      const response = await conversationsService.getMessages(conversation.id);
      setMessages(response.data?.messages || []);
      await conversationsService.markRead(conversation.id);
      socketRef.current?.emit('message:read', { conversationId: conversation.id, userId: user.id });
      setConversations((prev) => prev.map((item) => (
        item.id === conversation.id ? { ...item, unreadCount: 0 } : item
      )));
    } catch (err) {
      showToast(err.message || 'No se pudo abrir la conversación', 'error');
    } finally {
      setLoading(false);
    }
  };

  const startConversation = async (recipientId) => {
    try {
      const response = await conversationsService.createOrGet(recipientId);
      const conversation = response.data;
      setConversations((prev) => {
        if (prev.some((item) => item.id === conversation.id)) return prev;
        return [conversation, ...prev];
      });
      setNewChatQuery('');
      setUserResults([]);
      await openConversation(conversation);
    } catch (err) {
      showToast(err.message || 'No se pudo crear la conversación', 'error');
    }
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    const content = messageText.trim();
    if (!content || !activeConversation) return;

    setMessageText('');
    try {
      if (socketRef.current?.connected) {
        const ack = await socketRef.current.timeout(4000).emitWithAck('message:send', {
          conversationId: activeConversation.id,
          content,
        });

        if (!ack?.success) {
          throw new Error(ack?.error || 'No se pudo enviar por socket');
        }
        return;
      }

      throw new Error('Socket no conectado');
    } catch {
      try {
        const response = await conversationsService.sendMessage(activeConversation.id, content);
        setMessages((prev) => prev.some((item) => item.id === response.data.id) ? prev : [...prev, response.data]);
      } catch (err) {
        showToast(err.message || 'No se pudo enviar el mensaje', 'error');
      }
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fp-button fp-button--ghost"
        style={{ position: 'relative', minWidth: 44, padding: '10px 12px' }}
        title="Mensajes"
      >
        💬
        {unreadTotal > 0 && (
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
            {unreadTotal > 9 ? '9+' : unreadTotal}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.62)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <section style={{
            width: 'min(960px, 100vw)',
            height: '100%',
            background: '#081018',
            borderLeft: '1px solid rgba(255,255,255,0.12)',
            color: '#fff',
            display: 'grid',
            gridTemplateColumns: '320px 1fr',
          }}>
            <aside style={{ borderRight: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <div style={{ padding: 16, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h2 style={{ margin: 0, fontSize: 18 }}>Mensajes</h2>
                  <button onClick={() => setOpen(false)} className="fp-button fp-button--ghost" style={{ padding: '7px 10px' }}>x</button>
                </div>
                <input
                  value={newChatQuery}
                  onChange={(e) => setNewChatQuery(e.target.value)}
                  placeholder="Buscar usuario para escribir..."
                  style={{ width: '100%', boxSizing: 'border-box', borderRadius: 10, border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(255,255,255,0.06)', color: '#fff', padding: '10px 12px' }}
                />
                {userResults.length > 0 && (
                  <div style={{ marginTop: 8, display: 'grid', gap: 6 }}>
                    {userResults.map((result) => (
                      <button key={result.id} onClick={() => startConversation(result.id)} style={{ textAlign: 'left', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', borderRadius: 9, padding: 9, cursor: 'pointer' }}>
                        {result.firstName} {result.lastName} · {result.role}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ overflowY: 'auto', padding: 10, display: 'grid', gap: 8 }}>
                {conversations.length === 0 && (
                  <p style={{ color: '#ffffff80', textAlign: 'center', padding: 20, fontSize: 13 }}>No hay conversaciones todavía.</p>
                )}
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => openConversation(conversation)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '42px 1fr auto',
                      gap: 10,
                      alignItems: 'center',
                      textAlign: 'left',
                      border: `1px solid ${activeConversation?.id === conversation.id ? accentColor : 'rgba(255,255,255,0.1)'}`,
                      background: activeConversation?.id === conversation.id ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
                      color: '#fff',
                      borderRadius: 10,
                      padding: 10,
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ width: 42, height: 42, borderRadius: 14, background: `linear-gradient(135deg, ${accentColor}, #08795c)`, display: 'grid', placeItems: 'center', fontWeight: 900 }}>
                      {getInitials(conversation.otherUser)}
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <strong style={{ display: 'block', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {conversation.otherUser?.firstName} {conversation.otherUser?.lastName}
                      </strong>
                      <span style={{ display: 'block', color: '#ffffff80', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {conversation.lastMessage?.content || 'Sin mensajes'}
                      </span>
                    </span>
                    <span style={{ display: 'grid', justifyItems: 'end', gap: 5 }}>
                      <small style={{ color: '#ffffff70', fontSize: 10 }}>{formatTime(conversation.lastMessage?.createdAt || conversation.updatedAt)}</small>
                      {conversation.unreadCount > 0 && <strong style={{ background: accentColor, color: '#00130d', borderRadius: 999, minWidth: 18, height: 18, display: 'grid', placeItems: 'center', fontSize: 11 }}>{conversation.unreadCount}</strong>}
                    </span>
                  </button>
                ))}
              </div>
            </aside>

            <main style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              {activeConversation ? (
                <>
                  <header style={{ padding: 16, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 40, height: 40, borderRadius: 13, background: `linear-gradient(135deg, ${accentColor}, #08795c)`, display: 'grid', placeItems: 'center', fontWeight: 900 }}>
                      {getInitials(activeConversation.otherUser)}
                    </span>
                    <div>
                      <strong>{activeConversation.otherUser?.firstName} {activeConversation.otherUser?.lastName}</strong>
                      <div style={{ color: '#ffffff80', fontSize: 12 }}>{activeConversation.otherUser?.role}</div>
                    </div>
                  </header>

                  <div style={{ flex: 1, overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {loading && <p style={{ color: '#ffffff80' }}>Cargando mensajes...</p>}
                    {messages.map((message) => {
                      const mine = message.senderId === user.id;
                      return (
                        <div key={message.id} style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                          <div style={{
                            borderRadius: mine ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                            background: mine ? accentColor : 'rgba(255,255,255,0.09)',
                            color: mine ? '#00130d' : '#fff',
                            padding: '10px 12px',
                            lineHeight: 1.35,
                            fontSize: 14,
                          }}>
                            {message.content}
                          </div>
                          <small style={{ display: 'block', textAlign: mine ? 'right' : 'left', color: '#ffffff70', marginTop: 4 }}>{formatTime(message.createdAt)}</small>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  <form onSubmit={sendMessage} style={{ padding: 14, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: 10 }}>
                    <input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Escribe un mensaje..."
                      style={{ flex: 1, borderRadius: 10, border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(255,255,255,0.06)', color: '#fff', padding: '12px 14px' }}
                    />
                    <button className="fp-button" type="submit" disabled={!messageText.trim()}>Enviar</button>
                  </form>
                </>
              ) : (
                <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: '#ffffff80', textAlign: 'center', padding: 24 }}>
                  Selecciona una conversación o busca un usuario para empezar.
                </div>
              )}
            </main>
          </section>
        </div>
      )}
    </>
  );
}
