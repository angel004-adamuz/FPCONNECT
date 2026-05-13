import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { useFeed, useConnections, useUserSearch } from '../hooks';
import Feed from '../components/Feed';
import UserCard from '../components/UserCard';
import PublicProfileView from '../components/PublicProfileView';
import { usersService, jobOffersService } from '../services';
import ProfileEditor from '../components/ProfileEditor';
import MessagesPanel from '../components/MessagesPanel';
import NotificationsBell from '../components/NotificationsBell';

const ANDALUCIA_PROVINCES = ['ALMERIA','CADIZ','CORDOBA','GRANADA','HUELVA','JAEN','MALAGA','SEVILLA'];

const FP_NEWS_ITEMS = [
  { id: 'mec-2026', title: 'Becas MEC 2026/2027 para estudios postobligatorios', category: 'Becas', summary: 'Ayudas para estudiantes de FP Grado Medio y Superior. Incluye cuantia fija y variable segun renta y rendimiento.', deadline: 'Plazo estimado: mayo-junio', source: 'Ministerio de Educacion y FP', url: 'https://www.becaseducacion.gob.es/', img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80' },
  { id: 'fse-plus-andalucia', title: 'Programas de empleabilidad juvenil vinculados a FP en Andalucia', category: 'Convocatorias', summary: 'Iniciativas cofinanciadas para mejorar la insercion laboral de alumnado de FP con practicas y formacion complementaria.', deadline: 'Convocatorias durante el curso', source: 'Junta de Andalucia', url: 'https://www.juntadeandalucia.es/temas/estudiar/becas.html', img: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&q=80' },
  { id: 'erasmus-fp', title: 'Movilidad Erasmus+ para alumnado de FP', category: 'Internacional', summary: 'Opciones para realizar practicas en empresas europeas con apoyo economico para viaje y estancia.', deadline: 'Depende del centro educativo', source: 'SEPIE - Erasmus+', url: 'https://www.sepie.es/', img: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80' },
  { id: 'andalucia-dual', title: 'Nuevas plazas de FP Dual en sectores tecnologicos', category: 'FP Dual', summary: 'Incremento de plazas en colaboracion con empresas andaluzas para DAM, DAW, ASIR y especializaciones digitales.', deadline: 'Apertura por centro', source: 'Portal de FP Andalucia', url: 'https://www.juntadeandalucia.es/educacion/portals/web/formacion-profesional-andaluza', img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80' },
  { id: 'aula-emprendimiento', title: 'Aulas de emprendimiento y ayudas para proyectos de FP', category: 'Emprendimiento', summary: 'Convocatorias para prototipos y proyectos innovadores desarrollados por alumnado de ciclos formativos.', deadline: 'Revision trimestral', source: 'TodoFP', url: 'https://todofp.es/', img: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&q=80' },
];

const normalizeText = (value = '') => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();

const APPLICATION_LABELS = { PENDING: 'Pendiente', REVIEWED: 'Revisado', ACCEPTED: 'Aceptado', REJECTED: 'Rechazado' };
const APPLICATION_COLORS = {
  PENDING: ['rgba(234,179,8,0.18)', 'rgba(234,179,8,0.45)', '#fef3c7'],
  REVIEWED: ['rgba(59,130,246,0.18)', 'rgba(59,130,246,0.45)', '#bfdbfe'],
  ACCEPTED: ['rgba(34,197,94,0.18)', 'rgba(34,197,94,0.45)', '#bbf7d0'],
  REJECTED: ['rgba(239,68,68,0.18)', 'rgba(239,68,68,0.45)', '#fecaca'],
};

const ApplicationBadge = ({ status }) => {
  const colors = APPLICATION_COLORS[status] || APPLICATION_COLORS.PENDING;
  return <span style={{ fontSize: 12, padding: '5px 10px', borderRadius: 999, background: colors[0], border: `1px solid ${colors[1]}`, color: colors[2], fontWeight: 800 }}>{APPLICATION_LABELS[status] || status}</span>;
};

// Imagen aleatoria para ofertas según tipo
const getOfferImage = (type) => {
  const images = {
    PRACTICAS: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&q=80',
    EMPLEO: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80',
    BECA: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80',
  };
  return images[type] || images.EMPLEO;
};

export default function AlumnoApp() {
  const { user: authUser, logout } = useAuthStore();
  const { showToast } = useUIStore();
  const [activeTab, setActiveTab] = useState('feed');
  const [viewedProfileId, setViewedProfileId] = useState(null);
  const [networkSubTab, setNetworkSubTab] = useState('following');
  const [exploreSubTab, setExploreSubTab] = useState('centers');
  const [exploreProvinceQuickFilter, setExploreProvinceQuickFilter] = useState('ALL');
  const [centerQuery, setCenterQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('ALL');
  const [provinceFilter, setProvinceFilter] = useState('ALL');
  const [linkedCenter, setLinkedCenter] = useState(null);
  const [linkingCenterId, setLinkingCenterId] = useState('');
  const [unlinkingCenter, setUnlinkingCenter] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [enterpriseQuery, setEnterpriseQuery] = useState('');
  const [studentQuery, setStudentQuery] = useState('');
  const [offers, setOffers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [applyingOfferId, setApplyingOfferId] = useState('');

  const { posts, loadFeed, loading: feedLoading } = useFeed();
  const { followers, following, recommendations, loadFollowers, loadFollowing, loadRecommendations, followUser, unfollowUser, loading: connectionsLoading } = useConnections();
  const { results: searchResults, search, loading: searchLoading } = useUserSearch();

  const parseCicles = (rawCicles) => { if (!rawCicles) return []; if (Array.isArray(rawCicles)) return rawCicles; try { return JSON.parse(rawCicles); } catch { return []; } };
  const getGradeType = (cicle) => { const value = (cicle || '').toUpperCase(); if (value.startsWith('GM:')) return 'GM'; if (value.startsWith('GS:')) return 'GS'; if (value.startsWith('GE:')) return 'GE'; if (['SMR','GESTION ADMINISTRATIVA','MICROINFORMATICOS'].some(t => value.includes(t))) return 'GM'; if (['DAM','DAW','ASIR','DESARROLLO'].some(t => value.includes(t))) return 'GS'; if (['BIG DATA','CIBERSEGURIDAD','IA','INTELIGENCIA ARTIFICIAL','ESPECIALIZACION'].some(t => value.includes(t))) return 'GE'; return 'OTHER'; };
  const centerMatchesFilter = (center) => { const cicles = parseCicles(center.centerProfile?.cicles); const matchesGrade = gradeFilter === 'ALL' || cicles.some(c => getGradeType(c) === gradeFilter); const centerProvince = normalizeText(center.centerProfile?.province || ''); const matchesProvince = provinceFilter === 'ALL' || centerProvince === provinceFilter; const matchesQuickProvince = exploreProvinceQuickFilter === 'ALL' || centerProvince === exploreProvinceQuickFilter; return matchesGrade && matchesProvince && matchesQuickProvince; };
  const matchesQuickProvinceFromText = (value) => { if (exploreProvinceQuickFilter === 'ALL') return true; return normalizeText(value || '').includes(exploreProvinceQuickFilter); };

  const filteredCenters = (searchResults || []).filter(u => u.role === 'CENTRO').filter(centerMatchesFilter);
  const filteredEnterprises = (searchResults || []).filter(u => u.role === 'EMPRESA').filter(u => matchesQuickProvinceFromText(u.enterpriseProfile?.province || u.enterpriseProfile?.city || u.location || ''));
  const filteredStudents = (searchResults || []).filter(u => u.role === 'ALUMNO').filter(u => matchesQuickProvinceFromText(u.location || ''));
  const availableProvinces = Array.from(new Set((searchResults || []).filter(u => u.role === 'CENTRO').map(u => u.centerProfile?.province).filter(Boolean).map(p => normalizeText(p)))).sort();

  const getUserRoleLabel = (role) => role === 'ALUMNO' ? 'alumno' : role === 'CENTRO' ? 'centro educativo' : role === 'EMPRESA' ? 'empresa' : 'perfil';
  const resolveUserRoleById = (userId) => { const knownUsers = [...(followers||[]),...(following||[]),...(recommendations||[]),...(searchResults||[])]; return knownUsers.find(c => c?.id === userId)?.role; };

  const loadLinkedCenter = async () => { try { const r = await usersService.getMyLinkedCenter(); setLinkedCenter(r.data || null); } catch { setLinkedCenter(null); } };
  const loadOffers = async () => { setOffersLoading(true); try { const r = await jobOffersService.getAll(); setOffers(r.data || []); } catch (err) { console.error(err); } finally { setOffersLoading(false); } };
  const loadApplications = async () => { try { const r = await jobOffersService.getMyApplications(); setApplications(r.data || []); } catch (err) { console.error(err); } };

  useEffect(() => {
    if (activeTab === 'feed') { loadFeed(); loadRecommendations(); loadFollowing(1, 200); }
    else if (activeTab === 'network') { loadFollowers(); loadFollowing(1, 200); loadRecommendations(); loadFeed(); }
    else if (activeTab === 'explore') {
      loadRecommendations(); loadFollowing(1, 200); loadLinkedCenter();
      if (exploreSubTab === 'centers') search(centerQuery.trim() || 'all', 1, 50, 'CENTRO');
      else if (exploreSubTab === 'enterprises') search(enterpriseQuery.trim() || 'all', 1, 50, 'EMPRESA');
      else if (exploreSubTab === 'students') search(studentQuery.trim() || 'all', 1, 50, 'ALUMNO');
    }
    else if (activeTab === 'offers' || activeTab === 'applications') { loadOffers(); loadApplications(); }
  }, [activeTab, exploreSubTab, loadFeed, loadFollowers, loadFollowing, loadRecommendations, search]);

  useEffect(() => { loadLinkedCenter(); }, []);

  const handleLogout = async () => await logout();
  const handleFollowUser = async (userId) => { try { await followUser(userId); showToast(`Ahora sigues a este ${getUserRoleLabel(resolveUserRoleById(userId))}`, 'success'); } catch (err) { showToast(err.message || 'No se pudo seguir al usuario', 'error'); } };
  const handleUnfollowUser = async (userId) => { try { await unfollowUser(userId); showToast(`Has dejado de seguir este ${getUserRoleLabel(resolveUserRoleById(userId))}`, 'success'); if (linkedCenter?.id === userId) setLinkedCenter(null); } catch (err) { showToast(err.message || 'No se pudo dejar de seguir', 'error'); } };
  const handleLinkToCenter = async (center) => { setLinkingCenterId(center.id); setLinkError(''); try { const r = await usersService.linkMeToCenter(center.id); setLinkedCenter(r.data); await loadFollowing(1, 200); await loadRecommendations(); } catch (err) { setLinkError(err.message || 'No se pudo vincular el centro'); } finally { setLinkingCenterId(''); } };
  const handleUnlinkCenter = async () => { setUnlinkingCenter(true); setLinkError(''); try { await usersService.unlinkMeFromCenter(); setLinkedCenter(null); await loadFollowing(1, 200); await loadRecommendations(); } catch (err) { setLinkError(err.message || 'No se pudo desvincular el centro'); } finally { setUnlinkingCenter(false); } };
  const handleOpenProfile = async (userId) => { setViewedProfileId(userId); try { await loadFollowing(1, 200); } catch {} };
  const handleApplyOffer = async (offerId) => {
    setApplyingOfferId(offerId);
    try {
      const response = await jobOffersService.apply(offerId);
      const application = response.data;
      setApplications(prev => [application, ...prev.filter(item => item.id !== application.id)]);
      setOffers(prev => prev.map(offer => offer.id === offerId ? { ...offer, applications: [application] } : offer));
      showToast('Aplicacion enviada correctamente', 'success');
    } catch (err) { showToast(err.message || 'No se pudo aplicar a la oferta', 'error'); }
    finally { setApplyingOfferId(''); }
  };

  const isViewedProfileFollowing = viewedProfileId ? !!following?.find(u => u.id === viewedProfileId) : false;
  const followingIds = new Set((following || []).map(u => u.id));
  const followingPosts = (posts || []).filter(p => followingIds.has(p.author?.id));
  const recommendedByInterests = (recommendations || []).filter(u => !followingIds.has(u.id));

  return (
    <div className="fp-app-shell">
      <nav className="fp-topbar">
        <div className="fp-topbar__left">
          <div className="fp-brand">
            <span className="fp-brand__mark">FP</span>
            <span>FP<span className="fp-brand__accent">Connect</span></span>
          </div>
          <div className="fp-tabs">
            {[
              { id: 'feed', label: 'Feed' },
              { id: 'network', label: 'Conexiones' },
              { id: 'explore', label: 'Explorar' },
              { id: 'offers', label: 'Ofertas' },
              { id: 'applications', label: 'Mis Aplicaciones' },
              { id: 'news', label: 'Noticias FP' },
              { id: 'profile', label: 'Mi Perfil' },
            ].map(tab => (
              <button key={tab.id} onClick={() => { setViewedProfileId(null); setActiveTab(tab.id); }}
                className={`fp-tab ${activeTab === tab.id ? 'is-active' : ''}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="fp-topbar__right">
          <div style={{ textAlign: 'right', fontSize: 12 }}>
            <div style={{ fontWeight: 600 }}>{authUser?.firstName} {authUser?.lastName}</div>
            <div style={{ color: 'var(--fp-muted)' }}>Alumno</div>
          </div>
          <NotificationsBell user={authUser} />
          <MessagesPanel user={authUser} />
          <button onClick={handleLogout} className="fp-button fp-button--danger">Salir</button>
        </div>
      </nav>

      <div className="fp-content">

        {/* FEED */}
        {viewedProfileId ? (
          <PublicProfileView userId={viewedProfileId} onBack={() => setViewedProfileId(null)}
            isFollowing={isViewedProfileFollowing} onFollow={handleFollowUser} onUnfollow={handleUnfollowUser} />
        ) : activeTab === 'feed' && (
          <div className="fp-feed-layout">
            {/* Banner con imagen */}
            <div>
              <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 24, position: 'relative', height: 160 }}>
                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80" alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,20,15,0.85) 0%, rgba(0,40,30,0.4) 100%)', display: 'flex', alignItems: 'center', padding: '0 28px' }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Hola, {authUser?.firstName} 👋</div>
                    <div style={{ fontSize: 14, color: '#ffffffcc' }}>Bienvenido a FPConnect — tu red profesional de FP</div>
                  </div>
                </div>
              </div>
              {feedLoading ? <div style={{ textAlign: 'center', padding: 40, color: '#ffffff66' }}>⏳ Cargando feed...</div> : (
                <Feed recommendations={recommendations} following={following} onFollow={handleFollowUser} onUnfollow={handleUnfollowUser} onOpenProfile={handleOpenProfile} />
              )}
            </div>
            <aside className="fp-sidebar fp-card">
              <h3 style={{ margin: '0 0 16px 0', fontSize: 15, fontWeight: 800 }}>Sugerencias para ampliar tu red</h3>
              {connectionsLoading ? <p style={{ color: '#ffffff66', fontSize: 12 }}>Cargando...</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {recommendations?.length === 0 ? <p style={{ color: '#ffffff66', fontSize: 12, textAlign: 'center' }}>Sin recomendaciones</p> : (
                    recommendations?.slice(0, 5).map(rec => (
                      <div key={rec.id} style={{ background: 'rgba(255,255,255,0.02)', padding: 10, borderRadius: 10 }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(rec.firstName + ' ' + rec.lastName)}&background=00A878&color=fff&size=32&bold=true&rounded=true`} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{rec.firstName} {rec.lastName}</div>
                          </div>
                        </div>
                        <button onClick={() => following?.find(u => u.id === rec.id) ? handleUnfollowUser(rec.id) : handleFollowUser(rec.id)}
                          style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: 'none', background: following?.find(u => u.id === rec.id) ? 'rgba(255,255,255,0.15)' : 'linear-gradient(135deg, #00A878, #007A57)', color: '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
                          {following?.find(u => u.id === rec.id) ? '✓ Siguiendo' : '+ Seguir'}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </aside>
          </div>
        )}

        {/* NETWORK */}
        {!viewedProfileId && activeTab === 'network' && (
          <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
              {[{ id: 'following', label: `⭐ Siguiendo (${following?.length || 0})` }, { id: 'followers', label: `👥 Seguidores (${followers?.length || 0})` }].map(tab => (
                <button key={tab.id} onClick={() => setNetworkSubTab(tab.id)}
                  style={{ border: 'none', borderRadius: 10, padding: '10px 14px', color: '#fff', cursor: 'pointer', fontWeight: 700, background: networkSubTab === tab.id ? 'linear-gradient(135deg, #00A878, #007A57)' : 'rgba(255,255,255,0.08)' }}>
                  {tab.label}
                </button>
              ))}
            </div>
            {networkSubTab === 'following' && (
              <div style={{ display: 'grid', gap: 18 }}>
                {connectionsLoading ? <p style={{ color: '#ffffff66', textAlign: 'center', padding: 40 }}>⏳ Cargando...</p> : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                      {following?.slice(0, 6).map(u => <UserCard key={u.id} user={u} isFollowing={true} onUnfollow={() => handleUnfollowUser(u.id)} onOpenProfile={handleOpenProfile} />)}
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 16 }}>
                      <h3 style={{ margin: '0 0 12px 0', fontSize: 18 }}>📰 Publicaciones de quienes sigues</h3>
                      {followingPosts.length === 0 ? <p style={{ color: '#ffffff80', margin: 0 }}>Aún no hay publicaciones recientes.</p> : (
                        <div style={{ display: 'grid', gap: 10 }}>
                          {followingPosts.slice(0, 12).map(post => (
                            <div key={post.id} style={{ padding: 12, borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}>
                              <div style={{ fontSize: 12, color: '#ffffff99', marginBottom: 6 }}>{post.author?.firstName} {post.author?.lastName} · {post.author?.role}</div>
                              <div style={{ fontSize: 14, color: '#fff' }}>{post.content}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
            {networkSubTab === 'followers' && (
              <div style={{ display: 'grid', gap: 18 }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 16 }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: 18 }}>🎯 Recomendaciones por intereses</h3>
                  <p style={{ margin: '0 0 12px 0', color: '#ffffff99', fontSize: 13 }}>Perfiles sugeridos en base a tu actividad en FPConnect.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                    {recommendedByInterests.length === 0 && <p style={{ color: '#ffffff80' }}>No hay recomendaciones nuevas.</p>}
                    {recommendedByInterests.slice(0, 9).map(u => (
                      <UserCard key={u.id} user={u} isFollowing={!!following?.find(f => f.id === u.id)} onFollow={() => handleFollowUser(u.id)} onUnfollow={() => handleUnfollowUser(u.id)} onOpenProfile={handleOpenProfile} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* EXPLORE */}
        {!viewedProfileId && activeTab === 'explore' && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12 }}>
              {[{ id: 'centers', label: '🏫 Centros Educativos' }, { id: 'enterprises', label: '🏢 Empresas' }, { id: 'students', label: '👨‍🎓 Alumnos' }].map(sub => (
                <button key={sub.id} onClick={() => setExploreSubTab(sub.id)}
                  style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: exploreSubTab === sub.id ? 'linear-gradient(135deg, #00A878, #007A57)' : 'rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                  {sub.label}
                </button>
              ))}
            </div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12, color: '#ffffffb3', marginBottom: 10 }}>Filtro rápido por provincia</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['ALL', ...ANDALUCIA_PROVINCES].map(p => (
                  <button key={p} onClick={() => setExploreProvinceQuickFilter(p)}
                    style={{ padding: '7px 12px', borderRadius: 999, border: exploreProvinceQuickFilter === p ? '1px solid rgba(0,168,120,0.8)' : '1px solid rgba(255,255,255,0.18)', background: exploreProvinceQuickFilter === p ? 'rgba(0,168,120,0.2)' : 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: p === 'ALL' ? 600 : 400 }}>
                    {p === 'ALL' ? 'Todas' : p[0] + p.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {exploreSubTab === 'centers' && (
              <div>
                <h2 style={{ margin: '0 0 14px 0', fontSize: 22 }}>🏫 Centros de FP de Andalucia</h2>
                <div style={{ border: '1px solid rgba(0,168,120,0.35)', background: 'rgba(0,168,120,0.12)', borderRadius: 12, padding: 14, marginBottom: 18 }}>
                  <div style={{ fontSize: 12, color: '#ffffffaa', marginBottom: 4 }}>Mi centro vinculado</div>
                  {linkedCenter ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>✅ {linkedCenter.centerProfile?.centerName || `${linkedCenter.firstName} ${linkedCenter.lastName}`}</div>
                      <button onClick={handleUnlinkCenter} disabled={unlinkingCenter} style={{ border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.08)', color: '#fff', borderRadius: 8, padding: '6px 10px', fontSize: 12, cursor: unlinkingCenter ? 'default' : 'pointer' }}>
                        {unlinkingCenter ? 'Desvinculando...' : 'Desvincular'}
                      </button>
                    </div>
                  ) : <div style={{ fontSize: 14, color: '#ffffffcc' }}>Aun no has vinculado tu centro educativo</div>}
                </div>
                {linkError && <div style={{ color: '#ff9f9f', fontSize: 13, marginBottom: 14 }}>{linkError}</div>}
                <div style={{ marginBottom: 32 }}>
                  <input type="text" placeholder="Buscar centros..." value={centerQuery}
                    onChange={e => { setCenterQuery(e.target.value); search(e.target.value.trim() || 'all', 1, 50, 'CENTRO'); }}
                    style={{ width: '100%', maxWidth: 500, padding: '14px 18px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 14, fontFamily: 'inherit' }} />
                  <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                    {[{ key: 'ALL', label: 'Todos' }, { key: 'GM', label: 'Grado Medio' }, { key: 'GS', label: 'Grado Superior' }, { key: 'GE', label: 'Especializacion' }].map(item => (
                      <button key={item.key} onClick={() => setGradeFilter(item.key)}
                        style={{ padding: '8px 12px', borderRadius: 999, border: gradeFilter === item.key ? '1px solid rgba(0,168,120,0.8)' : '1px solid rgba(255,255,255,0.18)', background: gradeFilter === item.key ? 'rgba(0,168,120,0.2)' : 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 12, cursor: 'pointer' }}>
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <select value={provinceFilter} onChange={e => setProvinceFilter(e.target.value)}
                    style={{ marginTop: 12, width: '100%', maxWidth: 280, padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 12 }}>
                    <option value="ALL" style={{ color: '#111' }}>Todas las provincias</option>
                    {availableProvinces.map(p => <option key={p} value={p} style={{ color: '#111' }}>{p}</option>)}
                  </select>
                  <div style={{ marginTop: 10, fontSize: 12, color: '#ffffffb3' }}>Mostrando {filteredCenters.length} centros</div>
                </div>
                {searchLoading ? <p style={{ color: '#ffffff66', textAlign: 'center', padding: 40 }}>⏳ Buscando...</p> : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                    {filteredCenters.length === 0 && <p style={{ color: '#ffffff66', gridColumn: '1 / -1', textAlign: 'center', padding: 40 }}>🔍 No hay centros para el filtro seleccionado</p>}
                    {filteredCenters.map(su => {
                      const cicles = parseCicles(su.centerProfile?.cicles);
                      return (
                        <UserCard key={su.id} user={su} actions={false} onOpenProfile={handleOpenProfile}>
                          <div style={{ paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 'auto' }}>
                            <div style={{ fontSize: 12, color: '#ffffffcc', marginBottom: 6 }}>📍 {su.centerProfile?.city || 'Ciudad no indicada'}{su.centerProfile?.province ? `, ${su.centerProfile.province}` : ''}</div>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              {cicles.length > 0 ? cicles.map(c => <span key={c} style={{ fontSize: 11, padding: '4px 8px', borderRadius: 999, background: 'rgba(0,168,120,0.18)', border: '1px solid rgba(0,168,120,0.35)' }}>{c}</span>) : <span style={{ fontSize: 11, color: '#ffffff88' }}>Sin ciclos registrados</span>}
                            </div>
                            <button onClick={() => handleLinkToCenter(su)} disabled={linkingCenterId === su.id || linkedCenter?.id === su.id}
                              style={{ marginTop: 10, width: '100%', padding: '9px 10px', borderRadius: 8, border: 'none', background: linkedCenter?.id === su.id ? 'rgba(255,255,255,0.15)' : 'linear-gradient(135deg, #00A878, #007A57)', color: '#fff', cursor: linkingCenterId === su.id || linkedCenter?.id === su.id ? 'default' : 'pointer', fontWeight: 700, fontSize: 12 }}>
                              {linkedCenter?.id === su.id ? 'Centro vinculado' : linkingCenterId === su.id ? 'Vinculando...' : 'Vincularme a este centro'}
                            </button>
                            <button onClick={() => following?.find(u => u.id === su.id) ? handleUnfollowUser(su.id) : handleFollowUser(su.id)}
                              style={{ marginTop: 10, width: '100%', padding: '9px 10px', borderRadius: 8, border: 'none', background: following?.find(u => u.id === su.id) ? 'rgba(255,255,255,0.15)' : 'linear-gradient(135deg, #007a57, #004c36)', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>
                              {following?.find(u => u.id === su.id) ? '✓ Siguiendo' : '+ Seguir Centro'}
                            </button>
                          </div>
                        </UserCard>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {exploreSubTab === 'enterprises' && (
              <div>
                <h2 style={{ margin: '0 0 14px 0', fontSize: 22 }}>🏢 Empresas Colaboradoras</h2>
                <input type="text" placeholder="Buscar empresas..." value={enterpriseQuery}
                  onChange={e => { setEnterpriseQuery(e.target.value); search(e.target.value.trim() || 'all', 1, 50, 'EMPRESA'); }}
                  style={{ width: '100%', maxWidth: 500, padding: '14px 18px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 14, fontFamily: 'inherit', marginBottom: 24 }} />
                {searchLoading ? <p style={{ color: '#ffffff66', textAlign: 'center', padding: 40 }}>⏳ Buscando...</p> : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                    {filteredEnterprises.length === 0 && <p style={{ color: '#ffffff66', gridColumn: '1 / -1', textAlign: 'center', padding: 40 }}>🔍 No hay empresas disponibles</p>}
                    {filteredEnterprises.map(e => (
                      <UserCard key={e.id} user={e} actions={false} onOpenProfile={handleOpenProfile}>
                        <div style={{ paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 'auto' }}>
                          <div style={{ fontSize: 12, color: '#ffffffcc', marginBottom: 6 }}>🏭 {e.enterpriseProfile?.industry || 'Sector no indicado'}</div>
                          <div style={{ fontSize: 12, color: '#ffffffcc', marginBottom: 8 }}>📍 {e.enterpriseProfile?.city || 'Ciudad no indicada'}</div>
                          <button onClick={() => following?.find(u => u.id === e.id) ? handleUnfollowUser(e.id) : handleFollowUser(e.id)}
                            style={{ width: '100%', padding: '9px 10px', borderRadius: 8, border: 'none', background: following?.find(u => u.id === e.id) ? 'rgba(255,255,255,0.15)' : 'linear-gradient(135deg, #00A878, #007A57)', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>
                            {following?.find(u => u.id === e.id) ? '✓ Siguiendo' : '+ Seguir Empresa'}
                          </button>
                        </div>
                      </UserCard>
                    ))}
                  </div>
                )}
              </div>
            )}

            {exploreSubTab === 'students' && (
              <div>
                <h2 style={{ margin: '0 0 14px 0', fontSize: 22 }}>👨‍🎓 Conecta con Otros Alumnos</h2>
                <input type="text" placeholder="Buscar alumnos..." value={studentQuery}
                  onChange={e => { setStudentQuery(e.target.value); search(e.target.value.trim() || 'all', 1, 50, 'ALUMNO'); }}
                  style={{ width: '100%', maxWidth: 500, padding: '14px 18px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 14, fontFamily: 'inherit', marginBottom: 24 }} />
                {searchLoading ? <p style={{ color: '#ffffff66', textAlign: 'center', padding: 40 }}>⏳ Buscando...</p> : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                    {filteredStudents.length === 0 && <p style={{ color: '#ffffff66', gridColumn: '1 / -1', textAlign: 'center', padding: 40 }}>🔍 No hay alumnos disponibles</p>}
                    {filteredStudents.map(s => (
                      <UserCard key={s.id} user={s} actions={false} onOpenProfile={handleOpenProfile}>
                        <div style={{ paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 'auto' }}>
                          <div style={{ fontSize: 12, color: '#ffffffcc', marginBottom: 6 }}>📚 {s.studentProfile?.cicle || 'Ciclo no indicado'}</div>
                          <div style={{ fontSize: 12, color: '#ffffffcc', marginBottom: 8 }}>📍 {s.location || 'Ubicación no indicada'}</div>
                          <button onClick={() => following?.find(u => u.id === s.id) ? handleUnfollowUser(s.id) : handleFollowUser(s.id)}
                            style={{ width: '100%', padding: '9px 10px', borderRadius: 8, border: 'none', background: following?.find(u => u.id === s.id) ? 'rgba(255,255,255,0.15)' : 'linear-gradient(135deg, #00A878, #007A57)', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>
                            {following?.find(u => u.id === s.id) ? '✓ Siguiendo' : '+ Seguir Alumno'}
                          </button>
                        </div>
                      </UserCard>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* OFERTAS */}
        {!viewedProfileId && activeTab === 'offers' && (
          <div>
            <h2 style={{ margin: '0 0 8px', fontSize: 24 }}>💼 Ofertas de Empleo y Prácticas</h2>
            <p style={{ color: '#ffffff99', fontSize: 13, marginBottom: 24 }}>Oportunidades publicadas por empresas para alumnos de FP</p>
            {offersLoading ? <p style={{ color: '#ffffff66', textAlign: 'center', padding: 40 }}>⏳ Cargando ofertas...</p> :
              offers.length === 0 ? <p style={{ color: '#ffffff66', textAlign: 'center', padding: 40 }}>📭 No hay ofertas disponibles por ahora</p> : (
                <div style={{ display: 'grid', gap: 16 }}>
                  {offers.map(offer => {
                    const application = offer.applications?.[0] || applications.find(item => item.jobOfferId === offer.id);
                    return (
                      <div key={offer.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                        {/* Imagen de la oferta */}
                        <div style={{ position: 'relative', height: 120, overflow: 'hidden' }}>
                          <img src={getOfferImage(offer.type)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,10,8,0.8) 0%, rgba(0,0,0,0.3) 100%)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
                            <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 999, background: 'rgba(0,168,120,0.8)', color: '#fff', fontWeight: 700 }}>{offer.type}</span>
                            {offer.location && <span style={{ fontSize: 12, color: '#ffffffcc' }}>📍 {offer.location}</span>}
                            {offer.salary && <span style={{ fontSize: 12, color: '#ffffffcc' }}>💰 {offer.salary}</span>}
                          </div>
                        </div>
                        <div style={{ padding: 24 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div>
                              <h3 style={{ margin: '0 0 6px', fontSize: 20 }}>{offer.title}</h3>
                              <span style={{ fontSize: 12, color: '#ffffff66' }}>🏢 {offer.enterprise?.user?.firstName} {offer.enterprise?.user?.lastName} · {new Date(offer.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <p style={{ margin: '0 0 18px', color: '#ffffffcc', fontSize: 14, lineHeight: 1.6 }}>{offer.description}</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                            {application ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ color: '#ffffff99', fontSize: 13 }}>Estado:</span>
                                <ApplicationBadge status={application.status} />
                              </div>
                            ) : <span style={{ color: '#ffffff80', fontSize: 13 }}>Aun no has aplicado.</span>}
                            <button onClick={() => handleApplyOffer(offer.id)} disabled={!!application || applyingOfferId === offer.id}
                              className="fp-button" style={{ opacity: application ? 0.65 : 1, cursor: application ? 'default' : 'pointer' }}>
                              {application ? 'Aplicacion enviada' : applyingOfferId === offer.id ? 'Enviando...' : 'Aplicar'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
          </div>
        )}

        {/* MIS APLICACIONES */}
        {!viewedProfileId && activeTab === 'applications' && (
          <div>
            <h2 style={{ margin: '0 0 8px', fontSize: 24 }}>Mis Aplicaciones</h2>
            <p style={{ color: '#ffffff99', fontSize: 13, marginBottom: 24 }}>Seguimiento de tus candidaturas enviadas a empresas.</p>
            {applications.length === 0 ? (
              <p style={{ color: '#ffffff66', textAlign: 'center', padding: 40 }}>Todavia no has aplicado a ninguna oferta.</p>
            ) : (
              <div style={{ display: 'grid', gap: 14 }}>
                {applications.map(application => (
                  <article key={application.id} style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 18, display: 'grid', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      <div>
                        <h3 style={{ margin: '0 0 6px', fontSize: 18 }}>{application.jobOffer?.title}</h3>
                        <div style={{ color: '#ffffff99', fontSize: 13 }}>{application.jobOffer?.enterprise?.user?.firstName} {application.jobOffer?.enterprise?.user?.lastName}{application.jobOffer?.location ? ` · ${application.jobOffer.location}` : ''}</div>
                      </div>
                      <ApplicationBadge status={application.status} />
                    </div>
                    <div style={{ color: '#ffffff80', fontSize: 12 }}>Enviada el {new Date(application.appliedAt).toLocaleDateString()}</div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* NOTICIAS */}
        {!viewedProfileId && activeTab === 'news' && (
          <div>
            <h2 style={{ margin: '0 0 12px 0', fontSize: 24 }}>📰 Noticias FP</h2>
            <p style={{ margin: '0 0 22px 0', color: '#ffffff99', fontSize: 14 }}>Becas, convocatorias y oportunidades para alumnado de Formacion Profesional.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
              {FP_NEWS_ITEMS.map(item => (
                <article key={item.id} style={{ borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                  {/* Imagen de la noticia */}
                  <div style={{ position: 'relative', height: 140, overflow: 'hidden' }}>
                    <img src={item.img} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.7) 100%)' }} />
                    <span style={{ position: 'absolute', bottom: 10, left: 12, fontSize: 11, borderRadius: 999, padding: '4px 9px', background: 'rgba(0,168,120,0.9)', color: '#fff', fontWeight: 700 }}>{item.category}</span>
                  </div>
                  <div style={{ padding: 16, display: 'grid', gap: 10 }}>
                    <div style={{ color: '#ffffff88', fontSize: 12 }}>{item.source}</div>
                    <h3 style={{ margin: 0, fontSize: 16, lineHeight: 1.4 }}>{item.title}</h3>
                    <p style={{ margin: 0, color: '#ffffffcc', fontSize: 13, lineHeight: 1.5 }}>{item.summary}</p>
                    <div style={{ color: '#ffffffa8', fontSize: 12 }}>{item.deadline}</div>
                    <a href={item.url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: '1px solid rgba(255,255,255,0.24)', color: '#fff', padding: '8px 12px', textDecoration: 'none', fontWeight: 600, width: 'fit-content', fontSize: 13 }}>
                      Ver convocatoria →
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* PERFIL */}
        {!viewedProfileId && activeTab === 'profile' && (
          <ProfileEditor user={authUser} role="ALUMNO" />
        )}

      </div>
    </div>
  );
}