import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services';

export default function LoginPage() {
  const { login, register, isLoading, error, clearError, user, isAuthenticated } = useAuthStore();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [selected, setSelected] = useState('ALUMNO');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'ALUMNO',
    recoveryQuestion: '',
    recoveryAnswer: '',
  });
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState(1);
  const [isRecoveryLoading, setIsRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');
  const [recoveryMessage, setRecoveryMessage] = useState('');
  const [recoveryData, setRecoveryData] = useState({
    email: '',
    question: '',
    answer: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      // Aquí irías a la página correspondiente según el rol
      console.log('✓ Usuario autenticado:', user);
    }
  }, [isAuthenticated, user]);

  const roles = [
    {
      key: 'ALUMNO',
      label: 'Soy Alumno',
      icon: '🎓',
      desc: 'Busca centros, sube tu CV y conecta con empresas para prácticas',
      color: '00A878',
    },
    {
      key: 'CENTRO',
      label: 'Soy Centro FP',
      icon: '🏫',
      desc: 'Gestiona tu perfil, publica ciclos y atrae a los mejores alumnos',
      color: '2563EB',
    },
    {
      key: 'EMPRESA',
      label: 'Soy Empresa',
      icon: '💼',
      desc: 'Encuentra talento joven para prácticas, becas y empleo directo',
      color: '7C3AED',
    },
  ];

  const handleRoleSelect = (roleKey) => {
    setSelected(roleKey);
    setFormData((prev) => ({ ...prev, role: roleKey }));
    clearError();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearError();
  };

  const resetRecoveryState = () => {
    setRecoveryStep(1);
    setRecoveryError('');
    setRecoveryMessage('');
    setRecoveryData({
      email: formData.email || '',
      question: '',
      answer: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleRecoveryChange = (e) => {
    const { name, value } = e.target;
    setRecoveryData((prev) => ({ ...prev, [name]: value }));
    setRecoveryError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isLoginMode) {
        await login(formData.email, formData.password);
      } else {
        if (!formData.firstName || !formData.lastName || !formData.recoveryQuestion || !formData.recoveryAnswer) {
          alert('Por favor completa todos los campos');
          return;
        }
        await register(formData);
      }
    } catch (err) {
      console.error('Auth error:', err);
    }
  };

  const handleRecoveryStepOne = async (e) => {
    e.preventDefault();
    setIsRecoveryLoading(true);
    setRecoveryError('');
    setRecoveryMessage('');

    try {
      const response = await authService.getRecoveryChallenge(recoveryData.email);
      if (!response?.data?.hasChallenge) {
        setRecoveryError('Este usuario no tiene recuperación configurada. Contacta soporte.');
        return;
      }

      setRecoveryData((prev) => ({
        ...prev,
        question: response.data.recoveryQuestion,
      }));
      setRecoveryStep(2);
    } catch (err) {
      setRecoveryError(err.message || 'No se pudo iniciar la recuperación');
    } finally {
      setIsRecoveryLoading(false);
    }
  };

  const handleRecoveryStepTwo = async (e) => {
    e.preventDefault();
    setRecoveryError('');
    setRecoveryMessage('');

    if (recoveryData.newPassword.length < 8) {
      setRecoveryError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (recoveryData.newPassword !== recoveryData.confirmPassword) {
      setRecoveryError('Las contraseñas no coinciden');
      return;
    }

    setIsRecoveryLoading(true);
    try {
      await authService.resetPasswordWithRecovery({
        email: recoveryData.email,
        recoveryAnswer: recoveryData.answer,
        newPassword: recoveryData.newPassword,
      });

      setRecoveryMessage('Contraseña actualizada. Ya puedes iniciar sesión.');
      setIsRecoveryMode(false);
      setIsLoginMode(true);
      setFormData((prev) => ({ ...prev, email: recoveryData.email, password: '' }));
    } catch (err) {
      setRecoveryError(err.message || 'No se pudo restablecer la contraseña');
    } finally {
      setIsRecoveryLoading(false);
    }
  };


  return (
    <div className="fp-login-shell">
      <div className="fp-login-card">
        <section className="fp-login-hero" aria-label="Presentación FPConnect">
          <div className="fp-login-kicker">Red FP para estudiar, conectar y encontrar oportunidades</div>
          <h1 className="fp-login-title">
            Tu red profesional empieza antes del primer contrato
          </h1>
          <p className="fp-login-copy">
            Explora centros, descubre empresas, comparte proyectos y crea una red que acompañe tu etapa de FP sin parecer una plataforma aburrida.
          </p>
          <div className="fp-login-metrics" aria-label="Ventajas principales">
            <div className="fp-login-metric">
              <strong>3 roles</strong>
              <span>Alumnos, centros y empresas en el mismo espacio.</span>
            </div>
            <div className="fp-login-metric">
              <strong>Feed vivo</strong>
              <span>Publicaciones, comentarios y perfiles para explorar.</span>
            </div>
            <div className="fp-login-metric">
              <strong>FP real</strong>
              <span>Centros, prácticas, noticias y talento técnico.</span>
            </div>
          </div>
        </section>

        <section className="fp-auth-panel" aria-label="Acceso a FPConnect">
          <div style={{ marginBottom: 24 }}>
            <div className="fp-brand" style={{ marginBottom: 10 }}>
              <span className="fp-brand__mark">FP</span>
              <span>FP<span className="fp-brand__accent">Connect</span></span>
            </div>
            <p style={{ color: 'var(--fp-muted)', fontSize: 14, lineHeight: 1.5, margin: 0 }}>
              Entra y sigue explorando comunidad, centros y oportunidades.
            </p>
          </div>
          {/* Mode Toggle */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <button
              onClick={() => {
                setIsRecoveryMode(false);
                setIsLoginMode(true);
                clearError();
                resetRecoveryState();
              }}
              style={{
                flex: 1,
                padding: '10px 16px',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                background: isLoginMode
                  ? 'linear-gradient(135deg, #00A878, #007A57)'
                  : 'rgba(255,255,255,0.08)',
                color: '#fff',
                transition: 'all 0.3s ease',
              }}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => {
                setIsRecoveryMode(false);
                setIsLoginMode(false);
                clearError();
                resetRecoveryState();
              }}
              style={{
                flex: 1,
                padding: '10px 16px',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                background: !isLoginMode
                  ? 'linear-gradient(135deg, #00A878, #007A57)'
                  : 'rgba(255,255,255,0.08)',
                color: '#fff',
                transition: 'all 0.3s ease',
              }}
            >
              Registrarse
            </button>
          </div>

          {/* Error Message */}
          {!isRecoveryMode && error && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                borderRadius: 10,
                padding: '12px 14px',
                marginBottom: 20,
                color: '#fca5a5',
                fontSize: 13,
              }}
            >
              ❌ {error}
            </div>
          )}

          {isRecoveryMode && recoveryError && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                borderRadius: 10,
                padding: '12px 14px',
                marginBottom: 20,
                color: '#fca5a5',
                fontSize: 13,
              }}
            >
              ❌ {recoveryError}
            </div>
          )}

          {recoveryMessage && (
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: 10,
                padding: '12px 14px',
                marginBottom: 20,
                color: '#6ee7b7',
                fontSize: 13,
              }}
            >
              ✅ {recoveryMessage}
            </div>
          )}

          {isRecoveryMode ? (
            <form onSubmit={recoveryStep === 1 ? handleRecoveryStepOne : handleRecoveryStepTwo}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', color: '#ffffff88', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                  Email de la cuenta
                </label>
                <input
                  type="email"
                  name="email"
                  value={recoveryData.email}
                  onChange={handleRecoveryChange}
                  placeholder="tu@email.com"
                  required
                  disabled={recoveryStep === 2}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    fontSize: 14,
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              {recoveryStep === 2 && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', color: '#ffffff88', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                      Pregunta de seguridad
                    </label>
                    <div
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: 10,
                        border: '1px solid rgba(255,255,255,0.15)',
                        background: 'rgba(255,255,255,0.05)',
                        color: '#fff',
                        fontSize: 14,
                        boxSizing: 'border-box',
                      }}
                    >
                      {recoveryData.question}
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', color: '#ffffff88', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                      Tu respuesta
                    </label>
                    <input
                      type="text"
                      name="answer"
                      value={recoveryData.answer}
                      onChange={handleRecoveryChange}
                      placeholder="Escribe tu respuesta"
                      required
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: 10,
                        border: '1px solid rgba(255,255,255,0.15)',
                        background: 'rgba(255,255,255,0.05)',
                        color: '#fff',
                        fontSize: 14,
                        boxSizing: 'border-box',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', color: '#ffffff88', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                      Nueva contraseña
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={recoveryData.newPassword}
                      onChange={handleRecoveryChange}
                      placeholder="Mínimo 8 caracteres"
                      required
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: 10,
                        border: '1px solid rgba(255,255,255,0.15)',
                        background: 'rgba(255,255,255,0.05)',
                        color: '#fff',
                        fontSize: 14,
                        boxSizing: 'border-box',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', color: '#ffffff88', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                      Repite la nueva contraseña
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={recoveryData.confirmPassword}
                      onChange={handleRecoveryChange}
                      placeholder="Repite la contraseña"
                      required
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: 10,
                        border: '1px solid rgba(255,255,255,0.15)',
                        background: 'rgba(255,255,255,0.05)',
                        color: '#fff',
                        fontSize: 14,
                        boxSizing: 'border-box',
                        outline: 'none',
                      }}
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isRecoveryLoading}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: 12,
                  border: 'none',
                  background: isRecoveryLoading
                    ? 'rgba(0, 168, 120, 0.5)'
                    : 'linear-gradient(135deg, #00A878, #007A57)',
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: isRecoveryLoading ? 'not-allowed' : 'pointer',
                  opacity: isRecoveryLoading ? 0.7 : 1,
                }}
              >
                {isRecoveryLoading
                  ? '⏳ Procesando...'
                  : recoveryStep === 1
                    ? 'Verificar pregunta de seguridad'
                    : 'Restablecer contraseña'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsRecoveryMode(false);
                  resetRecoveryState();
                }}
                style={{
                  width: '100%',
                  marginTop: 10,
                  padding: '10px 16px',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'transparent',
                  color: '#ffffffcc',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Volver a inicio de sesión
              </button>
            </form>
          ) : (
          <form onSubmit={handleSubmit}>
            {/* Email Input */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: '#ffffff88', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="tu@email.com"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#fff',
                  fontSize: 14,
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(0, 168, 120, 0.5)';
                  e.target.style.background = 'rgba(0, 168, 120, 0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.15)';
                  e.target.style.background = 'rgba(255,255,255,0.05)';
                }}
              />
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: isLoginMode ? 24 : 16 }}>
              <label style={{ display: 'block', color: '#ffffff88', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#fff',
                  fontSize: 14,
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(0, 168, 120, 0.5)';
                  e.target.style.background = 'rgba(0, 168, 120, 0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.15)';
                  e.target.style.background = 'rgba(255,255,255,0.05)';
                }}
              />
            </div>

            {/* Register Specific Fields */}
            {!isLoginMode && (
              <>
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', color: '#ffffff88', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                      Nombre
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Juan"
                      required={!isLoginMode}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: 10,
                        border: '1px solid rgba(255,255,255,0.15)',
                        background: 'rgba(255,255,255,0.05)',
                        color: '#fff',
                        fontSize: 14,
                        boxSizing: 'border-box',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', color: '#ffffff88', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                      Apellido
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Pérez"
                      required={!isLoginMode}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: 10,
                        border: '1px solid rgba(255,255,255,0.15)',
                        background: 'rgba(255,255,255,0.05)',
                        color: '#fff',
                        fontSize: 14,
                        boxSizing: 'border-box',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Role Selection */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', color: '#ffffff88', fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
                    Selecciona tu perfil
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {roles.map((role) => (
                      <button
                        key={role.key}
                        type="button"
                        onClick={() => handleRoleSelect(role.key)}
                        style={{
                          padding: '14px 16px',
                          borderRadius: 12,
                          border: selected === role.key ? `2px solid #${role.color}` : '1px solid rgba(255,255,255,0.15)',
                          background:
                            selected === role.key
                              ? `rgba(${parseInt(role.color.slice(0, 2), 16)}, ${parseInt(role.color.slice(2, 4), 16)}, ${parseInt(role.color.slice(4, 6), 16)}, 0.15)`
                              : 'rgba(255,255,255,0.05)',
                          color: '#fff',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          fontSize: 14,
                          fontWeight: 500,
                        }}
                      >
                        <span style={{ fontSize: 16, marginRight: 8 }}>{role.icon}</span>
                        <strong>{role.label}</strong>
                        <p style={{ margin: '4px 0 0 24px', fontSize: 12, color: '#ffffff66' }}>
                          {role.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', color: '#ffffff88', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                    Pregunta de seguridad personalizada
                  </label>
                  <input
                    type="text"
                    name="recoveryQuestion"
                    value={formData.recoveryQuestion}
                    onChange={handleInputChange}
                    placeholder="Ej: ¿Cómo se llama tu primer tutor?"
                    required={!isLoginMode}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.15)',
                      background: 'rgba(255,255,255,0.05)',
                      color: '#fff',
                      fontSize: 14,
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', color: '#ffffff88', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                    Respuesta de seguridad
                  </label>
                  <input
                    type="text"
                    name="recoveryAnswer"
                    value={formData.recoveryAnswer}
                    onChange={handleInputChange}
                    placeholder="Tu respuesta secreta"
                    required={!isLoginMode}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.15)',
                      background: 'rgba(255,255,255,0.05)',
                      color: '#fff',
                      fontSize: 14,
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 12,
                border: 'none',
                background: isLoading
                  ? 'rgba(0, 168, 120, 0.5)'
                  : 'linear-gradient(135deg, #00A878, #007A57)',
                color: '#fff',
                fontSize: 15,
                fontWeight: 700,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: isLoading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isLoading) e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
              }}
            >
              {isLoading ? '⏳ Procesando...' : isLoginMode ? 'Iniciar Sesión' : 'Registrarse'}
            </button>

            {isLoginMode && (
              <button
                type="button"
                onClick={() => {
                  setIsRecoveryMode(true);
                  clearError();
                  resetRecoveryState();
                }}
                style={{
                  marginTop: 10,
                  width: '100%',
                  border: 'none',
                  background: 'transparent',
                  color: '#7dd3fc',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            )}
          </form>
          )}
          <p style={{ textAlign: 'center', color: 'var(--fp-soft)', fontSize: 12, marginTop: 20 }}>
            Plataforma social para FP desde Andalucía
          </p>
        </section>

      </div>
    </div>
  );
}
