import { useEffect, useMemo, useState } from 'react';
import { usersService } from '../services';

const cardStyle = {
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 16,
  padding: 20,
};

const sectionTitleStyle = {
  margin: '0 0 12px 0',
  fontSize: 18,
  fontWeight: 700,
  color: '#fff',
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

const parseJsonObject = (value) => {
  if (!value) return null;
  if (typeof value === 'object') return value;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

export default function PublicProfileView({ userId, onBack, isFollowing = false, onFollow, onUnfollow }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await usersService.getProfile(userId);
        if (isMounted) {
          setProfile(response.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'No se pudo cargar el perfil');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (userId) {
      loadProfile();
    }

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const profileMeta = useMemo(() => {
    if (!profile) return null;

    const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
    const initials = `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase();
    const memberSince = profile.createdAt
      ? new Date(profile.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })
      : null;

    const centerCicles = parseJsonArray(profile.centerProfile?.cicles);
    const studentSkills = parseJsonArray(profile.studentProfile?.skills);
    const studentProjects = parseJsonArray(profile.studentProfile?.projects);
    const studentCertificates = parseJsonArray(profile.studentProfile?.certificatesUrl);
    const studentJobPreferences = parseJsonObject(profile.studentProfile?.jobPreferences);

    return {
      fullName,
      initials,
      memberSince,
      centerCicles,
      studentSkills,
      studentProjects,
      studentCertificates,
      studentJobPreferences,
    };
  }, [profile]);

  if (loading) {
    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24, color: '#ffffff99' }}>
        Cargando perfil...
      </div>
    );
  }

  if (error || !profile || !profileMeta) {
    return (
      <div className="fp-public-profile">
        <button
          onClick={onBack}
          style={{
            marginBottom: 16,
            border: '1px solid rgba(255, 255, 255, 0.25)',
            background: 'transparent',
            color: '#fff',
            borderRadius: 10,
            padding: '8px 14px',
            cursor: 'pointer',
          }}
        >
          Volver
        </button>
        <div style={{ ...cardStyle, color: '#ffb0b0' }}>{error || 'Perfil no disponible'}</div>
      </div>
    );
  }

  return (
    <div className="fp-public-profile">
      <button
        onClick={onBack}
        style={{
          marginBottom: 16,
          border: '1px solid rgba(255, 255, 255, 0.25)',
          background: 'transparent',
          color: '#fff',
          borderRadius: 10,
          padding: '8px 14px',
          cursor: 'pointer',
        }}
      >
        Volver a explorar
      </button>

      <div
        style={{
          borderRadius: 20,
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          background: 'rgba(255, 255, 255, 0.04)',
          marginBottom: 18,
        }}
      >
        <div
          style={{
            height: 170,
            background: 'linear-gradient(120deg, #062a25 0%, #0c355f 55%, #0f1f2e 100%)',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 24,
              bottom: -38,
              width: 84,
              height: 84,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00A878, #007A57)',
              border: '4px solid #0f1f2e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 30,
              fontWeight: 800,
              color: '#fff',
            }}
          >
            {profileMeta.initials || 'U'}
          </div>
        </div>

        <div style={{ padding: '52px 24px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 30, fontWeight: 800 }}>{profileMeta.fullName}</h2>
              <div style={{ color: '#ffffffb3', marginTop: 8 }}>
                {profile.role === 'ALUMNO' && 'Alumno de Formacion Profesional'}
                {profile.role === 'CENTRO' && 'Centro de Formacion Profesional'}
                {profile.role === 'EMPRESA' && 'Empresa colaboradora de FP'}
              </div>
              <div style={{ color: '#ffffff99', marginTop: 6, fontSize: 14 }}>
                {profile.location || 'Ubicacion no indicada'}
                {profileMeta.memberSince ? ` · En FPConnect desde ${profileMeta.memberSince}` : ''}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, alignSelf: 'flex-start' }}>
              <button
                onClick={() => (isFollowing ? onUnfollow?.(profile.id) : onFollow?.(profile.id))}
                style={{
                  border: 'none',
                  borderRadius: 10,
                  padding: '10px 18px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 700,
                  background: isFollowing
                    ? 'rgba(255, 255, 255, 0.15)'
                    : 'linear-gradient(135deg, #00A878, #007A57)',
                }}
              >
                {isFollowing ? 'Siguiendo' : 'Seguir'}
              </button>
            </div>
          </div>

          {profile.bio && (
            <p style={{ marginTop: 16, color: '#ffffffd8', lineHeight: 1.6, maxWidth: 850 }}>{profile.bio}</p>
          )}
        </div>
      </div>

      <div className="fp-public-profile__body">
        <div style={{ display: 'grid', gap: 18 }}>
          <section style={cardStyle}>
            <h3 style={sectionTitleStyle}>Acerca de</h3>
            <p style={{ margin: 0, color: '#ffffffcc', lineHeight: 1.65 }}>
              {profile.bio || 'Este usuario todavia no ha completado su descripcion publica.'}
            </p>
          </section>

          {profile.studentProfile && (
            <section style={cardStyle}>
              <h3 style={sectionTitleStyle}>Experiencia y formacion</h3>
              <div style={{ display: 'grid', gap: 12, color: '#ffffffd0' }}>
                <div><strong>Ciclo:</strong> {profile.studentProfile.cicle || 'No indicado'}</div>
                <div><strong>Especializacion:</strong> {profile.studentProfile.specialization || 'No indicada'}</div>
                <div><strong>Curso:</strong> {profile.studentProfile.courseYear || 'No indicado'}</div>
                <div><strong>Experiencia:</strong> {profile.studentProfile.experience || 'Sin experiencia detallada'}</div>
                <div><strong>Busca empleo:</strong> {profile.studentProfile.seekingJob ? 'Si' : 'No'}</div>
                {profileMeta.studentProjects.length > 0 && (
                  <div>
                    <strong>Proyectos:</strong> {profileMeta.studentProjects.join(' · ')}
                  </div>
                )}
              </div>
            </section>
          )}

          {profile.enterpriseProfile && (
            <section style={cardStyle}>
              <h3 style={sectionTitleStyle}>Informacion de empresa</h3>
              <div style={{ display: 'grid', gap: 12, color: '#ffffffd0' }}>
                <div><strong>Empresa:</strong> {profile.enterpriseProfile.companyName || 'No indicada'}</div>
                <div><strong>Sector:</strong> {profile.enterpriseProfile.industry || 'No indicado'}</div>
                <div><strong>Descripcion:</strong> {profile.enterpriseProfile.description || 'Sin descripcion'}</div>
                {profile.enterpriseProfile.website && (
                  <div>
                    <strong>Web:</strong>{' '}
                    <a href={profile.enterpriseProfile.website} target="_blank" rel="noreferrer" style={{ color: '#81f2cf' }}>
                      {profile.enterpriseProfile.website}
                    </a>
                  </div>
                )}
              </div>
            </section>
          )}

          {profile.centerProfile && (
            <section style={cardStyle}>
              <h3 style={sectionTitleStyle}>Centro educativo</h3>
              <div style={{ display: 'grid', gap: 12, color: '#ffffffd0' }}>
                <div><strong>Centro:</strong> {profile.centerProfile.centerName || 'No indicado'}</div>
                <div><strong>Ciudad:</strong> {profile.centerProfile.city || 'No indicada'}</div>
                <div><strong>Provincia:</strong> {profile.centerProfile.province || 'No indicada'}</div>
                <div><strong>Ciclos:</strong> {profileMeta.centerCicles.length > 0 ? profileMeta.centerCicles.join(', ') : 'No indicados'}</div>
              </div>
            </section>
          )}
        </div>

        <aside style={{ display: 'grid', gap: 18, alignContent: 'start' }}>
          <section style={cardStyle}>
            <h3 style={sectionTitleStyle}>Datos clave</h3>
            <div style={{ display: 'grid', gap: 10, color: '#ffffffc0' }}>
              <div><strong>Rol:</strong> {profile.role}</div>
              <div><strong>Ubicacion:</strong> {profile.location || 'No indicada'}</div>
              {profile.linkedinUrl && (
                <div>
                  <strong>LinkedIn:</strong>{' '}
                  <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" style={{ color: '#81f2cf' }}>
                    Ver enlace
                  </a>
                </div>
              )}
              {profile.portfolioUrl && (
                <div>
                  <strong>Portfolio:</strong>{' '}
                  <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" style={{ color: '#81f2cf' }}>
                    Ver enlace
                  </a>
                </div>
              )}
            </div>
          </section>

          {profileMeta.studentSkills.length > 0 && (
            <section style={cardStyle}>
              <h3 style={sectionTitleStyle}>Skills</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {profileMeta.studentSkills.map((skill) => (
                  <span
                    key={skill}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 999,
                      fontSize: 12,
                      border: '1px solid rgba(0, 168, 120, 0.45)',
                      background: 'rgba(0, 168, 120, 0.18)',
                      color: '#d7fff2',
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {profileMeta.studentCertificates.length > 0 && (
            <section style={cardStyle}>
              <h3 style={sectionTitleStyle}>Certificados</h3>
              <ul style={{ margin: 0, paddingLeft: 18, color: '#ffffffd0', lineHeight: 1.5 }}>
                {profileMeta.studentCertificates.map((certificate) => (
                  <li key={certificate}>{certificate}</li>
                ))}
              </ul>
            </section>
          )}

          {profileMeta.studentJobPreferences && (
            <section style={cardStyle}>
              <h3 style={sectionTitleStyle}>Preferencias laborales</h3>
              <pre
                style={{
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  color: '#ffffffc7',
                  fontFamily: 'inherit',
                  fontSize: 13,
                }}
              >
                {JSON.stringify(profileMeta.studentJobPreferences, null, 2)}
              </pre>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
