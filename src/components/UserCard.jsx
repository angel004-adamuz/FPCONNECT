import { useState } from 'react';
import { usersService } from '../services';

const getAvatarUrl = (user) => {
  const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'FP';
  const color = user.role === 'CENTRO' ? '2563EB' : user.role === 'EMPRESA' ? 'EC4899' : '00A878';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=fff&size=80&bold=true&rounded=true`;
};

export default function UserCard({ user, onFollow, onUnfollow, isFollowing, actions = true, children, onOpenProfile }) {
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  const handleViewProfile = async () => {
    if (onOpenProfile) { onOpenProfile(user.id); return; }
    setLoadingProfile(true); setProfileError('');
    try {
      const response = await usersService.getProfile(user.id);
      setProfile(response.data);
    } catch (err) { setProfileError(err.message || 'No se pudo cargar el perfil'); }
    finally { setLoadingProfile(false); }
  };

  const closeProfile = () => { setProfile(null); setProfileError(''); };

  const parsedCicles = profile?.centerProfile?.cicles ? (() => { try { return JSON.parse(profile.centerProfile.cicles); } catch { return []; } })() : [];

  const parseJsonArray = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    try { const p = JSON.parse(value); return Array.isArray(p) ? p : []; } catch { return []; }
  };

  const parseJsonObject = (value) => {
    if (!value) return null;
    if (typeof value === 'object') return value;
    try { const p = JSON.parse(value); return p && typeof p === 'object' ? p : null; } catch { return null; }
  };

  const studentSkills = parseJsonArray(profile?.studentProfile?.skills);
  const studentProjects = parseJsonArray(profile?.studentProfile?.projects);
  const studentCertificates = parseJsonArray(profile?.studentProfile?.certificatesUrl);
  const studentJobPreferences = parseJsonObject(profile?.studentProfile?.jobPreferences);

  const externalLinkStyle = { color: '#7ce8c7', textDecoration: 'none', wordBreak: 'break-all' };

  const roleColor = user.role === 'CENTRO' ? '#2563EB' : user.role === 'EMPRESA' ? '#EC4899' : '#00A878';
  const roleLabel = user.role === 'ALUMNO' ? 'Estudiante' : user.role === 'CENTRO' ? 'Centro FP' : 'Empresa';

  return (
    <div className="fp-user-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, height: '100%', boxSizing: 'border-box', transition: 'transform 0.18s ease, border-color 0.18s ease' }}>
      <div style={{ display: 'flex', gap: 12 }}>

        {/* Avatar con imagen */}
        <div style={{ flexShrink: 0 }}>
          <img
            src={getAvatarUrl(user)}
            alt={`${user.firstName} ${user.lastName}`}
            style={{ width: 52, height: 52, borderRadius: 14, display: 'block', boxShadow: `0 8px 24px ${roleColor}44` }}
          />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user.firstName} {user.lastName}
          </div>
          <div style={{ fontSize: 12, marginBottom: 8, fontWeight: 700, color: roleColor }}>
            {roleLabel}
          </div>
          <p style={{ color: 'rgba(248,250,252,0.72)', fontSize: 12, margin: '0 0 12px 0', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.4, minHeight: '67px' }}>
            {user.bio || 'Sin descripción disponible.'}
          </p>
          <div style={{ marginTop: 'auto' }}>
            <button onClick={handleViewProfile} disabled={loadingProfile} className="fp-button fp-button--ghost"
              style={{ width: '100%', fontSize: 12, whiteSpace: 'nowrap', opacity: loadingProfile ? 0.7 : 1 }}>
              {loadingProfile ? 'Cargando...' : 'Ver perfil completo'}
            </button>
          </div>
        </div>

        {actions && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
            <button onClick={() => isFollowing ? onUnfollow(user.id) : onFollow(user.id)}
              className={`fp-button ${isFollowing ? 'fp-button--ghost' : ''}`}
              style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
              {isFollowing ? '✓ Siguiendo' : '+ Seguir'}
            </button>
          </div>
        )}
      </div>

      {children}

      {(profile || profileError) && (
        <div onClick={closeProfile} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 560, borderRadius: 14, border: '1px solid rgba(255,255,255,0.18)', background: 'linear-gradient(160deg, #0c1a14 0%, #0f1f2e 100%)', color: '#fff', padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {profile && (
                  <img src={getAvatarUrl(profile)} alt="" style={{ width: 48, height: 48, borderRadius: 12 }} />
                )}
                <h3 style={{ margin: 0, fontSize: 18 }}>Perfil público</h3>
              </div>
              <button onClick={closeProfile} style={{ border: 'none', background: 'transparent', color: '#fff', fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>

            {profileError && <div style={{ color: '#ff8c8c', fontSize: 13 }}>{profileError}</div>}

            {profile && (
              <div style={{ display: 'grid', gap: 10 }}>
                <div><strong>Nombre:</strong> {profile.firstName} {profile.lastName}</div>
                <div><strong>Rol:</strong> <span style={{ color: roleColor }}>{roleLabel}</span></div>
                {profile.location && <div><strong>Ubicación:</strong> {profile.location}</div>}
                {profile.bio && <div><strong>Bio:</strong> {profile.bio}</div>}

                {profile.centerProfile && (
                  <>
                    <div><strong>Centro:</strong> {profile.centerProfile.centerName || 'No indicado'}</div>
                    <div><strong>Ciudad:</strong> {profile.centerProfile.city || 'No indicada'}</div>
                    <div><strong>Provincia:</strong> {profile.centerProfile.province || 'No indicada'}</div>
                    <div><strong>Ciclos:</strong> {parsedCicles.length > 0 ? parsedCicles.join(', ') : 'No indicados'}</div>
                  </>
                )}

                {profile.studentProfile && (
                  <>
                    {profile.studentProfile.cicle && <div><strong>Ciclo:</strong> {profile.studentProfile.cicle}</div>}
                    {profile.studentProfile.specialization && <div><strong>Especialidad:</strong> {profile.studentProfile.specialization}</div>}
                    {profile.studentProfile.experience && <div><strong>Experiencia:</strong> {profile.studentProfile.experience}</div>}
                    {studentSkills.length > 0 && (
                      <div>
                        <strong>Skills:</strong>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                          {studentSkills.map(s => (
                            <span key={s} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 999, background: 'rgba(0,168,120,0.2)', border: '1px solid rgba(0,168,120,0.4)' }}>{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {studentProjects.length > 0 && <div><strong>Proyectos:</strong> {studentProjects.join(' | ')}</div>}
                    {profile.studentProfile.cvUrl && <div><strong>CV:</strong> <a href={profile.studentProfile.cvUrl} target="_blank" rel="noreferrer" style={externalLinkStyle}>{profile.studentProfile.cvUrl}</a></div>}
                    {studentCertificates.length > 0 && <div><strong>Certificados:</strong> {studentCertificates.join(' | ')}</div>}
                    {studentJobPreferences && <div><strong>Preferencias:</strong> {JSON.stringify(studentJobPreferences)}</div>}
                  </>
                )}

                {profile.linkedinUrl && <div><strong>LinkedIn:</strong> <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" style={externalLinkStyle}>{profile.linkedinUrl}</a></div>}
                {profile.portfolioUrl && <div><strong>Portfolio:</strong> <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" style={externalLinkStyle}>{profile.portfolioUrl}</a></div>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}