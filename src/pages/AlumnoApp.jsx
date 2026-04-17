import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useFeed, useConnections, useUserSearch } from '../hooks';
import Feed from '../components/Feed';
import UserCard from '../components/UserCard';
import { usersService } from '../services';

export default function AlumnoApp() {
  const { user: authUser, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('feed');
  const [exploreSubTab, setExploreSubTab] = useState('centers'); // centers, enterprises, students
  
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
    const centerProvince = (center.centerProfile?.province || '').toUpperCase();
    const matchesProvince = provinceFilter === 'ALL' || centerProvince === provinceFilter;
    return matchesGrade && matchesProvince;
  };

  const filteredCenters = (searchResults || [])
    .filter((user) => user.role === 'CENTRO')
    .filter(centerMatchesFilter);

  const availableProvinces = Array.from(
    new Set(
      (searchResults || [])
        .filter((user) => user.role === 'CENTRO')
        .map((user) => user.centerProfile?.province)
        .filter(Boolean)
        .map((province) => province.toUpperCase())
    )
  ).sort();

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
    } else if (activeTab === 'network') {
      loadFollowers();
      loadFollowing();
    } else if (activeTab === 'explore') {
      loadRecommendations();
      // Cargar centros, empresas y alumnos
      search('*', 1, 50, 'CENTRO');
      search('*', 1, 50, 'EMPRESA');
      search('*', 1, 50, 'ALUMNO');
      loadLinkedCenter();
    }
  }, [activeTab, loadFeed, loadFollowers, loadFollowing, loadRecommendations, search]);

  useEffect(() => {
    loadLinkedCenter();
  }, []);

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
      if (linkedCenter?.id === userId) {
        setLinkedCenter(null);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleLinkToCenter = async (center) => {
    setLinkingCenterId(center.id);
    setLinkError('');
    try {
      const response = await usersService.linkMeToCenter(center.id);
      setLinkedCenter(response.data);
      await loadFollowing();
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
      await loadFollowing();
      await loadRecommendations();
    } catch (err) {
      setLinkError(err.message || 'No se pudo desvincular el centro');
    } finally {
      setUnlinkingCenter(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0c1a14 0%, #0f1f2e 50%, #14101f 100%)',
      color: '#fff',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* TOP NAV */}
      <nav style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>
            FP<span style={{ color: '#00A878' }}>Connect</span>
          </h1>

          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { id: 'feed', label: '📝 Feed' },
              { id: 'network', label: '🔗 Red' },
              { id: 'explore', label: '🔍 Explorar' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: activeTab === tab.id
                    ? 'linear-gradient(135deg, #00A878, #007A57)'
                    : 'rgba(255,255,255,0.08)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.3s',
                  fontSize: 14,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right', fontSize: 12 }}>
            <div style={{ fontWeight: 600 }}>
              {authUser?.firstName} {authUser?.lastName}
            </div>
            <div style={{ color: '#ffffff66' }}>👨‍🎓 Alumno</div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: 'rgba(255,0,0,0.2)',
              color: '#ff6b6b',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,0,0,0.3)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255,0,0,0.2)'}
          >
            🚪 Salir
          </button>
        </div>
      </nav>

      {/* CONTENT */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px' }}>
        {/* FEED TAB */}
        {activeTab === 'feed' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>
            {feedLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#ffffff66' }}>
                ⏳ Cargando feed...
              </div>
            ) : (
              <Feed />
            )}

            {/* SIDEBAR - RECOMENDACIONES */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: 16,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: 20,
              height: 'fit-content',
              position: 'sticky',
              top: 80,
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 14, fontWeight: 700 }}>
                👥 Sugerencias
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
                          onClick={() => handleFollowUser(recommendedUser.id)}
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            borderRadius: 6,
                            border: 'none',
                            background: 'linear-gradient(135deg, #00A878, #007A57)',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: 11,
                            fontWeight: 600,
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        >
                          + Seguir
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* NETWORK TAB */}
        {activeTab === 'network' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
                👥 Mis Seguidores ({followers?.length || 0})
              </h2>

              {connectionsLoading ? (
                <p style={{ color: '#ffffff66', textAlign: 'center', padding: 40 }}>
                  ⏳ Cargando...
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {followers?.length === 0 && (
                    <p style={{ color: '#ffffff66', textAlign: 'center', padding: 40 }}>
                      📭 Aún no tienes seguidores
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

        {/* EXPLORE TAB */}
        {activeTab === 'explore' && (
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
                      search(value.trim() || '*', 1, 50, 'CENTRO');
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
                        <div key={searchUser.id} style={{ display: 'grid', gap: 10 }}>
                          <UserCard
                            user={searchUser}
                            actions={false}
                          />

                          <div
                            style={{
                              border: '1px solid rgba(255,255,255,0.1)',
                              background: 'rgba(255,255,255,0.03)',
                              borderRadius: 10,
                              padding: 10,
                            }}
                          >
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
                          </div>
                        </div>
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
                      search(value.trim() || '*', 1, 50, 'EMPRESA');
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
                    Mostrando {(searchResults || []).filter((user) => user.role === 'EMPRESA').length} empresas disponibles
                  </div>
                </div>

                {searchLoading ? (
                  <p style={{ color: '#ffffff66', textAlign: 'center', padding: 40 }}>
                    ⏳ Buscando empresas...
                  </p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                    {(searchResults || []).filter((user) => user.role === 'EMPRESA').length === 0 && (
                      <p style={{ color: '#ffffff66', gridColumn: '1 / -1', textAlign: 'center', padding: 40 }}>
                        🔍 No hay empresas disponibles
                      </p>
                    )}

                    {(searchResults || []).filter((user) => user.role === 'EMPRESA').map((enterprise) => (
                      <div key={enterprise.id} style={{ display: 'grid', gap: 10 }}>
                        <UserCard user={enterprise} actions={false} />

                        <div
                          style={{
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: 10,
                            padding: 10,
                          }}
                        >
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
                            onClick={() => handleFollowUser(enterprise.id)}
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
                      </div>
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
                      search(value.trim() || '*', 1, 50, 'ALUMNO');
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
                    Mostrando {(searchResults || []).filter((user) => user.role === 'ALUMNO').length} alumnos disponibles
                  </div>
                </div>

                {searchLoading ? (
                  <p style={{ color: '#ffffff66', textAlign: 'center', padding: 40 }}>
                    ⏳ Buscando alumnos...
                  </p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                    {(searchResults || []).filter((user) => user.role === 'ALUMNO').length === 0 && (
                      <p style={{ color: '#ffffff66', gridColumn: '1 / -1', textAlign: 'center', padding: 40 }}>
                        🔍 No hay alumnos disponibles
                      </p>
                    )}

                    {(searchResults || []).filter((user) => user.role === 'ALUMNO').map((student) => (
                      <div key={student.id} style={{ display: 'grid', gap: 10 }}>
                        <UserCard user={student} actions={false} />

                        <div
                          style={{
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: 10,
                            padding: 10,
                          }}
                        >
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
                            onClick={() => handleFollowUser(student.id)}
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
