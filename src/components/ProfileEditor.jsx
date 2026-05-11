import { useState } from 'react';
import { usersService } from '../services';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';

const getAvatarUrl = (user, size = 80) => {
  const name = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'FP';
  const color = user?.role === 'CENTRO' ? '2563EB' : user?.role === 'EMPRESA' ? 'EC4899' : '00A878';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=fff&size=${size}&bold=true&rounded=true`;
};

const parseJsonArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try { const p = JSON.parse(value); return Array.isArray(p) ? p : []; } catch { return []; }
};

export default function ProfileEditor({ user, role, accentColor = '#00A878' }) {
  const { fetchMe } = useAuthStore();
  const { showToast } = useUIStore();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
    location: user?.location || '',
    linkedinUrl: user?.linkedinUrl || '',
    portfolioUrl: user?.portfolioUrl || '',
    cicle: user?.studentProfile?.cicle || '',
    skills: parseJsonArray(user?.studentProfile?.skills).join(', '),
    companyName: user?.enterpriseProfile?.companyName || '',
    industry: user?.enterpriseProfile?.industry || '',
    website: user?.enterpriseProfile?.website || '',
    description: user?.enterpriseProfile?.description || '',
    city: user?.enterpriseProfile?.city || '',
    centerName: user?.centerProfile?.centerName || '',
    centerCity: user?.centerProfile?.city || '',
    centerProvince: user?.centerProfile?.province || '',
    director: user?.centerProfile?.director || '',
    cicles: parseJsonArray(user?.centerProfile?.cicles).join(', '),
  });

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = {
        firstName: form.firstName,
        lastName: form.lastName,
        bio: form.bio,
        location: form.location,
        linkedinUrl: form.linkedinUrl,
        portfolioUrl: form.portfolioUrl,
      };
      if (role === 'ALUMNO') updates.studentProfile = { cicle: form.cicle, skills: JSON.stringify(form.skills.split(',').map(s => s.trim()).filter(Boolean)) };
      if (role === 'EMPRESA') updates.enterpriseProfile = { companyName: form.companyName, industry: form.industry, website: form.website, description: form.description, city: form.city };
      if (role === 'CENTRO') updates.centerProfile = { centerName: form.centerName, city: form.centerCity, province: form.centerProvince, director: form.director, cicles: JSON.stringify(form.cicles.split(',').map(s => s.trim()).filter(Boolean)) };

      await usersService.updateProfile(updates);
      await fetchMe();
      setEditing(false);
      showToast('Perfil actualizado correctamente', 'success');
    } catch (err) {
      showToast(err.message || 'Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const roleLabel = role === 'ALUMNO' ? '🎓 Alumno' : role === 'EMPRESA' ? '💼 Empresa' : '🏫 Centro FP';

  const fieldStyle = (disabled) => ({
    width: '100%', padding: '12px 14px', borderRadius: 10, fontSize: 14,
    border: `1px solid ${disabled ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.18)'}`,
    background: disabled ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.07)',
    color: disabled ? 'rgba(248,250,252,0.7)' : '#fff',
    boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none',
    transition: 'border-color 0.16s, background 0.16s',
  });

  const labelStyle = { display: 'block', color: 'rgba(248,250,252,0.55)', fontSize: 12, fontWeight: 700, marginBottom: 6, letterSpacing: '0.03em' };

  const skills = parseJsonArray(user?.studentProfile?.skills);
  const cicles = parseJsonArray(user?.centerProfile?.cicles);

  return (
    <div style={{ maxWidth: 720 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Mi Perfil</h2>
        {!editing ? (
          <button onClick={() => setEditing(true)} style={{ padding: '10px 22px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14, boxShadow: `0 8px 24px ${accentColor}44` }}>
            ✏️ Editar perfil
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setEditing(false)} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
              Cancelar
            </button>
            <button onClick={handleSave} disabled={saving} style={{ padding: '10px 22px', borderRadius: 10, border: 'none', background: saving ? `${accentColor}66` : `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`, color: '#fff', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontSize: 14, boxShadow: saving ? 'none' : `0 8px 24px ${accentColor}44` }}>
              {saving ? '⏳ Guardando...' : '💾 Guardar'}
            </button>
          </div>
        )}
      </div>

      {/* Avatar card */}
      <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', padding: '20px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
        <img
          src={getAvatarUrl(user, 72)}
          alt=""
          style={{ width: 72, height: 72, borderRadius: 18, boxShadow: `0 8px 28px ${accentColor}55`, flexShrink: 0 }}
        />
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{user?.firstName} {user?.lastName}</div>
          <div style={{ color: 'rgba(248,250,252,0.5)', fontSize: 13, marginBottom: 6 }}>{user?.email}</div>
          <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 999, background: `${accentColor}22`, border: `1px solid ${accentColor}55`, color: accentColor }}>
            {roleLabel}
          </span>
        </div>

        {/* Vista rápida de skills/ciclos en modo lectura */}
        {!editing && (
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            {role === 'ALUMNO' && skills.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: 260 }}>
                {skills.slice(0, 4).map(s => (
                  <span key={s} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 999, background: 'rgba(0,168,120,0.15)', border: '1px solid rgba(0,168,120,0.3)', color: '#7ce8c7' }}>{s}</span>
                ))}
                {skills.length > 4 && <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 999, background: 'rgba(255,255,255,0.07)', color: 'rgba(248,250,252,0.5)' }}>+{skills.length - 4}</span>}
              </div>
            )}
            {role === 'CENTRO' && cicles.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: 260 }}>
                {cicles.slice(0, 4).map(c => (
                  <span key={c} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 999, background: 'rgba(79,140,255,0.15)', border: '1px solid rgba(79,140,255,0.3)', color: '#93c5fd' }}>{c}</span>
                ))}
                {cicles.length > 4 && <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 999, background: 'rgba(255,255,255,0.07)', color: 'rgba(248,250,252,0.5)' }}>+{cicles.length - 4}</span>}
              </div>
            )}
            {user?.location && <div style={{ fontSize: 12, color: 'rgba(248,250,252,0.4)', marginTop: 8 }}>📍 {user.location}</div>}
          </div>
        )}
      </div>

      {/* Sección campos comunes */}
      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)', padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(248,250,252,0.5)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Información básica</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div><label style={labelStyle}>Nombre</label><input name="firstName" value={form.firstName} onChange={handleChange} disabled={!editing} style={fieldStyle(!editing)} /></div>
          <div><label style={labelStyle}>Apellidos</label><input name="lastName" value={form.lastName} onChange={handleChange} disabled={!editing} style={fieldStyle(!editing)} /></div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Bio</label>
          <textarea name="bio" value={form.bio} onChange={handleChange} disabled={!editing} rows={3} placeholder="Cuéntanos algo..." style={{ ...fieldStyle(!editing), resize: 'vertical' }} />
        </div>
        <div>
          <label style={labelStyle}>Ciudad</label>
          <input name="location" value={form.location} onChange={handleChange} disabled={!editing} placeholder="Ej: Sevilla" style={fieldStyle(!editing)} />
        </div>
      </div>

      {/* Campos específicos por rol */}
      {role === 'ALUMNO' && (
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)', padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(0,168,120,0.7)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>🎓 Datos académicos</div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Ciclo formativo</label>
            <input name="cicle" value={form.cicle} onChange={handleChange} disabled={!editing} placeholder="Ej: DAM, DAW, ASIR..." style={fieldStyle(!editing)} />
          </div>
          <div>
            <label style={labelStyle}>Skills (separadas por comas)</label>
            <input name="skills" value={form.skills} onChange={handleChange} disabled={!editing} placeholder="Ej: React, Java, Python..." style={fieldStyle(!editing)} />
          </div>
        </div>
      )}

      {role === 'EMPRESA' && (
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)', padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(240,90,166,0.7)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>💼 Datos de empresa</div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Nombre de la empresa</label>
            <input name="companyName" value={form.companyName} onChange={handleChange} disabled={!editing} placeholder="Ej: Tech Solutions SL" style={fieldStyle(!editing)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label style={labelStyle}>Sector</label><input name="industry" value={form.industry} onChange={handleChange} disabled={!editing} placeholder="Ej: Tecnología" style={fieldStyle(!editing)} /></div>
            <div><label style={labelStyle}>Ciudad</label><input name="city" value={form.city} onChange={handleChange} disabled={!editing} placeholder="Ej: Málaga" style={fieldStyle(!editing)} /></div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Web</label>
            <input name="website" value={form.website} onChange={handleChange} disabled={!editing} placeholder="https://tuempresa.com" style={fieldStyle(!editing)} />
          </div>
          <div>
            <label style={labelStyle}>Descripción</label>
            <textarea name="description" value={form.description} onChange={handleChange} disabled={!editing} rows={3} placeholder="Describe tu empresa..." style={{ ...fieldStyle(!editing), resize: 'vertical' }} />
          </div>
        </div>
      )}

      {role === 'CENTRO' && (
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)', padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(79,140,255,0.7)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>🏫 Datos del centro</div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Nombre del centro</label>
            <input name="centerName" value={form.centerName} onChange={handleChange} disabled={!editing} placeholder="Ej: IES Mediterráneo" style={fieldStyle(!editing)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label style={labelStyle}>Ciudad</label><input name="centerCity" value={form.centerCity} onChange={handleChange} disabled={!editing} placeholder="Ej: Almería" style={fieldStyle(!editing)} /></div>
            <div><label style={labelStyle}>Provincia</label><input name="centerProvince" value={form.centerProvince} onChange={handleChange} disabled={!editing} placeholder="Ej: Almería" style={fieldStyle(!editing)} /></div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Director/a</label>
            <input name="director" value={form.director} onChange={handleChange} disabled={!editing} placeholder="Nombre del director/a" style={fieldStyle(!editing)} />
          </div>
          <div>
            <label style={labelStyle}>Ciclos que se imparten (separados por comas)</label>
            <input name="cicles" value={form.cicles} onChange={handleChange} disabled={!editing} placeholder="Ej: DAM, DAW, ASIR, SMR..." style={fieldStyle(!editing)} />
          </div>
        </div>
      )}

      {/* Links */}
      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)', padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(248,250,252,0.5)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>🔗 Enlaces</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div><label style={labelStyle}>LinkedIn</label><input name="linkedinUrl" value={form.linkedinUrl} onChange={handleChange} disabled={!editing} placeholder="https://linkedin.com/in/..." style={fieldStyle(!editing)} /></div>
          <div><label style={labelStyle}>Portfolio / Web</label><input name="portfolioUrl" value={form.portfolioUrl} onChange={handleChange} disabled={!editing} placeholder="https://tuportfolio.com" style={fieldStyle(!editing)} /></div>
        </div>
      </div>
    </div>
  );
}