import { useState } from "react";

const roles = [
  {
    key: "alumno",
    label: "Soy Alumno",
    icon: "🎓",
    desc: "Busca centros, sube tu CV y conecta con empresas para prácticas",
    color: "00A878",
    colorHex: "#00A878",
    initials: "CG",
    nombre: "Carmen García",
  },
  {
    key: "centro",
    label: "Soy Centro FP",
    icon: "🏫",
    desc: "Gestiona tu perfil, publica ciclos y atrae a los mejores alumnos",
    color: "2563EB",
    colorHex: "#2563EB",
    initials: "JP",
    nombre: "IES Politécnico",
  },
  {
    key: "empresa",
    label: "Soy Empresa",
    icon: "💼",
    desc: "Encuentra talento joven para prácticas, becas y empleo directo",
    color: "7C3AED",
    colorHex: "#7C3AED",
    initials: "ST",
    nombre: "Soluciones Tech SL",
  },
];

export default function LoginPage({ onLogin }) {
  const [selected, setSelected] = useState(null);
  const [hover, setHover] = useState(null);

  const handleLogin = () => {
    if (!selected) return;
    const rol = roles.find(r => r.key === selected);
    onLogin({ rol: selected, nombre: rol.nombre, initials: rol.initials, color: rol.color });
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0c1a14 0%, #0f1f2e 50%, #14101f 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
      padding: 20,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Ambient orbs */}
      <div style={{ position: "absolute", top: -120, right: -120, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, #00A87818 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -100, left: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, #7C3AED12 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "40%", left: "5%", width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, #2563EB10 0%, transparent 65%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 460, position: "relative" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 60, height: 60, borderRadius: 16,
            background: "linear-gradient(135deg, #00A878, #007A57)",
            fontSize: 28, marginBottom: 16,
            boxShadow: "0 8px 32px #00A87850",
          }}>🌿</div>
          <h1 style={{ margin: "0 0 6px", fontSize: 30, fontWeight: 800, color: "#fff", letterSpacing: -0.8 }}>
            FP<span style={{ color: "#00A878" }}>Connect</span>
          </h1>
          <p style={{ color: "#ffffff55", fontSize: 14, margin: 0, letterSpacing: 0.2 }}>
            Conecta alumnos, centros y empresas de FP en Andalucía
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(24px)",
          borderRadius: 22,
          border: "1px solid rgba(255,255,255,0.10)",
          padding: "32px 28px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
        }}>
          <h2 style={{ color: "#fff", fontSize: 17, fontWeight: 700, margin: "0 0 4px", textAlign: "center" }}>
            ¿Cómo quieres acceder?
          </h2>
          <p style={{ color: "#ffffff45", fontSize: 12, textAlign: "center", margin: "0 0 22px" }}>
            Selecciona tu perfil para continuar
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
            {roles.map(r => (
              <div
                key={r.key}
                onClick={() => setSelected(r.key)}
                onMouseEnter={() => setHover(r.key)}
                onMouseLeave={() => setHover(null)}
                style={{
                  background: selected === r.key
                    ? `${r.colorHex}1a`
                    : hover === r.key ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
                  border: `1.5px solid ${selected === r.key ? r.colorHex : "rgba(255,255,255,0.10)"}`,
                  borderRadius: 13,
                  padding: "15px 18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `${r.colorHex}20`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, flexShrink: 0,
                }}>{r.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    color: selected === r.key ? r.colorHex : "#ffffffdd",
                    fontWeight: 700, fontSize: 15,
                  }}>{r.label}</div>
                  <div style={{ color: "#ffffff45", fontSize: 12, marginTop: 2, lineHeight: 1.4 }}>{r.desc}</div>
                </div>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%",
                  background: selected === r.key ? r.colorHex : "rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, color: "#fff", flexShrink: 0,
                  transition: "all 0.2s",
                }}>
                  {selected === r.key ? "✓" : ""}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleLogin}
            disabled={!selected}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 13,
              border: "none",
              background: selected
                ? `linear-gradient(135deg, #${roles.find(r=>r.key===selected)?.color || "00A878"}, #${roles.find(r=>r.key===selected)?.color || "00A878"}aa)`
                : "rgba(255,255,255,0.07)",
              color: selected ? "#fff" : "rgba(255,255,255,0.25)",
              fontSize: 15,
              fontWeight: 700,
              cursor: selected ? "pointer" : "not-allowed",
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.25s",
              boxShadow: selected ? `0 8px 28px #${roles.find(r=>r.key===selected)?.color || "00A878"}40` : "none",
              letterSpacing: 0.2,
            }}
          >
            {selected
              ? `Entrar como ${roles.find(r=>r.key===selected)?.label} →`
              : "Selecciona un perfil para continuar"}
          </button>

          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 11, marginTop: 18, marginBottom: 0 }}>
            Demo TFG · FPConnect 2025 · React + Supabase
          </p>
        </div>
      </div>
    </div>
  );
}
