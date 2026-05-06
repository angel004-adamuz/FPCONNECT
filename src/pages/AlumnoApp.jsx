import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { useFeed, useConnections, useUserSearch } from '../hooks';
import Feed from '../components/Feed';
import UserCard from '../components/UserCard';
import PublicProfileView from '../components/PublicProfileView';
import { usersService } from '../services';
import ProfileEditor from '../components/ProfileEditor';

const ANDALUCIA_PROVINCES = [
  'ALMERIA',
  'CADIZ',
  'CORDOBA',
  'GRANADA',
  'HUELVA',
  'JAEN',
  'MALAGA',
  'SEVILLA',
];

const FP_NEWS_ITEMS = [
  {
    id: 'mec-2026',
    title: 'Becas MEC 2026/2027 para estudios postobligatorios',
    category: 'Becas',
    summary: 'Ayudas para estudiantes de FP Grado Medio y Superior. Incluye cuantia fija y variable segun renta y rendimiento.',
    deadline: 'Plazo estimado: mayo-junio',
    source: 'Ministerio de Educacion y FP',
    url: 'https://www.becaseducacion.gob.es/',
  },
  {
    id: 'fse-plus-andalucia',
    title: 'Programas de empleabilidad juvenil vinculados a FP en Andalucia',
    category: 'Convocatorias',
    summary: 'Iniciativas cofinanciadas para mejorar la insercion laboral de alumnado de FP con practicas y formacion complementaria.',
    deadline: 'Convocatorias durante el curso',
    source: 'Junta de Andalucia',
    url: 'https://www.juntadeandalucia.es/temas/estudiar/becas.html',
  },
  {
    id: 'erasmus-fp',
    title: 'Movilidad Erasmus+ para alumnado de FP',
    category: 'Internacional',
    summary: 'Opciones para realizar practicas en empresas europeas con apoyo economico para viaje y estancia.',
    deadline: 'Depende del centro educativo',
    source: 'SEPIE - Erasmus+',
    url: 'https://www.sepie.es/',
  },
  {
    id: 'andalucia-dual',
    title: 'Nuevas plazas de FP Dual en sectores tecnologicos',
    category: 'FP Dual',
    summary: 'Incremento de plazas en colaboracion con empresas andaluzas para DAM, DAW, ASIR y especializaciones digitales.',
    deadline: 'Apertura por centro',
    source: 'Portal de FP Andalucia',
    url: 'https://www.juntadeandalucia.es/educacion/portals/web/formacion-profesional-andaluza',
  },
  {
    id: 'aula-emprendimiento',
    title: 'Aulas de emprendimiento y ayudas para proyectos de FP',
    category: 'Emprendimiento',
    summary: 'Convocatorias para prototipos y proyectos innovadores desarrollados por alumnado de ciclos formativos.',
    deadline: 'Revision trimestral',
    source: 'TodoFP',
    url: 'https://todofp.es/',
  },
];

const normalizeText = (value = '') => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toUpperCase();

export default function AlumnoApp() {
  const { user: authUser, logout } = useAuthStore();
  const { showToast } = useUIStore();
  const [activeTab, setActiveTab] = useState('feed');
  const [viewedProfileId, setViewedProfileId] = useState(null);
  const [networkSubTab, setNetworkSubTab] = useState('following');
  const [exploreSubTab, setExploreSubTab] = useState('centers'); // centers, enterprises, students
  const [exploreProvinceQuickFilter, setExploreProvinceQuickFilter] = useState('ALL');
  
  // Búsqueda para Centros
  const [centerQuery, setCenterQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('ALL');
  const [provinceFilter, setProvinceFilter] = useState('ALL');
  const [linkedCenter, setLinkedCenter] = useState(null);
  const [linkingCenterId, setLinkingCenterId] = useState('');
  const [unlinkingCenter, setUnlinkingCenter] = useState(false);
  const [linkError, setLinkError] = useState('');

  // Búsqueda para Empresas
  const [enterpriseQuery, setEnterpriseQuery] = useState('');
  const [enterpriseIndustryFilter, setEnterpriseIndustryFilter] = useState('ALL');

  // Búsqueda para Alumnos
  const [studentQuery, setStudentQuery] = useState('');
  const [studentCicleFilter, setStudentCicleFilter] = useState('ALL');

  const { posts, loadFeed, loading: feedLoading } = useFeed();
  const {
    followers,
    following,
    recommendations,
    loadFollowers,
    loadFollowing,
    loadRecommendations,
    followUser,
    unfollowUser,
    loading: connectionsLoading,
  } = useConnections();
  const { results: searchResults, search, loading: searchLoading } = useUserSearch();

  const parseCicles = (rawCicles) => {
    if (!rawCicles) return [];
    if (Array.isArray(rawCicles)) return rawCicles;
    try {
      return JSON.parse(rawCicles);
    } catch {
      return [];
    }
  };

  const getGradeType = (cicle) => {
    const value = (cicle || '').toUpperCase();
    if (value.startsWith('GM:')) return 'GM';
    if (value.startsWith('GS:')) return 'GS';
    if (value.startsWith('GE:')) return 'GE';

    const gradosMedios = ['SMR', 'GESTION ADMINISTRATIVA', 'MICROINFORMATICOS'];
    const gradosSuperiores = ['DAM', 'DAW', 'ASIR', 'DESARROLLO'];
    const especializacion = ['BIG DATA', 'CIBERSEGURIDAD', 'IA', 'INTELIGENCIA ARTIFICIAL', 'ESPECIALIZACION'];

    if (gradosMedios.some((token) => value.includes(token))) return 'GM';
    if (gradosSuperiores.some((token) => value.includes(token))) return 'GS';
    if (especializacion.some((token) => value.includes(token))) return 'GE';
    return 'OTHER';
  };

  const centerMatchesFilter = (center) => {
    const cicles = parseCicles(center.centerProfile?.cicles);
    const matchesGrade = gradeFilter === 'ALL' || cicles.some((cicle) => getGradeType(cicle) === gradeFilter);
    const centerProvince = normalizeText(center.centerProfile?.province || '');
    const matchesProvince = provinceFilter === 'ALL' || centerProvince === provinceFilter;
    const matchesQuickProvince = exploreProvinceQuickFilter === 'ALL' || centerProvince === exploreProvinceQuickFilter;
    return matchesGrade && matchesProvince && matchesQuickProvince;
  };

  const matchesQuickProvinceFromText = (value) => {
    if (exploreProvinceQuickFilter === 'ALL') return true;
    const normalizedValue = normalizeText(value || '');
    return normalizedValue.includes(exploreProvinceQuickFilter);
  };

  const filteredCenters = (searchResults || [])
    .filter((user) => user.role === 'CENTRO')
    .filter(centerMatchesFilter);

  const filteredEnterprises = (searchResults || [])
    .filter((user) => user.role === 'EMPRESA')
    .filter((user) => {
      const provinceOrCity = user.enterpriseProfile?.province || user.enterpriseProfile?.city || user.location || '';
      return matchesQuickProvinceFromText(provinceOrCity);
    });

  const filteredStudents = (searchResults || [])
    .filter((user) => user.role === 'ALUMNO')
    .filter((user) => matchesQuickProvinceFromText(user.location || ''));

  const availableProvinces = Array.from(
    new Set(
      (searchResults || [])
        .filter((user) => user.role === 'CENTRO')
        .map((user) => user.centerProfile?.province)
        .filter(Boolean)
        .map((province) => normalizeText(province))
    )
  ).sort();

  const getUserRoleLabel = (role) => {
    if (role === 'ALUMNO') return 'alumno';
    if (role === 'CENTRO') return 'centro educativo';
    if (role === 'EMPRESA') return 'empresa';
    return 'perfil';
  };

  const resolveUserRoleById = (userId) => {
    const knownUsers = [
      ...(followers || []),
      ...(following || []),
      ...(recommendations || []),
      ...(searchResults || []),
    ];
    return knownUsers.find((candidate) => candidate?.id === userId)?.role;
  };

  const loadLinkedCenter = async () => {
    try {
      const response = await usersService.getMyLinkedCenter();
      setLinkedCenter(response.data || null);
    } catch {
      setLinkedCenter(null);
    }
  };

  useEffect(() => {
    if (activeTab === 'feed') {
      loadFeed();
      loadRecommendations();
      loadFollowing(1, 200);
    } else if (activeTab === 'network') {
      loadFollowers();
      loadFollowing(1, 200);
      loadRecommendations();
      loadFeed();
    } else if (activeTab === 'explore') {
      loadRecommendations();
      loadFollowing(1, 200);
      // Cargar contenido de la pestaña actual
      if (exploreSubTab === 'centers') {
        search(centerQuery.trim() || 'all', 1, 50, 'CENTRO');
      } else if (exploreSubTab === 'enterprises') {
        search(enterpriseQuery.trim() || 'all', 1, 50, 'EMPRESA');
      } else if (exploreSubTab === 'students') {
        search(studentQuery.trim() || 'all', 1, 50, 'ALUMNO');
      }
      loadLinkedCenter();
    }
  }, [activeTab, exploreSubTab, loadFeed, loadFollowers, loadFollowing, loadRecommendations, search]);

  useEffect(() => {
    loadLinkedCenter();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const handleFollowUser = async (userId) => {
    try {
      await followUser(userId);
      const role = resolveUserRoleById(userId);
      showToast(`Ahora sigues a este ${getUserRoleLabel(role)}`, 'success');
    } catch (err) {
      showToast(err.message || 'No se pudo seguir al usuario', 'error');
    }
  };

  const handleUnfollowUser = async (userId) => {
    try {
      await unfollowUser(userId);
      const role = resolveUserRoleById(userId);
      showToast(`Has dejado de seguir este ${getUserRoleLabel(role)}`, 'success');
      if (linkedCenter?.id === userId) {
        setLinkedCenter(null);
      }
    } catch (err) {
      showToast(err.message || 'No se pudo dejar de seguir', 'error');
    }
  };

  const handleLinkToCenter = async (center) => {
    setLinkingCenterId(center.id);
    setLinkError('');
    try {
      const response = await usersService.linkMeToCenter(center.id);
      setLinkedCenter(response.data);
      await loadFollowing(1, 200);
      await loadRecommendations();
    } catch (err) {
      setLinkError(err.message || 'No se pudo vincular el centro');
    } finally {
      setLinkingCenterId('');
    }
  };

  const handleUnlinkCenter = async () => {
    setUnlinkingCenter(true);
    setLinkError('');
    try {
      await usersService.unlinkMeFromCenter();
      setLinkedCenter(null);
      await loadFollowing(1, 200);
      await loadRecommendations();
    } catch (err) {
      setLinkError(err.message || 'No se pudo desvincular el centro');
    } finally {
      setUnlinkingCenter(false);
    }
  };

  const handleOpenProfile = async (userId) => {
    setViewedProfileId(userId);
    try {
      await loadFollowing(1, 200);
    } catch {
      // Keep opening profile even if follows refresh fails.
    }
  };

  const isViewedProfileFollowing = viewedProfileId
    ? !!following?.find((connectedUser) => connectedUser.id === viewedProfileId)
    : false;

  const followingIds = new Set((following || []).map((connectedUser) => connectedUser.id));
  const followingPosts = (posts || []).filter((post) => followingIds.has(post.author?.id));
  const recommendedByInterests = (recommendations || []).filter((user) => !followingIds.has(user.id));

  return (
    <div className="fp-app-shell">
      {/* TOP NAV */}
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
              { id: 'news', label: 'Noticias FP' },
              { id: 'profile', label: 'Mi Perfil' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setViewedProfileId(null);
                  setActiveTab(tab.id);
                }}
                className={`fp-tab ${activeTab === tab.id ? 'is-active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="fp-topbar__right">
  {activeTab === 'profile' && (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent('fp-edit-profile'))}
      style={{
        padding: '8px 16px',
        borderRadius: 10,
        border: 'none',
        background: 'linear-gradient(135deg, #00A878, #007A57)',
        color: '#fff',
        fontWeight: 700,
        cursor: 'pointer',
        fontSize: 13,
      }}
    >
      ✏️ Editar perfil
    </button>
  )}
  <div style={{ textAlign: 'right', fontSize: 12 }}>
    <div style={{ fontWeight: 600 }}>{authUser?.firstName} {authUser?.lastName}</div>
    <div style={{ color: 'var(--fp-muted)' }}>Alumno</div>
  </div>
  <button onClick={handleLogout} className="fp-button fp-button--danger">Salir</button>
</div>
      </nav>

      {/* CONTENT */}
      <div className="fp-content">
        {/* FEED TAB */}
        {viewedProfileId ? (
          <PublicProfileView
            userId={viewedProfileId}
            onBack={() => setViewedProfileId(null)}
            isFollowing={isViewedProfileFollowing}
            onFollow={handleFollowUser}
            onUnfollow={handleUnfollowUser}
          />
        ) : activeTab === 'feed' && (
          <div className="fp-feed-layout">
            {feedLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#ffffff66' }}>
                ⏳ Cargando feed...
              </div>
            ) : (
              <Feed 
                recommendations={recommendations}
                following={following}
                onFollow={handleFollowUser}
                onUnfollow={handleUnfollowUser}
                onOpenProfile={handleOpenProfile}
              />
            )}

            {/* SIDEBAR - RECOMENDACIONES */}
            <aside className="fp-sidebar fp-card">
              <h3 style={{ margin: '0 0 16px 0', fontSize: 15, fontWeight: 800 }}>
                Sugerencias para ampliar tu red
              </h3>

              {connectionsLoading ? (
                <p style={{ color: '#ffffff66', fontSize: 12 }}>Cargando...</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {recommendations?.length === 0 ? (
                    <p style={{ color: '#ffffff66', fontSize: 12, textAlign: 'center' }}>
                      Sin recomendaciones
                    </p>
                  ) : (
                    recommendations?.slice(0, 5).map(recommendedUser => (
                      <div
                        key={recommendedUser.id}
                        style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          padding: 10,
                          borderRadius: 10,
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                      >
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #00A878, #007A57)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            {recommendedUser.firstName?.[0]?.toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {recommendedUser.firstName}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const isFollowing = following?.find(u => u.id === recommendedUser.id);
                            if (isFollowing) {
                              handleUnfollowUser(recommendedUser.id);
                            } else {
                              handleFollowUser(recommendedUser.id);
                            }
                          }}
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            borderRadius: 6,
                            border: 'none',
                            background: following?.find(u => u.id === recommendedUser.id)
                              ? 'rgba(255, 255, 255, 0.15)'
                              : 'linear-gradient(135deg, #00A878, #007A57)',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: 11,
                            fontWeight: 600,
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        >
                          {following?.find(u => u.id === recommendedUser.id) ? '✓ Siguiendo' : '+ Seguir'}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </aside>
          </div>
        )}

        {/* NETWORK TAB */}
        {!viewedProfileId && activeTab === 'network' && (
          <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
              {[
                { id: 'following', label: `⭐ Siguiendo (${following?.length || 0})` },
                { id: 'followers', label: `👥 Seguidores (${followers?.length || 0})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setNetworkSubTab(tab.id)}
                  style={{
                    border: 'none',
                    borderRadius: 10,
                    padding: '10px 14px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 700,
                    background: networkSubTab === tab.id
                      ? 'linear-gradient(135deg, #00A878, #007A57)'
                      : 'rgba(255,255,255,0.08)',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {networkSubTab === 'following' && (
              <div style={{ display: 'grid', gap: 18 }}>
                {connectionsLoading ? (
                  <p style={{ color: '#ffffff66', textAlign: 'center', padding: 40 }}>
                    ⏳ Cargando...
                  </p>
                ) : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                      {following?.slice(0, 6).map((followedUser) => (
                        <UserCard
                          key={followedUser.id}
                          user={followedUser}
                          isFollowing={true}
                          onUnfollow={() => handleUnfollowUser(followedUser.id)}
                          onOpenProfile={handleOpenProfile}
                        />
                      ))}
                    </div>

                    <div
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 14,
                        padding: 16,
                      }}
                    >
                      <h3 style={{ margin: '0 0 12px 0', fontSize: 18 }}>📰 Publicaciones y noticias de quienes sigues</h3>
                      {followingPosts.length === 0 ? (
                        <p style={{ color: '#ffffff80', margin: 0 }}>
                          Aún no hay publicaciones recientes de tus seguidos.
                        </p>
                      ) : (
                        <div style={{ display: 'grid', gap: 10 }}>
                          {followingPosts.slice(0, 12).map((post) => (
                            <div
                              key={post.id}
                              style={{
                                padding: 12,
                                borderRadius: 10,
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(255,255,255,0.03)',
                              }}
                            >
                              <div style={{ fontSize: 12, color: '#ffffff99', marginBottom: 6 }}>
                                {post.author?.firstName} {post.author?.lastName} · {post.author?.role}
                              </div>
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
                <div
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 14,
                    padding: 16,
                  }}
                >
                  <h3 style={{ margin: '0 0 10px 0', fontSize: 18 }}>🎯 Recomendaciones por intereses</h3>
                  <p style={{ margin: '0 0 12px 0', color: '#ffffff99', fontSize: 13 }}>
                    Perfiles sugeridos en base a tu actividad en FPConnect.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                    {recommendedByInterests.length === 0 && (
                      <p style={{ color: '#ffffff80' }}>No hay recomendaciones nuevas por ahora.</p>
                    )}
                    {recommendedByInterests.slice(0, 9).map((recommendedUser) => (
                      <UserCard
                        key={recommendedUser.id}
                        user={recommendedUser}
                        isFollowing={!!following?.find((u) => u.id === recommendedUser.id)}
                        onFollow={() => handleFollowUser(recommendedUser.id)}
                        onUnfollow={() => handleUnfollowUser(recommendedUser.id)}
                        onOpenProfile={handleOpenProfile}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* EXPLORE TAB */}
        {!viewedProfileId && activeTab === 'explore' && (
          <div>
            {/* SUBTABS PARA EXPLORE */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12 }}>
              {[
                { id: 'centers', label: '🏫 Centros Educativos', icon: '🏫' },
                { id: 'enterprises', label: '🏢 Empresas', icon: '🏢' },
                { id: 'students', label: '👨‍🎓 Alumnos', icon: '👨‍🎓' },
              ].map(subTab => (
                <button
                  key={subTab.id}
                  onClick={() => setExploreSubTab(subTab.id)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 8,
                    border: 'none',
                    background: exploreSubTab === subTab.id
                      ? 'linear-gradient(135deg, #00A878, #007A57)'
                      : 'rgba(255,255,255,0.08)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 14,
                    transition: 'all 0.3s',
                  }}
                >
                  {subTab.label}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12, color: '#ffffffb3', marginBottom: 10 }}>
                Filtro rápido por provincia
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setExploreProvinceQuickFilter('ALL')}
                  style={{
                    padding: '7px 12px',
                    borderRadius: 999,
                    border: exploreProvinceQuickFilter === 'ALL'
                      ? '1px solid rgba(0, 168, 120, 0.8)'
                      : '1px solid rgba(255,255,255,0.18)',
                    background: exploreProvinceQuickFilter === 'ALL'
                      ? 'rgba(0, 168, 120, 0.2)'
                      : 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Todas
                </button>
                {ANDALUCIA_PROVINCES.map((province) => (
                  <button
                    key={province}
                    onClick={() => setExploreProvinceQuickFilter(province)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: 999,
                      border: exploreProvinceQuickFilter === province
                        ? '1px solid rgba(0, 168, 120, 0.8)'
                        : '1px solid rgba(255,255,255,0.18)',
                      background: exploreProvinceQuickFilter === province
                        ? 'rgba(0, 168, 120, 0.2)'
                        : 'rgba(255,255,255,0.05)',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                  >
                    {province[0] + province.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* CENTROS */}
            {exploreSubTab === 'centers' && (
              <div>
                <h2 style={{ margin: '0 0 14px 0', fontSize: 22 }}>🏫 Centros de FP de Andalucia</h2>
                <p style={{ margin: '0 0 20px 0', color: '#ffffff99', fontSize: 13 }}>
                  Filtra por grado medio, grado superior o grado de especializacion para encontrar el centro ideal.
                </p>

                <div
                  style={{
                    border: '1px solid rgba(0, 168, 120, 0.35)',
                    background: 'rgba(0, 168, 120, 0.12)',
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 18,
                  }}
                >
                  <div style={{ fontSize: 12, color: '#ffffffaa', marginBottom: 4 }}>Mi centro vinculado</div>
                  {linkedCenter ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>
                        ✅ {linkedCenter.centerProfile?.centerName || `${linkedCenter.firstName} ${linkedCenter.lastName}`}
                      </div>
                      <button
                        onClick={handleUnlinkCenter}
                        disabled={unlinkingCenter}
                        style={{
                          border: '1px solid rgba(255, 255, 255, 0.25)',
                          background: 'rgba(255, 255, 255, 0.08)',
                          color: '#fff',
                          borderRadius: 8,
                          padding: '6px 10px',
                          fontSize: 12,
                          cursor: unlinkingCenter ? 'default' : 'pointer',
                        }}
                      >
                        {unlinkingCenter ? 'Desvinculando...' : 'Desvincular'}
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: 14, color: '#ffffffcc' }}>Aun no has vinculado tu centro educativo</div>
                  )}
                </div>

                {linkError && (
                  <div style={{ color: '#ff9f9f', fontSize: 13, marginBottom: 14 }}>
                    {linkError}
                  </div>
                )}

                <div style={{ marginBottom: 32 }}>
                  <input
                    type="text"
                    placeholder="Buscar centros por nombre, ciudad o provincia..."
                    value={centerQuery}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCenterQuery(value);
                      search(value.trim() || 'all', 1, 50, 'CENTRO');
                    }}
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
                      e.target.style.borderColor = 'rgba(0, 168, 120, 0.5)';
                      e.target.style.background = 'rgba(0, 168, 120, 0.08)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                  />

                  <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                    {[
                      { key: 'ALL', label: 'Todos' },
                      { key: 'GM', label: 'Grado Medio' },
                      { key: 'GS', label: 'Grado Superior' },
                      { key: 'GE', label: 'Especializacion' },
                    ].map((item) => (
                      <button
                        key={item.key}
                        onClick={() => setGradeFilter(item.key)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 999,
                          border: gradeFilter === item.key
                            ? '1px solid rgba(0, 168, 120, 0.8)'
                            : '1px solid rgba(255, 255, 255, 0.18)',
                          background: gradeFilter === item.key
                            ? 'rgba(0, 168, 120, 0.2)'
                            : 'rgba(255, 255, 255, 0.05)',
                          color: '#fff',
                          fontSize: 12,
                          cursor: 'pointer',
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <select
                      value={provinceFilter}
                      onChange={(e) => setProvinceFilter(e.target.value)}
                      style={{
                        width: '100%',
                        maxWidth: 280,
                        padding: '10px 12px',
                        borderRadius: 10,
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.05)',
                        color: '#fff',
                        fontSize: 12,
                      }}
                    >
                      <option value="ALL" style={{ color: '#111' }}>Todas las provincias</option>
                      {availableProvinces.map((province) => (
                        <option key={province} value={province} style={{ color: '#111' }}>{province}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginTop: 10, fontSize: 12, color: '#ffffffb3' }}>
                    Mostrando {filteredCenters.length} de {(searchResults || []).filter((user) => user.role === 'CENTRO').length} centros
                  </div>
                </div>

                {searchLoading ? (
                  <p style={{ color: '#ffffff66', textAlign: 'center', padding: 40 }}>
                    ⏳ Buscando...
                  </p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                    {filteredCenters.length === 0 && (
                      <p style={{ color: '#ffffff66', gridColumn: '1 / -1', textAlign: 'center', padding: 40 }}>
                        🔍 No hay centros para el filtro seleccionado
                      </p>
                    )}

                    {filteredCenters.map((searchUser) => {
                      const cicles = parseCicles(searchUser.centerProfile?.cicles);
                      return (
                        <UserCard key={searchUser.id} user={searchUser} actions={false} onOpenProfile={handleOpenProfile}>
                          <div style={{ paddingTop: 10, borderTop: '1px solid rgba(255, 255, 255, 0.1)', marginTop: 'auto' }}>
                            <div style={{ fontSize: 12, color: '#ffffffcc', marginBottom: 6 }}>
                              📍 {searchUser.centerProfile?.city || 'Ciudad no indicada'}
                              {searchUser.centerProfile?.province ? `, ${searchUser.centerProfile.province}` : ''}
                            </div>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              {cicles.length > 0 ? cicles.map((cicle) => (
                                <span
                                  key={cicle}
                                  style={{
                                    fontSize: 11,
                                    padding: '4px 8px',
                                    borderRadius: 999,
                                    background: 'rgba(0, 168, 120, 0.18)',
                                    border: '1px solid rgba(0, 168, 120, 0.35)',
                                  }}
                                >
                                  {cicle}
                                </span>
                              )) : (
                                <span style={{ fontSize: 11, color: '#ffffff88' }}>Sin ciclos registrados</span>
                              )}
                            </div>

                            <button
                              onClick={() => handleLinkToCenter(searchUser)}
                              disabled={linkingCenterId === searchUser.id || linkedCenter?.id === searchUser.id}
                              style={{
                                marginTop: 10,
                                width: '100%',
                                padding: '9px 10px',
                                borderRadius: 8,
                                border: 'none',
                                background: linkedCenter?.id === searchUser.id
                                  ? 'rgba(255, 255, 255, 0.15)'
                                  : 'linear-gradient(135deg, #00A878, #007A57)',
                                color: '#fff',
                                cursor: linkingCenterId === searchUser.id || linkedCenter?.id === searchUser.id ? 'default' : 'pointer',
                                fontWeight: 700,
                                fontSize: 12,
                              }}
                            >
                              {linkedCenter?.id === searchUser.id
                                ? 'Centro vinculado'
                                : linkingCenterId === searchUser.id
                                  ? 'Vinculando...'
                                  : 'Vincularme a este centro'}
                            </button>

                            <button
                              onClick={() => handleUnfollowUser ? (following?.find(u => u.id === searchUser.id) ? handleUnfollowUser(searchUser.id) : handleFollowUser(searchUser.id)) : handleFollowUser(searchUser.id)}
                              style={{
                                marginTop: 10,
                                width: '100%',
                                padding: '9px 10px',
                                borderRadius: 8,
                                border: 'none',
                                background: following?.find(u => u.id === searchUser.id)
                                  ? 'rgba(255, 255, 255, 0.15)'
                                  : 'linear-gradient(135deg, #007a57, #004c36)',
                                color: '#fff',
                                cursor: 'pointer',
                                fontWeight: 700,
                                fontSize: 12,
                              }}
                            >
                              {following?.find(u => u.id === searchUser.id) ? '✓ Siguiendo' : '+ Seguir Centro'}
                            </button>
                          </div>
                        </UserCard>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* EMPRESAS */}
            {exploreSubTab === 'enterprises' && (
              <div>
                <h2 style={{ margin: '0 0 14px 0', fontSize: 22 }}>🏢 Empresas Colaboradoras</h2>
                <p style={{ margin: '0 0 20px 0', color: '#ffffff99', fontSize: 13 }}>
                  Descubre empresas de Andalucía que ofrecen oportunidades de prácticas y formación profesional.
                </p>

                <div style={{ marginBottom: 32 }}>
                  <input
                    type="text"
                    placeholder="Buscar empresas por nombre, sector o ciudad..."
                    value={enterpriseQuery}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEnterpriseQuery(value);
                      search(value.trim() || 'all', 1, 50, 'EMPRESA');
                    }}
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
                      marginBottom: 14,
                    }}
                  />

                  <div style={{ fontSize: 12, color: '#ffffffb3' }}>
                    Mostrando {filteredEnterprises.length} empresas disponibles
                  </div>
                </div>

                {searchLoading ? (
                  <p style={{ color: '#ffffff66', textAlign: 'center', padding: 40 }}>
                    ⏳ Buscando empresas...
                  </p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                    {filteredEnterprises.length === 0 && (
                      <p style={{ color: '#ffffff66', gridColumn: '1 / -1', textAlign: 'center', padding: 40 }}>
                        🔍 No hay empresas disponibles
                      </p>
                    )}

                    {filteredEnterprises.map((enterprise) => (
                      <UserCard key={enterprise.id} user={enterprise} actions={false} onOpenProfile={handleOpenProfile}>
                        <div style={{ paddingTop: 10, borderTop: '1px solid rgba(255, 255, 255, 0.1)', marginTop: 'auto' }}>
                          <div style={{ fontSize: 12, color: '#ffffffcc', marginBottom: 6 }}>
                            🏭 {enterprise.enterpriseProfile?.industry || 'Sector no indicado'}
                          </div>
                          <div style={{ fontSize: 12, color: '#ffffffcc', marginBottom: 8 }}>
                            📍 {enterprise.enterpriseProfile?.city || 'Ciudad no indicada'}
                          </div>
                          <div style={{ fontSize: 13, color: '#ffffffaa', marginBottom: 10, lineHeight: 1.4 }}>
                            {enterprise.enterpriseProfile?.description || 'Descripción no disponible'}
                          </div>

                          <button
                            onClick={() => handleUnfollowUser && following?.find(u => u.id === enterprise.id) ? handleUnfollowUser(enterprise.id) : handleFollowUser(enterprise.id)}
                            style={{
                              width: '100%',
                              padding: '9px 10px',
                              borderRadius: 8,
                              border: 'none',
                              background: following?.find(u => u.id === enterprise.id)
                                ? 'rgba(255, 255, 255, 0.15)'
                                : 'linear-gradient(135deg, #00A878, #007A57)',
                              color: '#fff',
                              cursor: 'pointer',
                              fontWeight: 700,
                              fontSize: 12,
                            }}
                          >
                            {following?.find(u => u.id === enterprise.id) ? '✓ Siguiendo' : '+ Seguir Empresa'}
                          </button>
                        </div>
                      </UserCard>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ALUMNOS */}
            {exploreSubTab === 'students' && (
              <div>
                <h2 style={{ margin: '0 0 14px 0', fontSize: 22 }}>👨‍🎓 Conecta con Otros Alumnos</h2>
                <p style={{ margin: '0 0 20px 0', color: '#ffffff99', fontSize: 13 }}>
                  Descubre y conecta con otros estudiantes de FP en Andalucía.
                </p>

                <div style={{ marginBottom: 32 }}>
                  <input
                    type="text"
                    placeholder="Buscar alumnos por nombre, ciclo o especialidad..."
                    value={studentQuery}
                    onChange={(e) => {
                      const value = e.target.value;
                      setStudentQuery(value);
                      search(value.trim() || 'all', 1, 50, 'ALUMNO');
                    }}
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
                      marginBottom: 14,
                    }}
                  />

                  <div style={{ fontSize: 12, color: '#ffffffb3' }}>
                    Mostrando {filteredStudents.length} alumnos disponibles
                  </div>
                </div>

                {searchLoading ? (
                  <p style={{ color: '#ffffff66', textAlign: 'center', padding: 40 }}>
                    ⏳ Buscando alumnos...
                  </p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                    {filteredStudents.length === 0 && (
                      <p style={{ color: '#ffffff66', gridColumn: '1 / -1', textAlign: 'center', padding: 40 }}>
                        🔍 No hay alumnos disponibles
                      </p>
                    )}

                    {filteredStudents.map((student) => (
                      <UserCard key={student.id} user={student} actions={false} onOpenProfile={handleOpenProfile}>
                        <div style={{ paddingTop: 10, borderTop: '1px solid rgba(255, 255, 255, 0.1)', marginTop: 'auto' }}>
                          <div style={{ fontSize: 12, color: '#ffffffcc', marginBottom: 6 }}>
                            📚 {student.studentProfile?.cicle || 'Ciclo no indicado'}
                          </div>
                          <div style={{ fontSize: 12, color: '#ffffffcc', marginBottom: 8 }}>
                            📍 {student.location || 'Ubicación no indicada'}
                          </div>
                          {student.studentProfile?.skills && JSON.parse(student.studentProfile.skills).length > 0 && (
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                              {JSON.parse(student.studentProfile.skills).slice(0, 3).map((skill) => (
                                <span
                                  key={skill}
                                  style={{
                                    fontSize: 11,
                                    padding: '4px 8px',
                                    borderRadius: 999,
                                    background: 'rgba(0, 168, 120, 0.18)',
                                    border: '1px solid rgba(0, 168, 120, 0.35)',
                                  }}
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}

                          <button
                            onClick={() => handleUnfollowUser ? (following?.find(u => u.id === student.id) ? handleUnfollowUser(student.id) : handleFollowUser(student.id)) : handleFollowUser(student.id)}
                            style={{
                              width: '100%',
                              padding: '9px 10px',
                              borderRadius: 8,
                              border: 'none',
                              background: following?.find(u => u.id === student.id)
                                ? 'rgba(255, 255, 255, 0.15)'
                                : 'linear-gradient(135deg, #00A878, #007A57)',
                              color: '#fff',
                              cursor: 'pointer',
                              fontWeight: 700,
                              fontSize: 12,
                            }}
                          >
                            {following?.find(u => u.id === student.id) ? '✓ Siguiendo' : '+ Seguir Alumno'}
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

        {!viewedProfileId && activeTab === 'news' && (
          <div>
            <h2 style={{ margin: '0 0 12px 0', fontSize: 24 }}>📰 Noticias FP</h2>
            <p style={{ margin: '0 0 22px 0', color: '#ffffff99', fontSize: 14 }}>
              Becas, convocatorias y oportunidades para alumnado de Formacion Profesional.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
              {FP_NEWS_ITEMS.map((item) => (
                <article
                  key={item.id}
                  style={{
                    borderRadius: 14,
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.04)',
                    padding: 16,
                    display: 'grid',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        fontSize: 11,
                        borderRadius: 999,
                        padding: '4px 9px',
                        background: 'rgba(0,168,120,0.2)',
                        border: '1px solid rgba(0,168,120,0.5)',
                        color: '#d3ffef',
                        fontWeight: 700,
                      }}
                    >
                      {item.category}
                    </span>
                    <span style={{ color: '#ffffff88', fontSize: 12 }}>{item.source}</span>
                  </div>
                  <h3 style={{ margin: 0, fontSize: 18 }}>{item.title}</h3>
                  <p style={{ margin: 0, color: '#ffffffcc', fontSize: 14, lineHeight: 1.5 }}>
                    {item.summary}
                  </p>
                  <div style={{ color: '#ffffffa8', fontSize: 12 }}>{item.deadline}</div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.24)',
                      color: '#fff',
                      padding: '8px 12px',
                      textDecoration: 'none',
                      fontWeight: 600,
                      width: 'fit-content',
                    }}
                  >
                    Ver convocatoria
                  </a>
                </article>
              ))}
            </div>
          </div>
        )}
        {/* PROFILE TAB */}
{!viewedProfileId && activeTab === 'profile' && (
  <ProfileEditor user={authUser} role="ALUMNO" />
)}
      </div>
    </div>
  );
}
