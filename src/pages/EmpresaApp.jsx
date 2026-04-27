import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useFeed, useConnections, useUserSearch } from '../hooks';
import UserCard from '../components/UserCard';

export default function EmpresaApp() {
  const { user: authUser, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('dashboard');

  const { posts, loadFeed, loading: feedLoading } = useFeed();
  const {
    followers,
    following,
    followUser,
    unfollowUser,
    loading: connectionsLoading,
  } = useConnections();
  const { results: searchResults, search, loading: searchLoading } = useUserSearch();

  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadFeed();
    } else if (activeTab === 'network') {
      loadFeed();
    }
  }, [activeTab, loadFeed]);

  const handleLogout = async () => {
    await logout();
  };

  const handleFollowUser = async (userId) => {
    try {
      await followUser(userId);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleUnfollowUser = async (userId) => {
    try {
      await unfollowUser(userId);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="fp-app-shell fp-app-shell--company">
      {/* TOP NAV */}
      <nav className="fp-topbar">
        <div className="fp-topbar__left">
          <div className="fp-brand">
            <span className="fp-brand__mark" style={{ background: 'linear-gradient(135deg, var(--fp-pink), #be185d)' }}>FP</span>
            <span>FP<span style={{ color: 'var(--fp-pink)' }}>Connect</span></span>
          </div>

          <div className="fp-tabs">
            {[
              { id: 'dashboard', label: 'Panel' },
              { id: 'students', label: 'Talento' },
              { id: 'network', label: 'Red' },
              { id: 'profile', label: 'Empresa' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`fp-tab fp-tab--pink ${activeTab === tab.id ? 'is-active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="fp-topbar__right">
          <div style={{ textAlign: 'right', fontSize: 12 }}>
            <div style={{ fontWeight: 600 }}>
              {authUser?.firstName} {authUser?.lastName}
            </div>
            <div style={{ color: 'var(--fp-muted)' }}>Empresa</div>
          </div>

          <button
            onClick={handleLogout}
            className="fp-button fp-button--danger"
          >
            Salir
          </button>
        </div>
      </nav>

      {/* CONTENT */}
      <div className="fp-content">
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div>
            <div style={{
              background: 'linear-gradient(135deg, #EC4899 0%, #be185d 100%)',
              borderRadius: 16,
              padding: 32,
              marginBottom: 32,
              color: '#fff',
            }}>
              <h1 style={{ margin: '0 0 12px', fontSize: 28, fontWeight: 800 }}>
                Bienvenido, {authUser?.firstName}
              </h1>
              <p style={{ margin: 0, fontSize: 14, opacity: 0.9 }}>
                Encuentra y conecta con talento técnico joven
              </p>
            </div>

            {feedLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#ffffff66' }}>
                ⏳ Cargando actividad...
              </div>
            ) : (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
                  📰 Actividad Reciente
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                  {posts?.slice(0, 3).map(post => (
                    <div
                      key={post.id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 12,
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: 20,
                      }}
                    >
                      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #EC4899, #be185d)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 14,
                            fontWeight: 700,
                          }}
                        >
                          {post.author?.firstName?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>
                            {post.author?.firstName} {post.author?.lastName}
                          </div>
                          <div style={{ fontSize: 12, color: '#ffffff66' }}>
                            {new Date(post.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: '#ffffff99' }}>
                        {post.content?.slice(0, 100)}...
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STUDENTS/TALENT TAB - Search for students */}
        {activeTab === 'students' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>
              🎓 Busca Talento
            </h2>

            <div style={{ marginBottom: 32 }}>
              <input
                type="text"
                placeholder="Busca alumnos y profesionales..."
                onChange={(e) => search(e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: 500,
                  padding: '14px 18px',
                  borderRadius: 12,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  fontSize: 14,
                  fontFamily: 'inherit',
                  transition: 'all 0.2s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(236, 72, 153, 0.5)';
                  e.target.style.background = 'rgba(236, 72, 153, 0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              />
            </div>

            {searchLoading ? (
              <p style={{ color: '#ffffff66', textAlign: 'center', padding: 40 }}>
                ⏳ Buscando...
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {searchResults.length === 0 ? (
                  <p style={{ color: '#ffffff66', gridColumn: '1 / -1', textAlign: 'center', padding: 40 }}>
                    🔍 Escribe para buscar talento
                  </p>
                ) : (
                  searchResults.map(student => (
                    <UserCard
                      key={student.id}
                      user={student}
                      onFollow={() => handleFollowUser(student.id)}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* NETWORK TAB */}
        {activeTab === 'network' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
                👥 Seguidores ({followers?.length || 0})
              </h2>

              {connectionsLoading ? (
                <p style={{ color: '#ffffff66', textAlign: 'center', padding: 40 }}>
                  ⏳ Cargando...
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {followers?.length === 0 && (
                    <p style={{ color: '#ffffff66', textAlign: 'center', padding: 40 }}>
                      📭 Sin seguidores aún
                    </p>
                  )}

                  {followers?.map(follower => (
                    <UserCard
                      key={follower.id}
                      user={follower}
                      actions={false}
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
                ⭐ Siguiendo ({following?.length || 0})
              </h2>

              {connectionsLoading ? (
                <p style={{ color: '#ffffff66', textAlign: 'center', padding: 40 }}>
                  ⏳ Cargando...
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {following?.length === 0 && (
                    <p style={{ color: '#ffffff66', textAlign: 'center', padding: 40 }}>
                      🔍 No sigues a nadie aún
                    </p>
                  )}

                  {following?.map(followedUser => (
                    <UserCard
                      key={followedUser.id}
                      user={followedUser}
                      isFollowing={true}
                      onUnfollow={() => handleUnfollowUser(followedUser.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: 16,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: 32,
            }}
          >
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>
              🏢 Información de la Empresa
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#ffffff99' }}>
                  Empresa
                </label>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 14,
                }}>
                  {authUser?.firstName}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#ffffff99' }}>
                  Correo
                </label>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 14,
                }}>
                  {authUser?.email}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#ffffff99' }}>
                  Rol
                </label>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 14,
                }}>
                  Empresa
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#ffffff99' }}>
                  Desde
                </label>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 14,
                }}>
                  {new Date(authUser?.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 32 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>📊 Estadísticas</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <div style={{
                  background: 'rgba(236, 72, 153, 0.1)',
                  borderRadius: 12,
                  padding: 16,
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
                    {followers?.length || 0}
                  </div>
                  <div style={{ fontSize: 12, color: '#ffffff99' }}>Seguidores</div>
                </div>

                <div style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: 12,
                  padding: 16,
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
                    {following?.length || 0}
                  </div>
                  <div style={{ fontSize: 12, color: '#ffffff99' }}>Siguiendo</div>
                </div>

                <div style={{
                  background: 'rgba(168, 85, 247, 0.1)',
                  borderRadius: 12,
                  padding: 16,
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
                    0
                  </div>
                  <div style={{ fontSize: 12, color: '#ffffff99' }}>Ofertas</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
