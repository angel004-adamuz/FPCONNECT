import { useState } from 'react';
import { usersService } from '../services';

/**
 * Componente UserCard
 * Card reutilizable para mostrar información de usuarios
 */
export default function UserCard({ user, onFollow, onUnfollow, isFollowing, actions = true, children, onOpenProfile }) {
  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  const handleViewProfile = async () => {
    if (onOpenProfile) {
      onOpenProfile(user.id);
      return;
    }

    setLoadingProfile(true);
    setProfileError('');
    try {
      const response = await usersService.getProfile(user.id);
      setProfile(response.data);
    } catch (err) {
      setProfileError(err.message || 'No se pudo cargar el perfil');
    } finally {
      setLoadingProfile(false);
    }
  };

  const closeProfile = () => {
    setProfile(null);
    setProfileError('');
  };

  const parsedCicles = profile?.centerProfile?.cicles
    ? (() => {
        try {
          return JSON.parse(profile.centerProfile.cicles);
        } catch {
          return [];
        }
      })()
    : [];

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

  const studentSkills = parseJsonArray(profile?.studentProfile?.skills);
  const studentProjects = parseJsonArray(profile?.studentProfile?.projects);
  const studentCertificates = parseJsonArray(profile?.studentProfile?.certificatesUrl);
  const studentJobPreferences = parseJsonObject(profile?.studentProfile?.jobPreferences);

  const externalLinkStyle = {
    color: '#7ce8c7',
    textDecoration: 'none',
    wordBreak: 'break-all',
  };

  return (
    <div
      className="fp-user-card"
      style={{
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        height: '100%',
        boxSizing: 'border-box',
        transition: 'transform 0.18s ease, border-color 0.18s ease, background 0.18s ease',
      }}
    >
      <div style={{ display: 'flex', gap: 12 }}>
        {/* Avatar */}
        <div
	          style={{
	            width: 52,
	            height: 52,
	            borderRadius: 16,
	            background: 'linear-gradient(135deg, var(--fp-accent), #08795c)',
	            display: 'flex',
	            alignItems: 'center',
	            justifyContent: 'center',
	            color: '#fff',
	            fontSize: 16,
	            fontWeight: 900,
	            flexShrink: 0,
              boxShadow: '0 12px 28px rgba(0, 201, 139, 0.22)',
	          }}
	        >
          {initials}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user.firstName} {user.lastName}
          </div>
          <div style={{ color: 'var(--fp-muted)', fontSize: 12, marginBottom: 8, fontWeight: 700 }}>
            {user.role === 'ALUMNO' && 'Estudiante'}
            {user.role === 'CENTRO' && 'Centro FP'}
            {user.role === 'EMPRESA' && 'Empresa'}
          </div>
          <p
            style={{
	              color: 'rgba(248, 250, 252, 0.72)',
	              fontSize: 12,
              margin: '0 0 12px 0',
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.4,
              minHeight: '67px',
            }}
          >
	            {user.bio || 'Sin descripción disponible.'}
          </p>

          <div style={{ marginTop: 'auto' }}>
            <button
              onClick={handleViewProfile}
              disabled={loadingProfile}
	              className="fp-button fp-button--ghost"
	              style={{ width: '100%', fontSize: 12, whiteSpace: 'nowrap', opacity: loadingProfile ? 0.7 : 1 }}
	            >
              {loadingProfile ? 'Cargando...' : 'Ver perfil completo'}
            </button>
          </div>
        </div>

        {/* Optional explicit native follow button if actions=true */}
        {actions && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
            <button
              onClick={() => (isFollowing ? onUnfollow(user.id) : onFollow(user.id))}
	              className={`fp-button ${isFollowing ? 'fp-button--ghost' : ''}`}
	              style={{ fontSize: 12, whiteSpace: 'nowrap', flexShrink: 0 }}
	            >
              {isFollowing ? '✓ Siguiendo' : '+ Seguir'}
            </button>
          </div>
        )}
      </div>

      {children}

      {(profile || profileError) && (
        <div
          onClick={closeProfile}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 560,
              borderRadius: 14,
              border: '1px solid rgba(255, 255, 255, 0.18)',
              background: 'linear-gradient(160deg, #0c1a14 0%, #0f1f2e 100%)',
              color: '#fff',
              padding: 20,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 18 }}>Perfil publico</h3>
              <button
                onClick={closeProfile}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#fff',
                  fontSize: 18,
                  cursor: 'pointer',
                }}
              >
                x
              </button>
            </div>

            {profileError && (
              <div style={{ color: '#ff8c8c', fontSize: 13 }}>{profileError}</div>
            )}

            {profile && (
              <div style={{ display: 'grid', gap: 10 }}>
                <div><strong>Nombre:</strong> {profile.firstName} {profile.lastName}</div>
                <div><strong>Rol:</strong> {profile.role}</div>
                {profile.location && <div><strong>Ubicacion:</strong> {profile.location}</div>}
                {profile.bio && <div><strong>Bio:</strong> {profile.bio}</div>}

                {profile.centerProfile && (
                  <>
                    <div><strong>Centro:</strong> {profile.centerProfile.centerName || 'No indicado'}</div>
                    <div><strong>Ciudad:</strong> {profile.centerProfile.city || 'No indicada'}</div>
                    <div><strong>Provincia:</strong> {profile.centerProfile.province || 'No indicada'}</div>
                    <div>
                      <strong>Ciclos:</strong>{' '}
                      {parsedCicles.length > 0 ? parsedCicles.join(', ') : 'No indicados'}
                    </div>
                  </>
                )}

                {profile.studentProfile && (
                  <>
                    {profile.studentProfile.cicle && <div><strong>Ciclo:</strong> {profile.studentProfile.cicle}</div>}
                    {profile.studentProfile.specialization && (
                      <div><strong>Especialidad:</strong> {profile.studentProfile.specialization}</div>
                    )}
                    {profile.studentProfile.experience && (
                      <div><strong>Experiencia:</strong> {profile.studentProfile.experience}</div>
                    )}
                    {studentSkills.length > 0 && (
                      <div><strong>Skills:</strong> {studentSkills.join(', ')}</div>
                    )}
                    {studentProjects.length > 0 && (
                      <div><strong>Proyectos:</strong> {studentProjects.join(' | ')}</div>
                    )}
                    {profile.studentProfile.cvUrl && (
                      <div>
                        <strong>CV:</strong>{' '}
                        <a href={profile.studentProfile.cvUrl} target="_blank" rel="noreferrer" style={externalLinkStyle}>
                          {profile.studentProfile.cvUrl}
                        </a>
                      </div>
                    )}
                    {studentCertificates.length > 0 && (
                      <div><strong>Certificados:</strong> {studentCertificates.join(' | ')}</div>
                    )}
                    {studentJobPreferences && (
                      <div><strong>Preferencias:</strong> {JSON.stringify(studentJobPreferences)}</div>
                    )}
                  </>
                )}

                {profile.linkedinUrl && (
                  <div>
                    <strong>LinkedIn:</strong>{' '}
                    <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" style={externalLinkStyle}>
                      {profile.linkedinUrl}
                    </a>
                  </div>
                )}
                {profile.portfolioUrl && (
                  <div>
                    <strong>Portfolio:</strong>{' '}
                    <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" style={externalLinkStyle}>
                      {profile.portfolioUrl}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
