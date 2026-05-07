import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { useFeed, useConnections, useUserSearch } from '../hooks';
import UserCard from '../components/UserCard';
import ProfileEditor from '../components/ProfileEditor';
import MessagesPanel from '../components/MessagesPanel';
import NotificationsBell from '../components/NotificationsBell';
import { jobOffersService } from '../services';

const APPLICATION_LABELS = {
  PENDING: 'Pendiente',
  REVIEWED: 'Revisado',
  ACCEPTED: 'Aceptado',
  REJECTED: 'Rechazado',
};

const parseJsonArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function EmpresaApp() {
  const { user: authUser, logout } = useAuthStore();
  const { showToast } = useUIStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [newOffer, setNewOffer] = useState({ title: '', description: '', type: 'EMPLEO', location: '', salary: '' });
  const [expandedOfferId, setExpandedOfferId] = useState('');
  const [applicationsByOffer, setApplicationsByOffer] = useState({});
  const [applicationsLoadingByOffer, setApplicationsLoadingByOffer] = useState({});

  const { posts, loadFeed, loading: feedLoading } = useFeed();
  const { followers, following, loadFollowers, loadFollowing, followUser, unfollowUser, loading: connectionsLoading } = useConnections();
  const { results: searchResults, search, loading: searchLoading } = useUserSearch();

  useEffect(() => {
    if (activeTab === 'dashboard') loadFeed();
    if (activeTab === 'network') { loadFeed(); loadFollowers(); loadFollowing(); }
    if (activeTab === 'students') search('all', 1, 50, 'ALUMNO');
    if (activeTab === 'offers') loadOffers();
  }, [activeTab]);

  const handleLogout = async () => await logout();

  const handleFollowUser = async (userId) => {
    try { await followUser(userId); } catch (err) { alert('Error: ' + err.message); }
  };

  const handleUnfollowUser = async (userId) => {
    try { await unfollowUser(userId); } catch (err) { alert('Error: ' + err.message); }
  };

  const loadOffers = async () => {
    setOffersLoading(true);
    try {
      const res = await jobOffersService.getAll();
      setOffers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setOffersLoading(false);
    }
  };

  const handleCreateOffer = async () => {
    try {
      const res = await jobOffersService.create(newOffer);
      setOffers(prev => [res.data, ...prev]);
      setNewOffer({ title: '', description: '', type: 'EMPLEO', location: '', salary: '' });
      showToast('Oferta publicada correctamente', 'success');
    } catch (err) {
      showToast(err.message || 'Error al crear oferta', 'error');
    }
  };

  const handleDeleteOffer = async (id) => {
    try {
      await jobOffersService.delete(id);
      setOffers(prev => prev.filter(o => o.id !== id));
      showToast('Oferta eliminada', 'success');
    } catch (err) {
      showToast(err.message || 'Error al eliminar', 'error');
    }
  };

  const toggleApplicants = async (offerId) => {
    if (expandedOfferId === offerId) {
      setExpandedOfferId('');
      return;
    }

    setExpandedOfferId(offerId);
    setApplicationsLoadingByOffer(prev => ({ ...prev, [offerId]: true }));
    try {
      const response = await jobOffersService.getApplications(offerId);
      setApplicationsByOffer(prev => ({ ...prev, [offerId]: response.data || [] }));
    } catch (err) {
      showToast(err.message || 'No se pudieron cargar candidatos', 'error');
    } finally {
      setApplicationsLoadingByOffer(prev => ({ ...prev, [offerId]: false }));
    }
  };

  const handleApplicationStatusChange = async (offerId, applicationId, status) => {
    try {
      const response = await jobOffersService.updateApplicationStatus(offerId, applicationId, status);
      const updated = response.data;
      setApplicationsByOffer(prev => ({
        ...prev,
        [offerId]: (prev[offerId] || []).map(app => app.id === applicationId ? updated : app),
      }));
      showToast('Estado actualizado', 'success');
    } catch (err) {
      showToast(err.message || 'No se pudo actualizar el estado', 'error');
    }
  };

  return (
    <div className="fp-app-shell fp-app-shell--company">
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
              { id: 'offers', label: 'Ofertas' },
              { id: 'network', label: 'Red' },
              { id: 'profile', label: 'Mi Empresa' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`fp-tab fp-tab--pink ${activeTab === tab.id ? 'is-active' : ''}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="fp-topbar__right">
          <div style={{ textAlign: 'right', fontSize: 12 }}>
            <div style={{ fontWeight: 600 }}>{authUser?.firstName} {authUser?.lastName}</div>
            <div style={{ color: 'var(--fp-muted)' }}>Empresa</div>
          </div>
          <NotificationsBell user={authUser} accentColor="#EC4899" />
          <MessagesPanel user={authUser} accentColor="#EC4899" />
          <button onClick={handleLogout} className="fp-button fp-button--danger">Salir</button>
        </div>
      </nav>

      <div className="fp-content">

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div>
            <div style={{ background: 'linear-gradient(135deg, #EC4899 0%, #be185d 100%)', borderRadius: 16, padding: 32, marginBottom: 32, color: '#fff' }}>
              <h1 style={{ margin: '0 0 12px', fontSize: 28, fontWeight: 800 }}>Bienvenido, {authUser?.firstName}</h1>
              <p style={{ margin: 0, fontSize: 14, opacity: 0.9 }}>Encuentra y conecta con talento técnico joven</p>
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
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #EC4899, #be185d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>
                          {post.author?.firstName?.[0]?.toUpperCase()}
                        </div>
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

        {/* TALENTO */}
        {activeTab === 'students' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>🎓 Busca Talento</h2>
            <p style={{ color: '#ffffff99', fontSize: 13, marginBottom: 24 }}>Alumnos disponibles para prácticas o empleo</p>
            <div style={{ marginBottom: 24 }}>
              <input type="text" placeholder="Busca por nombre, ciclo o habilidad..."
                onChange={(e) => search(e.target.value.trim() || 'all', 1, 50, 'ALUMNO')}
                style={{ width: '100%', maxWidth: 500, padding: '14px 18px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 14, fontFamily: 'inherit' }}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(236,72,153,0.5)'; e.target.style.background = 'rgba(236,72,153,0.08)'; }}
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

        {/* OFERTAS */}
        {activeTab === 'offers' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>💼 Mis Ofertas de Empleo</h2>
            <p style={{ color: '#ffffff99', fontSize: 13, marginBottom: 24 }}>Publica ofertas de prácticas o empleo para alumnos de FP</p>

            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', padding: 24, marginBottom: 32 }}>
              <h3 style={{ margin: '0 0 20px', fontSize: 18 }}>➕ Nueva oferta</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', color: '#ffffff88', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Título *</label>
                  <input value={newOffer.title} onChange={e => setNewOffer(p => ({ ...p, title: e.target.value }))}
                    placeholder="Ej: Desarrollador DAM en prácticas"
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)', color: '#fff', fontSize: 14, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#ffffff88', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Tipo</label>
                  <select value={newOffer.type} onChange={e => setNewOffer(p => ({ ...p, type: e.target.value }))}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: '#1a1a2e', color: '#fff', fontSize: 14 }}>
                    <option value="EMPLEO">Empleo</option>
                    <option value="PRACTICAS">Prácticas</option>
                    <option value="BECA">Beca</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', color: '#ffffff88', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Ubicación</label>
                  <input value={newOffer.location} onChange={e => setNewOffer(p => ({ ...p, location: e.target.value }))}
                    placeholder="Ej: Sevilla / Remoto"
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)', color: '#fff', fontSize: 14, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#ffffff88', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Salario</label>
                  <input value={newOffer.salary} onChange={e => setNewOffer(p => ({ ...p, salary: e.target.value }))}
                    placeholder="Ej: 18.000€/año o Beca 600€/mes"
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)', color: '#fff', fontSize: 14, boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', color: '#ffffff88', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Descripción *</label>
                <textarea value={newOffer.description} onChange={e => setNewOffer(p => ({ ...p, description: e.target.value }))}
                  rows={3} placeholder="Describe el puesto, requisitos y lo que ofreces..."
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)', color: '#fff', fontSize: 14, boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
              <button onClick={handleCreateOffer} disabled={!newOffer.title || !newOffer.description}
                style={{ padding: '12px 24px', borderRadius: 10, border: 'none', background: !newOffer.title || !newOffer.description ? 'rgba(236,72,153,0.3)' : 'linear-gradient(135deg, #EC4899, #be185d)', color: '#fff', fontWeight: 700, cursor: !newOffer.title || !newOffer.description ? 'not-allowed' : 'pointer', fontSize: 14 }}>
                Publicar oferta
              </button>
            </div>

            {offersLoading ? (
              <p style={{ color: '#ffffff66', textAlign: 'center', padding: 40 }}>⏳ Cargando ofertas...</p>
            ) : offers.length === 0 ? (
              <p style={{ color: '#ffffff66', textAlign: 'center', padding: 40 }}>📭 No hay ofertas publicadas aún</p>
            ) : (
              <div style={{ display: 'grid', gap: 16 }}>
                {offers.map(offer => (
                  <div key={offer.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)', padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <h3 style={{ margin: '0 0 6px', fontSize: 18 }}>{offer.title}</h3>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 999, background: 'rgba(236,72,153,0.2)', border: '1px solid rgba(236,72,153,0.4)' }}>{offer.type}</span>
                          {offer.location && <span style={{ fontSize: 12, color: '#ffffff99' }}>📍 {offer.location}</span>}
                          {offer.salary && <span style={{ fontSize: 12, color: '#ffffff99' }}>💰 {offer.salary}</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <button onClick={() => toggleApplicants(offer.id)}
                          style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: 'rgba(236,72,153,0.2)', color: '#fbcfe8', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                          {expandedOfferId === offer.id ? 'Ocultar candidatos' : 'Ver candidatos'}
                        </button>
                        <button onClick={() => handleDeleteOffer(offer.id)}
                          style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: 'rgba(239,68,68,0.2)', color: '#fca5a5', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                          Eliminar
                        </button>
                      </div>
                    </div>
                    <p style={{ margin: 0, color: '#ffffffcc', fontSize: 14, lineHeight: 1.5 }}>{offer.description}</p>
                    {expandedOfferId === offer.id && (
                      <div style={{ marginTop: 18, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16 }}>
                        <h4 style={{ margin: '0 0 12px', fontSize: 15 }}>Candidatos</h4>
                        {applicationsLoadingByOffer[offer.id] ? (
                          <p style={{ color: '#ffffff80', fontSize: 13 }}>Cargando candidatos...</p>
                        ) : (applicationsByOffer[offer.id] || []).length === 0 ? (
                          <p style={{ color: '#ffffff80', fontSize: 13 }}>Esta oferta aun no tiene aplicaciones.</p>
                        ) : (
                          <div style={{ display: 'grid', gap: 10 }}>
                            {(applicationsByOffer[offer.id] || []).map(application => {
                              const student = application.student;
                              const skills = parseJsonArray(student?.skills);
                              return (
                                <div key={application.id} style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 12, display: 'grid', gap: 10 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                                    <div>
                                      <strong>{student?.user?.firstName} {student?.user?.lastName}</strong>
                                      <div style={{ color: '#ffffff80', fontSize: 12 }}>{student?.cicle || 'Ciclo no indicado'}{student?.user?.location ? ` · ${student.user.location}` : ''}</div>
                                      <div style={{ color: student?.seekingJob ? '#bbf7d0' : '#ffffff80', fontSize: 12, marginTop: 4 }}>
                                        {student?.seekingJob ? 'Disponible para oportunidades' : 'Disponibilidad no indicada'}
                                      </div>
                                    </div>
                                    <select
                                      value={application.status}
                                      onChange={(event) => handleApplicationStatusChange(offer.id, application.id, event.target.value)}
                                      style={{ height: 36, borderRadius: 8, border: '1px solid rgba(255,255,255,0.18)', background: '#1a1a2e', color: '#fff', padding: '0 10px' }}
                                    >
                                      {Object.entries(APPLICATION_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                                    </select>
                                  </div>
                                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    {skills.length > 0 ? skills.map(skill => <span key={skill} style={{ fontSize: 11, padding: '4px 8px', borderRadius: 999, background: 'rgba(236,72,153,0.18)', border: '1px solid rgba(236,72,153,0.35)' }}>{skill}</span>) : <span style={{ color: '#ffffff70', fontSize: 12 }}>Sin skills registradas</span>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
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
          <ProfileEditor user={authUser} role="EMPRESA" accentColor="#EC4899" />
        )}

      </div>
    </div>
  );
}
