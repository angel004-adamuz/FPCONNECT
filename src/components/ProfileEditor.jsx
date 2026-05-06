import { useState, useEffect } from 'react';
import { usersService } from '../services';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';

export default function ProfileEditor({ user, role }) {
  const { fetchMe } = useAuthStore();
  const { showToast } = useUIStore();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    // Campos comunes
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
    location: user?.location || '',
    linkedinUrl: user?.linkedinUrl || '',
    portfolioUrl: user?.portfolioUrl || '',
    // Alumno
    cicle: user?.studentProfile?.cicle || '',
    skills: user?.studentProfile?.skills
      ? JSON.parse(user.studentProfile.skills).join(', ')
      : '',
    // Empresa
    industry: user?.enterpriseProfile?.industry || '',
    description: user?.enterpriseProfile?.description || '',
    website: user?.enterpriseProfile?.website || '',
    // Centro
    centerName: user?.centerProfile?.centerName || '',
    province: user?.centerProfile?.province || '',
    cicles: user?.centerProfile?.cicles
      ? JSON.parse(user.centerProfile.cicles).join(', ')
      : '',
  });

  useEffect(() => {
    const handler = () => setEditing(true);
    window.addEventListener('fp-edit-profile', handler);
    return () => window.removeEventListener('fp-edit-profile', handler);
  }, []);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

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

      if (role === 'ALUMNO') {
        updates.studentProfile = {
          cicle: form.cicle,
          skills: JSON.stringify(
            form.skills.split(',').map(s => s.trim()).filter(Boolean)
          ),
        };
      }

      if (role === 'EMPRESA') {
        updates.enterpriseProfile = {
          industry: form.industry,
          description: form.description,
          city: form.location,
          website: form.website,
        };
      }

      if (role === 'CENTRO') {
        updates.centerProfile = {
          centerName: form.centerName,
          province: form.province,
          city: form.location,
          cicles: JSON.stringify(
            form.cicles.split(',').map(s => s.trim()).filter(Boolean)
          ),
        };
      }

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

  const fieldStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.15)',
    background: editing ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
    color: '#fff',
    fontSize: 14,
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    outline: 'none',
  };

  const labelStyle = {
    display: 'block',
    color: '#ffffff88',
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 6,
  };

  const roleColor = role === 'EMPRESA' ? '#EC4899' : role === 'CENTRO' ? '#2563EB' : '#00A878';
  const roleLabel = role === 'EMPRESA' ? '🏢 Empresa' : role === 'CENTRO' ? '🏫 Centro FP' : '🎓 Alumno';

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>👤 Mi Perfil</h2>
        {editing && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setEditing(false)}
              style={{
                padding: '10px 20px', borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'transparent', color: '#fff',
                fontWeight: 700, cursor: 'pointer', fontSize: 14,
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '10px 20px', borderRadius: 10, border: 'none',
                background: saving ? 'rgba(0,168,120,0.5)' : `linear-gradient(135deg, ${roleColor}, ${roleColor}cc)`,
                color: '#fff', fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer', fontSize: 14,
              }}
            >
              {saving ? '⏳ Guardando...' : '💾 Guardar'}
            </button>
          </div>
        )}
      </div>

      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: `linear-gradient(135deg, ${roleColor}, ${roleColor}99)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, fontWeight: 700, flexShrink: 0,
        }}>
          {user?.firstName?.[0]?.toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{user?.firstName} {user?.lastName}</div>
          <div style={{ color: '#ffffff88', fontSize: 14 }}>{user?.email}</div>
          <div style={{ color: roleColor, fontSize: 13, marginTop: 4 }}>{roleLabel}</div>
        </div>
      </div>

      {/* Campos comunes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
        <div>
          <label style={labelStyle}>Nombre</label>
          <input name="firstName" value={form.firstName} onChange={handleChange} disabled={!editing} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>Apellidos</label>
          <input name="lastName" value={form.lastName} onChange={handleChange} disabled={!editing} style={fieldStyle} />
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={labelStyle}>Bio</label>
        <textarea
          name="bio" value={form.bio} onChange={handleChange}
          disabled={!editing} rows={3} placeholder="Cuéntanos algo..."
          style={{ ...fieldStyle, resize: 'vertical' }}
        />
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={labelStyle}>Ciudad</label>
        <input name="location" value={form.location} onChange={handleChange} disabled={!editing} placeholder="Ej: Sevilla" style={fieldStyle} />
      </div>

      {/* Campos específicos ALUMNO */}
      {role === 'ALUMNO' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
            <div>
              <label style={labelStyle}>Ciclo formativo</label>
              <input name="cicle" value={form.cicle} onChange={handleChange} disabled={!editing} placeholder="Ej: DAM, DAW, ASIR..." style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>Skills (separadas por comas)</label>
              <input name="skills" value={form.skills} onChange={handleChange} disabled={!editing} placeholder="Ej: React, Java, Python..." style={fieldStyle} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
            <div>
              <label style={labelStyle}>LinkedIn</label>
              <input name="linkedinUrl" value={form.linkedinUrl} onChange={handleChange} disabled={!editing} placeholder="https://linkedin.com/in/..." style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>Portfolio</label>
              <input name="portfolioUrl" value={form.portfolioUrl} onChange={handleChange} disabled={!editing} placeholder="https://tuportfolio.com" style={fieldStyle} />
            </div>
          </div>
        </>
      )}

      {/* Campos específicos EMPRESA */}
      {role === 'EMPRESA' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
            <div>
              <label style={labelStyle}>Sector / Industria</label>
              <input name="industry" value={form.industry} onChange={handleChange} disabled={!editing} placeholder="Ej: Tecnología, Logística..." style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>Web corporativa</label>
              <input name="website" value={form.website} onChange={handleChange} disabled={!editing} placeholder="https://tuempresa.com" style={fieldStyle} />
            </div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Descripción de la empresa</label>
            <textarea
              name="description" value={form.description} onChange={handleChange}
              disabled={!editing} rows={3} placeholder="Describe tu empresa..."
              style={{ ...fieldStyle, resize: 'vertical' }}
            />
          </div>
        </>
      )}

      {/* Campos específicos CENTRO */}
      {role === 'CENTRO' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
            <div>
              <label style={labelStyle}>Nombre del centro</label>
              <input name="centerName" value={form.centerName} onChange={handleChange} disabled={!editing} placeholder="Ej: IES Mediterráneo" style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>Provincia</label>
              <input name="province" value={form.province} onChange={handleChange} disabled={!editing} placeholder="Ej: Sevilla, Málaga..." style={fieldStyle} />
            </div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Ciclos impartidos (separados por comas)</label>
            <input name="cicles" value={form.cicles} onChange={handleChange} disabled={!editing} placeholder="Ej: DAM, DAW, ASIR, SMR..." style={fieldStyle} />
          </div>
        </>
      )}
    </div>
  );
}