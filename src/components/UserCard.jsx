import { useState } from 'react';
import { usersService } from '../services';

const getAvatarUrl = (user, size = 80) => {
  const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'FP';
  const color = user.role === 'CENTRO' ? '2563EB' : user.role === 'EMPRESA' ? 'EC4899' : '00A878';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=fff&size=${size}&bold=true&rounded=true`;
};

const ROLE_CONFIG = {
  ALUMNO:  { label: 'Estudiante',  color: '#00A878', bg: 'rgba(0,168,120,0.15)',  border: 'rgba(0,168,120,0.35)'  },
  CENTRO:  { label: 'Centro FP',   color: '#4f8cff', bg: 'rgba(79,140,255,0.15)', border: 'rgba(79,140,255,0.35)' },
  EMPRESA: { label: 'Empresa',     color: '#f05aa6', bg: 'rgba(240,90,166,0.15)', border: 'rgba(240,90,166,0.35)' },
};

const parseJsonArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try { const p = JSON.parse(value); return Array.isArray(p) ? p : []; } catch { return []; }
};

export default function UserCard({ user, onFollow, onUnfollow, isFollowing, actions = true, children, onOpenProfile }) {
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  const cfg = ROLE_CONFIG[user.role] || ROLE_CONFIG.ALUMNO;

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
  const studentSkills = parseJsonArray(profile?.studentProfile?.skills);
  const studentProjects = parseJsonArray(profile?.studentProfile?.projects);

  return (
    <>
      <div className="fp-user-card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14, height: '100%', boxSizing: 'border-box' }}>
        {/* Header: avatar + nombre + rol */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{ flexShrink: 0, position: 'relative' }}>
            <img
              src={getAvatarUrl(user, 56)}
              alt={`${user.firstName} ${user.lastName}`}
              style={{ width: 56, height: 56, borderRadius: 16, display: 'block', boxShadow: `0 8px 24px ${cfg.color}44` }}
            />
            {/* Indicador de rol */}
            <span style={{
              position: 'absolute', bottom: -4, right: -4,
              width: 18, height: 18, borderRadius: '50%',
              background: cfg.color, border: '2px solid #0f172a',
              fontSize: 9, display: 'grid', placeItems: 'center',
            }}>
              {user.role === 'ALUMNO' ? '🎓' : user.role === 'CENTRO' ? '🏫' : '💼'}
            </span>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.firstName} {user.lastName}
            </div>
            <span style={{
              display: 'inline-block', marginTop: 4,
              fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999,
              background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color,
            }}>
              {cfg.label}
            </span>
          </div>

          {actions && (
            <button
              onClick={() => isFollowing ? onUnfollow(user.id) : onFollow(user.id)}
              style={{
                flexShrink: 0, height: 32, padding: '0 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                border: isFollowing ? `1px solid rgba(255,255,255,0.2)` : `1px solid ${cfg.border}`,
                background: isFollowing ? 'rgba(255,255,255,0.07)' : cfg.bg,
                color: isFollowing ? 'rgba(248,250,252,0.7)' : cfg.color,
                transition: 'all 0.16s ease',
              }}
            >
              {isFollowing ? '✓ Sig.' : '+ Seguir'}
            </button>
          )}
        </div>

        {/* Bio */}
        <p style={{
          margin: 0, fontSize: 13, lineHeight: 1.55,
          color: 'rgba(248,250,252,0.65)',
          display: '-webkit-box', WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
          flex: 1,
        }}>
          {user.bio || 'Sin descripción disponible.'}
        </p>

        {/* Localización si existe */}
        {user.location && (
          <div style={{ fontSize: 12, color: 'rgba(248,250,252,0.45)', display: 'flex', alignItems: 'center', gap: 4 }}>
            📍 {user.location}
          </div>
        )}

        {/* Botón ver perfil */}
        <button
          onClick={handleViewProfile}
          disabled={loadingProfile}
          style={{
            width: '100%', padding: '9px 0', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            border: `1px solid ${cfg.border}`,
            background: cfg.bg, color: cfg.color,
            opacity: loadingProfile ? 0.7 : 1,
            transition: 'all 0.16s ease',
          }}
        >
          {loadingProfile ? '⏳ Cargando...' : 'Ver perfil completo →'}
        </button>

        {children}
      </div>

      {/* MODAL DE PERFIL */}
      {(profile || profileError) && (
        <div
          onClick={closeProfile}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 16, backdropFilter: 'blur(6px)' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 580, maxHeight: '88vh', overflowY: 'auto',
              borderRadius: 20, border: '1px solid rgba(255,255,255,0.15)',
              background: 'linear-gradient(160deg, #0c1a14 0%, #0f1f2e 100%)',
              color: '#fff', boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
            }}
          >
            {/* Modal header con banner de color */}
            <div style={{
              height: 72, borderRadius: '20px 20px 0 0',
              background: `linear-gradient(135deg, ${cfg.color}cc, ${cfg.color}44)`,
              position: 'relative',
            }}>
              <button
                onClick={closeProfile}
                style={{ position: 'absolute', top: 12, right: 14, border: 'none', background: 'rgba(0,0,0,0.3)', color: '#fff', width: 30, height: 30, borderRadius: '50%', fontSize: 14, cursor: 'pointer', display: 'grid', placeItems: 'center' }}
              >✕</button>
            </div>

            <div style={{ padding: '0 24px 24px' }}>
              {/* Avatar sobre el banner */}
              <div style={{ marginTop: -32, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                {profile && (
                  <img
                    src={getAvatarUrl(profile, 64)}
                    alt=""
                    style={{ width: 64, height: 64, borderRadius: 18, border: '3px solid #0f1f2e', boxShadow: `0 8px 24px ${cfg.color}55` }}
                  />
                )}
                <span style={{
                  fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 999,
                  background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color,
                }}>
                  {cfg.label}
                </span>
              </div>

              {profileError && <div style={{ color: '#ff8c8c', fontSize: 13, marginBottom: 12 }}>{profileError}</div>}

              {profile && (
                <div style={{ display: 'grid', gap: 16 }}>
                  {/* Nombre y bio */}
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800 }}>{profile.firstName} {profile.lastName}</h3>
                    {profile.location && <div style={{ fontSize: 13, color: 'rgba(248,250,252,0.5)', marginBottom: 8 }}>📍 {profile.location}</div>}
                    {profile.bio && <p style={{ margin: 0, fontSize: 13, color: 'rgba(248,250,252,0.72)', lineHeight: 1.6 }}>{profile.bio}</p>}
                  </div>

                  {/* Datos de alumno */}
                  {profile.studentProfile && (
                    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.08)', display: 'grid', gap: 10 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: cfg.color, marginBottom: 2 }}>📋 Datos académicos</div>
                      {profile.studentProfile.cicle && <div style={{ fontSize: 13 }}><span style={{ color: 'rgba(248,250,252,0.5)' }}>Ciclo: </span>{profile.studentProfile.cicle}</div>}
                      {profile.studentProfile.specialization && <div style={{ fontSize: 13 }}><span style={{ color: 'rgba(248,250,252,0.5)' }}>Especialidad: </span>{profile.studentProfile.specialization}</div>}
                      {profile.studentProfile.experience && <div style={{ fontSize: 13 }}><span style={{ color: 'rgba(248,250,252,0.5)' }}>Experiencia: </span>{profile.studentProfile.experience}</div>}
                      {profile.studentProfile.seekingJob && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '4px 10px', borderRadius: 999, background: 'rgba(0,168,120,0.15)', border: '1px solid rgba(0,168,120,0.3)', color: '#7ce8c7', width: 'fit-content' }}>
                          ✅ Disponible para oportunidades
                        </div>
                      )}
                      {studentSkills.length > 0 && (
                        <div>
                          <div style={{ fontSize: 12, color: 'rgba(248,250,252,0.5)', marginBottom: 8 }}>Skills:</div>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {studentSkills.map(s => (
                              <span key={s} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 999, background: 'rgba(0,168,120,0.15)', border: '1px solid rgba(0,168,120,0.35)', color: '#7ce8c7' }}>{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {studentProjects.length > 0 && (
                        <div>
                          <div style={{ fontSize: 12, color: 'rgba(248,250,252,0.5)', marginBottom: 6 }}>Proyectos:</div>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {studentProjects.map(p => (
                              <span key={p} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>{p}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {profile.studentProfile.cvUrl && (
                        <a href={profile.studentProfile.cvUrl} target="_blank" rel="noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '6px 12px', borderRadius: 8, background: 'rgba(0,168,120,0.15)', border: '1px solid rgba(0,168,120,0.3)', color: '#7ce8c7', textDecoration: 'none', width: 'fit-content' }}>
                          📄 Ver CV
                        </a>
                      )}
                    </div>
                  )}

                  {/* Datos de centro */}
                  {profile.centerProfile && (
                    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.08)', display: 'grid', gap: 10 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: cfg.color, marginBottom: 2 }}>🏫 Información del centro</div>
                      {profile.centerProfile.centerName && <div style={{ fontSize: 13 }}><span style={{ color: 'rgba(248,250,252,0.5)' }}>Centro: </span>{profile.centerProfile.centerName}</div>}
                      {(profile.centerProfile.city || profile.centerProfile.province) && (
                        <div style={{ fontSize: 13 }}><span style={{ color: 'rgba(248,250,252,0.5)' }}>Ubicación: </span>{[profile.centerProfile.city, profile.centerProfile.province].filter(Boolean).join(', ')}</div>
                      )}
                      {parsedCicles.length > 0 && (
                        <div>
                          <div style={{ fontSize: 12, color: 'rgba(248,250,252,0.5)', marginBottom: 6 }}>Ciclos:</div>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {parsedCicles.map(c => (
                              <span key={c} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 999, background: 'rgba(79,140,255,0.15)', border: '1px solid rgba(79,140,255,0.35)', color: '#93c5fd' }}>{c}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Links */}
                  {(profile.linkedinUrl || profile.portfolioUrl) && (
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {profile.linkedinUrl && (
                        <a href={profile.linkedinUrl} target="_blank" rel="noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '6px 14px', borderRadius: 8, background: 'rgba(79,140,255,0.12)', border: '1px solid rgba(79,140,255,0.3)', color: '#93c5fd', textDecoration: 'none' }}>
                          🔗 LinkedIn
                        </a>
                      )}
                      {profile.portfolioUrl && (
                        <a href={profile.portfolioUrl} target="_blank" rel="noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '6px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: '#e2e8f0', textDecoration: 'none' }}>
                          🌐 Portfolio
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}