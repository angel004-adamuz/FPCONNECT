import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useFeed, useConnections, useUserSearch } from '../hooks';
import UserCard from '../components/UserCard';
import ProfileEditor from '../components/ProfileEditor';
import MessagesPanel from '../components/MessagesPanel';
import NotificationsBell from '../components/NotificationsBell';

export default function CentroApp() {
  const { user: authUser, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('dashboard');

  const { posts, loadFeed, loading: feedLoading } = useFeed();
  const { followers, following, followUser, unfollowUser, loading: connectionsLoading } = useConnections();
  const { results: searchResults, search, loading: searchLoading } = useUserSearch();

  useEffect(() => {
    if (activeTab === 'dashboard' || activeTab === 'network') {
      loadFeed();
    }
    if (activeTab === 'students') {
      search('all', 1, 50, 'ALUMNO');
    }
  }, [activeTab]);

  const handleLogout = async () => await logout();

  const handleFollowUser = async (userId) => {
    try { await followUser(userId); } catch (err) { alert('Error: ' + err.message); }
  };

  const handleUnfollowUser = async (userId) => {
    try { await unfollowUser(userId); } catch (err) { alert('Error: ' + err.message); }
  };

  return (
    <div className="fp-app-shell fp-app-shell--center">
      <nav className="fp-topbar">
        <div className="fp-topbar__left">
          <div className="fp-brand">
            <span className="fp-brand__mark" style={{ background: 'linear-gradient(135deg, var(--fp-blue), #2563eb)' }}>FP</span>
            <span>FP<span style={{ color: 'var(--fp-blue)' }}>Connect</span></span>
          </div>
          <div className="fp-tabs">
            {[
              { id: 'dashboard', label: 'Panel' },
              { id: 'students', label: 'Alumnos' },
              { id: 'network', label: 'Red' },
              { id: 'profile', label: 'Mi Centro' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`fp-tab fp-tab--blue ${activeTab === tab.id ? 'is-active' : ''}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="fp-topbar__right">
          <div style={{ textAlign: 'right', fontSize: 12 }}>
            <div style={{ fontWeight: 600 }}>{authUser?.firstName} {authUser?.lastName}</div>
            <div style={{ color: 'var(--fp-muted)' }}>Centro FP</div>
          </div>
          <NotificationsBell user={authUser} accentColor="#2563EB" />
          <MessagesPanel user={authUser} accentColor="#2563EB" />
          <button onClick={handleLogout} className="fp-button fp-button--danger">Salir</button>
        </div>
      </nav>

      <div className="fp-content">

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Banner con imagen de fondo */}
            <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 32, position: 'relative', height: 180 }}>
              <img
                src="https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80"
                alt="Banner centro"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(90deg, rgba(37,99,235,0.92) 0%, rgba(29,78,216,0.6) 60%, rgba(0,0,0,0.2) 100%)',
                display: 'flex', alignItems: 'center', padding: '0 36px',
              }}>
                <div>
                  <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 800, color: '#fff' }}>
                    Bienvenido, {authUser?.firstName} 👋
                  </h1>
                  <p style={{ margin: 0, fontSize: 14, color: '#ffffffdd' }}>
                    Centro FP para formación y desarrollo de talento
                  </p>
                </div>
              </div>
            </div>

            {feedLoading ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#ffffff66' }}>⏳ Cargando actividad...</div>
            ) : (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>📰 Actividad Reciente</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                  {posts?.slice(0, 3).map(post => (
                    <div key={post.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', padding: 20 }}>
                      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent((post.author?.firstName || '') + ' ' + (post.author?.lastName || ''))}&background=2563EB&color=fff&size=40&bold=true&rounded=true`}
                          alt=""
                          style={{ width: 40, height: 40, borderRadius: '50%' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{post.author?.firstName} {post.author?.lastName}</div>
                          <div style={{ fontSize: 12, color: '#ffffff66' }}>{new Date(post.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: '#ffffff99' }}>{post.content?.slice(0, 100)}...</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ALUMNOS */}
        {activeTab === 'students' && (
          <div>
            {/* Banner alumnos */}
            <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 24, position: 'relative', height: 140 }}>
              <img
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80"
                alt="Alumnos"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 60%' }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(90deg, rgba(37,99,235,0.88) 0%, rgba(0,0,0,0.3) 100%)',
                display: 'flex', alignItems: 'center', padding: '0 28px',
              }}>
                <div>
                  <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#fff' }}>🎓 Alumnos Vinculados</h2>
                  <p style={{ margin: 0, fontSize: 13, color: '#ffffffdd' }}>Busca y gestiona los alumnos de tu centro</p>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <input
                type="text"
                placeholder="Busca por nombre, ciclo..."
                onChange={(e) => search(e.target.value.trim() || 'all', 1, 50, 'ALUMNO')}
                style={{ width: '100%', maxWidth: 500, padding: '14px 18px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 14, fontFamily: 'inherit' }}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(37,99,235,0.5)'; e.target.style.background = 'rgba(37,99,235,0.08)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.2)'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
              />
            </div>
            {searchLoading ? (
              <p style={{ color: '#ffffff66', textAlign: 'center', padding: 40 }}>⏳ Buscando...</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {searchResults.filter(u => u.role === 'ALUMNO').length === 0 ? (
                  <p style={{ color: '#ffffff66', gridColumn: '1 / -1', textAlign: 'center', padding: 40 }}>🔍 No hay alumnos disponibles</p>
                ) : (
                  searchResults.filter(u => u.role === 'ALUMNO').map(student => (
                    <UserCard key={student.id} user={student}
                      isFollowing={!!following?.find(u => u.id === student.id)}
                      onFollow={() => handleFollowUser(student.id)}
                      onUnfollow={() => handleUnfollowUser(student.id)}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* RED */}
        {activeTab === 'network' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>👥 Seguidores ({followers?.length || 0})</h2>
              {connectionsLoading ? <p style={{ color: '#ffffff66', textAlign: 'center', padding: 40 }}>⏳ Cargando...</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {followers?.length === 0 && <p style={{ color: '#ffffff66', textAlign: 'center', padding: 40 }}>📭 Sin seguidores aún</p>}
                  {followers?.map(f => <UserCard key={f.id} user={f} actions={false} />)}
                </div>
              )}
            </div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>⭐ Siguiendo ({following?.length || 0})</h2>
              {connectionsLoading ? <p style={{ color: '#ffffff66', textAlign: 'center', padding: 40 }}>⏳ Cargando...</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {following?.length === 0 && <p style={{ color: '#ffffff66', textAlign: 'center', padding: 40 }}>🔍 No sigues a nadie aún</p>}
                  {following?.map(f => <UserCard key={f.id} user={f} isFollowing={true} onUnfollow={() => handleUnfollowUser(f.id)} />)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PERFIL */}
        {activeTab === 'profile' && (
          <ProfileEditor user={authUser} role="CENTRO" accentColor="#2563EB" />
        )}

      </div>
    </div>
  );
}