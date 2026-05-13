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
  ACCEPTED: ['rgba(34,197,94,0.25)', 'rgba(34,197,94,0.6)', '#4ade80'],
  REJECTED: ['rgba(239,68,68,0.18)', 'rgba(239,68,68,0.45)', '#fecaca'],
};

const ApplicationBadge = ({ status }) => {
  const colors = APPLICATION_COLORS[status] || APPLICATION_COLORS.PENDING;
  return <span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 999, background: colors[0], border: `1px solid ${colors[1]}`, color: colors[2], fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{APPLICATION_LABELS[status] || status}</span>;
};

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
    <div className="fp-app-shell" style={{ 
      background: 'radial-gradient(circle at top right, #002d20 0%, #000c0a 100%)',
      minHeight: '100vh',
      animation: 'fadeIn 0.5s ease-out'
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseGlow { 0% { box-shadow: 0 0 5px rgba(0,168,120,0.2); } 50% { box-shadow: 0 0 20px rgba(0,168,120,0.4); } 100% { box-shadow: 0 0 5px rgba(0,168,120,0.2); } }
        .fp-card-animated { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .fp-card-animated:hover { transform: translateY(-5px); background: rgba(255,255,255,0.08) !important; box-shadow: 0 10px 20px rgba(0,0,0,0.3); }
        .fp-tab { transition: all 0.2s ease; border-radius: 8px !important; margin: 0 4px; }
        .fp-tab.is-active { background: rgba(0,168,120,0.2) !important; color: #00ffb7 !important; border-bottom: 2px solid #00ffb7 !important; }
      `}</style>

      <nav className="fp-topbar" style={{ backdropFilter: 'blur(10px)', background: 'rgba(0,15,10,0.8)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="fp-topbar__left">
          <div className="fp-brand" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('feed')}>
            <span className="fp-brand__mark" style={{ background: 'linear-gradient(135deg, #00ffb7, #00A878)', boxShadow: '0 0 15px rgba(0,255,183,0.3)' }}>FP</span>
            <span style={{ letterSpacing: '1px' }}>FP<span className="fp-brand__accent" style={{ color: '#00ffb7' }}>Connect</span></span>
          </div>
          <div className="fp-tabs">
            {[
              { id: 'feed', label: 'Inicio' },
              { id: 'network', label: 'Red' },
              { id: 'explore', label: 'Explorar' },
              { id: 'offers', label: 'Empleo' },
              { id: 'applications', label: 'Mis Candidaturas' },
              { id: 'news', label: 'Noticias' },
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
          <div style={{ textAlign: 'right', marginRight: 15 }}>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: 13 }}>{authUser?.firstName} {authUser?.lastName}</div>
            <div style={{ color: '#00ffb7', fontSize: 10, textTransform: 'uppercase', fontWeight: 800 }}>Estudiante</div>
          </div>
          <NotificationsBell user={authUser} />
          <MessagesPanel user={authUser} />
          <button onClick={handleLogout} className="fp-button" style={{ background: 'rgba(239,68,68,0.15)', color: '#ff6b6b', border: '1px solid rgba(239,68,68,0.3)', marginLeft: 10 }}>Salir</button>
        </div>
      </nav>

      <div className="fp-content" style={{ animation: 'fadeIn 0.6s ease-out' }}>

        {/* FEED */}
        {viewedProfileId ? (
          <PublicProfileView userId={viewedProfileId} onBack={() => setViewedProfileId(null)}
            isFollowing={isViewedProfileFollowing} onFollow={handleFollowUser} onUnfollow={handleUnfollowUser} />
        ) : activeTab === 'feed' && (
          <div className="fp-feed-layout">
            <div>
              <div style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 24, position: 'relative', height: 180, boxShadow: '0 10px 30px rgba(0,0,0,0.4)', animation: 'pulseGlow 4s infinite' }}>
                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80" alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,20,15,0.9) 0%, rgba(0,40,30,0.2) 100%)', display: 'flex', alignItems: 'center', padding: '0 40px' }}>
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 6, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>¡Hola de nuevo, {authUser?.firstName}! 👋</div>
                    <div style={{ fontSize: 16, color: '#00ffb7', fontWeight: 500 }}>Tu futuro profesional empieza hoy en FPConnect.</div>
                  </div>
                </div>
              </div>
              {feedLoading ? (
                <div style={{ textAlign: 'center', padding: 60 }}>
                  <div className="spinner" style={{ border: '3px solid rgba(0,255,183,0.1)', borderTop: '3px solid #00ffb7', borderRadius: '50%', width: 40, height: 40, animation: 'spin 1s linear infinite', margin: '0 auto 15px' }} />
                  <p style={{ color: '#ffffff66', fontSize: 14 }}>Sincronizando tu feed...</p>
                </div>
              ) : (
                <Feed recommendations={recommendations} following={following} onFollow={handleFollowUser} onUnfollow={handleUnfollowUser} onOpenProfile={handleOpenProfile} />
              )}
            </div>
            <aside className="fp-sidebar fp-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20 }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: 16, fontWeight: 800, color: '#00ffb7', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>✨</span> Sugerencias
              </h3>
              {connectionsLoading ? <p style={{ color: '#ffffff44', fontSize: 12 }}>Buscando conexiones...</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {recommendations?.length === 0 ? <p style={{ color: '#ffffff66', fontSize: 12, textAlign: 'center' }}>No hay perfiles nuevos hoy</p> : (
                    recommendations?.slice(0, 5).map(rec => (
                      <div key={rec.id} className="fp-card-animated" style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 15, border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(rec.firstName + ' ' + rec.lastName)}&background=00ffb7&color=002d20&size=40&bold=true&rounded=true`} alt="" style={{ width: 38, height: 38, borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{rec.firstName} {rec.lastName}</div>
                            <div style={{ fontSize: 11, color: '#ffffff66' }}>{rec.role}</div>
                          </div>
                        </div>
                        <button onClick={() => following?.find(u => u.id === rec.id) ? handleUnfollowUser(rec.id) : handleFollowUser(rec.id)}
                          style={{ 
                            width: '100%', padding: '8px', borderRadius: 8, border: 'none', 
                            background: following?.find(u => u.id === rec.id) ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #00A878, #00d196)', 
                            color: '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 700, transition: '0.3s' 
                          }}>
                          {following?.find(u => u.id === rec.id) ? '✓ Siguiendo' : '+ Conectar'}
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
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 25 }}>
              {[{ id: 'following', label: `Siguiendo`, count: following?.length }, { id: 'followers', label: `Seguidores`, count: followers?.length }].map(tab => (
                <button key={tab.id} onClick={() => setNetworkSubTab(tab.id)}
                  style={{ 
                    border: 'none', borderRadius: 12, padding: '12px 20px', color: '#fff', cursor: 'pointer', fontWeight: 700, 
                    background: networkSubTab === tab.id ? 'linear-gradient(135deg, #00ffb7, #00A878)' : 'rgba(255,255,255,0.05)',
                    color: networkSubTab === tab.id ? '#002d20' : '#fff', transition: '0.3s', boxShadow: networkSubTab === tab.id ? '0 5px 15px rgba(0,255,183,0.2)' : 'none'
                  }}>
                  {tab.label} <span style={{ opacity: 0.6, fontSize: 12, marginLeft: 5 }}>{tab.count || 0}</span>
                </button>
              ))}
            </div>
            {networkSubTab === 'following' && (
              <div style={{ display: 'grid', gap: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 15 }}>
                  {following?.slice(0, 6).map(u => <UserCard key={u.id} user={u} isFollowing={true} onUnfollow={() => handleUnfollowUser(u.id)} onOpenProfile={handleOpenProfile} />)}
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 25 }}>
                  <h3 style={{ margin: '0 0 20px 0', fontSize: 18, color: '#00ffb7' }}>📰 Actividad Reciente</h3>
                  {followingPosts.length === 0 ? <p style={{ color: '#ffffff44', textAlign: 'center', padding: 20 }}>Tus conexiones aún no han publicado nada.</p> : (
                    <div style={{ display: 'grid', gap: 15 }}>
                      {followingPosts.slice(0, 8).map(post => (
                        <div key={post.id} className="fp-card-animated" style={{ padding: 18, borderRadius: 15, border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
                          <div style={{ fontSize: 12, color: '#00ffb7', fontWeight: 700, marginBottom: 8 }}>{post.author?.firstName} {post.author?.lastName}</div>
                          <div style={{ fontSize: 14, color: '#ffffffcc', lineHeight: 1.5 }}>{post.content}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            {networkSubTab === 'followers' && (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 25 }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: 18, color: '#00ffb7' }}>🎯 Sugerencias para ti</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 15 }}>
                  {recommendedByInterests.map(u => (
                    <UserCard key={u.id} user={u} isFollowing={false} onFollow={() => handleFollowUser(u.id)} onOpenProfile={handleOpenProfile} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* EXPLORE */}
        {!viewedProfileId && activeTab === 'explore' && (
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 30, background: 'rgba(255,255,255,0.03)', padding: 8, borderRadius: 15, width: 'fit-content' }}>
              {[{ id: 'centers', label: '🏫 Centros' }, { id: 'enterprises', label: '🏢 Empresas' }, { id: 'students', label: '👨‍🎓 Alumnos' }].map(sub => (
                <button key={sub.id} onClick={() => setExploreSubTab(sub.id)}
                  style={{ 
                    padding: '10px 20px', borderRadius: 10, border: 'none', 
                    background: exploreSubTab === sub.id ? '#00ffb7' : 'transparent', 
                    color: exploreSubTab === sub.id ? '#002d20' : '#ffffff88', 
                    cursor: 'pointer', fontWeight: 700, transition: '0.3s' 
                  }}>
                  {sub.label}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: 30, background: 'rgba(0,0,0,0.2)', padding: 20, borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 12, color: '#00ffb7', fontWeight: 800, textTransform: 'uppercase', marginBottom: 15, letterSpacing: '1px' }}>Filtro por Provincia</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['ALL', ...ANDALUCIA_PROVINCES].map(p => (
                  <button key={p} onClick={() => setExploreProvinceQuickFilter(p)}
                    style={{ 
                      padding: '8px 16px', borderRadius: 999, border: '1px solid',
                      borderColor: exploreProvinceQuickFilter === p ? '#00ffb7' : 'rgba(255,255,255,0.1)', 
                      background: exploreProvinceQuickFilter === p ? 'rgba(0,255,183,0.1)' : 'rgba(255,255,255,0.03)', 
                      color: exploreProvinceQuickFilter === p ? '#00ffb7' : '#ffffff88', 
                      cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: '0.2s'
                    }}>
                    {p === 'ALL' ? 'Todas' : p.charAt(0) + p.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {exploreSubTab === 'centers' && (
              <div>
                <div style={{ background: 'linear-gradient(135deg, rgba(0,168,120,0.2), rgba(0,255,183,0.05))', border: '1px solid rgba(0,255,183,0.2)', borderRadius: 20, padding: 20, marginBottom: 25, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#00ffb7', fontWeight: 800, marginBottom: 4 }}>MI CENTRO ACTUAL</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>
                      {linkedCenter ? `✅ ${linkedCenter.centerProfile?.centerName || linkedCenter.firstName}` : 'Aún no has vinculado tu centro'}
                    </div>
                  </div>
                  {linkedCenter && (
                    <button onClick={handleUnlinkCenter} disabled={unlinkingCenter} style={{ background: 'rgba(255,107,107,0.1)', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)', padding: '8px 15px', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                      {unlinkingCenter ? '...' : 'Desvincular'}
                    </button>
                  )}
                </div>
                
                <input type="text" placeholder="🔍 Buscar por nombre de centro o ciclo..." value={centerQuery}
                  onChange={e => { setCenterQuery(e.target.value); search(e.target.value.trim() || 'all', 1, 50, 'CENTRO'); }}
                  style={{ width: '100%', padding: '16px 25px', borderRadius: 15, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 15, marginBottom: 25, boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)' }} />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                  {filteredCenters.map(su => (
                    <div key={su.id} className="fp-card-animated" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', padding: 20, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', gap: 15, marginBottom: 15 }}>
                         <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(su.centerProfile?.centerName || su.firstName)}&background=00A878&color=fff&size=50&bold=true&rounded=true`} style={{ width: 50, height: 50, borderRadius: 12 }} />
                         <div>
                            <h4 style={{ margin: 0, fontSize: 16, color: '#fff' }}>{su.centerProfile?.centerName || su.firstName}</h4>
                            <div style={{ fontSize: 12, color: '#00ffb7' }}>{su.centerProfile?.province}</div>
                         </div>
                      </div>
                      <div style={{ flex: 1, marginBottom: 15 }}>
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          {parseCicles(su.centerProfile?.cicles).slice(0, 3).map(c => (
                            <span key={c} style={{ fontSize: 10, padding: '3px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: 5, color: '#ffffff88' }}>{c}</span>
                          ))}
                        </div>
                      </div>
                      <button onClick={() => handleLinkToCenter(su)} disabled={linkedCenter?.id === su.id}
                        style={{ width: '100%', padding: '10px', borderRadius: 10, background: linkedCenter?.id === su.id ? 'rgba(0,255,183,0.1)' : '#00ffb7', color: linkedCenter?.id === su.id ? '#00ffb7' : '#002d20', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                        {linkedCenter?.id === su.id ? 'Centro Vinculado' : 'Vincularme'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Render similar para Enterprises y Students usando el mismo estilo visual */}
            {(exploreSubTab === 'enterprises' || exploreSubTab === 'students') && (
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                  {(exploreSubTab === 'enterprises' ? filteredEnterprises : filteredStudents).map(item => (
                    <UserCard key={item.id} user={item} onOpenProfile={handleOpenProfile} />
                  ))}
               </div>
            )}
          </div>
        )}

        {/* OFERTAS CON DISEÑO DE CARDS MODERNAS */}
        {!viewedProfileId && activeTab === 'offers' && (
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ marginBottom: 30 }}>
              <h2 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: '#fff' }}>Oportunidades <span style={{ color: '#00ffb7' }}>Laborales</span></h2>
              <p style={{ color: '#ffffff66', marginTop: 5 }}>Encuentra prácticas y empleo adaptados a tu perfil de FP.</p>
            </div>
            {offersLoading ? <div style={{ textAlign: 'center', padding: 50 }}><div className="spinner" /></div> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 25 }}>
                {offers.map(offer => {
                  const application = offer.applications?.[0] || applications.find(item => item.jobOfferId === offer.id);
                  return (
                    <article key={offer.id} className="fp-card-animated" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 25, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ height: 140, position: 'relative' }}>
                        <img src={getOfferImage(offer.type)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', top: 15, right: 15 }}>
                           <span style={{ padding: '5px 12px', borderRadius: 10, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', color: '#00ffb7', fontSize: 11, fontWeight: 800, border: '1px solid rgba(0,255,183,0.3)' }}>{offer.type}</span>
                        </div>
                      </div>
                      <div style={{ padding: 25, flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: 19, color: '#fff', fontWeight: 800 }}>{offer.title}</h3>
                        <div style={{ fontSize: 13, color: '#ffffff66', marginBottom: 15, display: 'flex', alignItems: 'center', gap: 5 }}>
                           <span>🏢</span> {offer.enterprise?.user?.firstName || 'Empresa'} • 📍 {offer.location || 'Remoto'}
                        </div>
                        <p style={{ fontSize: 14, color: '#ffffffaa', lineHeight: 1.6, marginBottom: 20, flex: 1 }}>{offer.description?.substring(0, 120)}...</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          {application ? <ApplicationBadge status={application.status} /> : <div style={{ width: 10 }} />}
                          <button onClick={() => handleApplyOffer(offer.id)} disabled={!!application}
                            style={{ 
                              padding: '10px 25px', borderRadius: 12, border: 'none', 
                              background: application ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #00A878, #00ffb7)', 
                              color: application ? '#ffffff44' : '#002d20', fontWeight: 800, cursor: application ? 'default' : 'pointer', transition: '0.3s'
                            }}>
                            {application ? 'Inscrito' : 'Inscribirme'}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* NOTICIAS CON EFECTO NEWS-FEED */}
        {!viewedProfileId && activeTab === 'news' && (
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h2 style={{ marginBottom: 25, fontSize: 26, fontWeight: 900 }}>📰 Boletín de <span style={{ color: '#00ffb7' }}>FP Andalucía</span></h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
              {FP_NEWS_ITEMS.map(item => (
                <article key={item.id} className="fp-card-animated" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <img src={item.img} style={{ width: '100%', height: 150, objectFit: 'cover', opacity: 0.8 }} />
                  <div style={{ padding: 20 }}>
                    <div style={{ fontSize: 10, color: '#00ffb7', fontWeight: 800, marginBottom: 8, textTransform: 'uppercase' }}>{item.category}</div>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: 16, lineHeight: 1.4, color: '#fff' }}>{item.title}</h3>
                    <p style={{ fontSize: 13, color: '#ffffff88', marginBottom: 20 }}>{item.summary}</p>
                    <a href={item.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#00ffb7', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                      Leer más <span>→</span>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* PERFIL */}
        {!viewedProfileId && activeTab === 'profile' && (
          <div style={{ maxWidth: 800, margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>
            <ProfileEditor user={authUser} role="ALUMNO" />
          </div>
        )}

      </div>
    </div>
  );
}