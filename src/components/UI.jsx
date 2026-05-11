// ── Shared reusable components ─────────────────────────────────────────────

export const Badge = ({ text, color = "00d97f" }) => (
  <span style={{
    background: `rgba(0, 217, 127, 0.15)`,
    color: `#a8f3d8`,
    border: `1.5px solid rgba(32, 224, 176, 0.4)`,
    borderRadius: 999,
    padding: "4px 11px",
    fontSize: 11,
    fontWeight: 700,
    fontFamily: "'Inter', sans-serif",
    whiteSpace: "nowrap",
    display: "inline-block",
    transition: "all 0.2s ease",
  }}>{text}</span>
);

export const Avatar = ({ iniciales, size = 40, bg = "00d97f" }) => (
  <div style={{
    width: size,
    height: size,
    borderRadius: size / 2,
    background: `linear-gradient(135deg, #00d97f, #20e0b0)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 800,
    fontSize: size * 0.35,
    fontFamily: "'Inter', sans-serif",
    flexShrink: 0,
    boxShadow: `0 8px 24px rgba(0, 217, 127, 0.35)`,
    letterSpacing: 0.8,
    border: "2px solid rgba(255, 255, 255, 0.15)",
  }}>{iniciales}</div>
);

export const Star = ({ filled = true }) => (
  <span style={{ color: filled ? "#F5C518" : "#ddd", fontSize: 13 }}>★</span>
);

export const StatCard = ({ value, label, icon, color = "00d97f" }) => (
  <div style={{
    background: `rgba(0, 217, 127, 0.1)`,
    borderRadius: 18,
    padding: "16px 20px",
    border: `1.5px solid rgba(32, 224, 176, 0.3)`,
    minWidth: 110,
    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
    cursor: "pointer",
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.background = `rgba(0, 217, 127, 0.18)`;
    e.currentTarget.style.boxShadow = `0 12px 30px rgba(0, 217, 127, 0.2)`;
    e.currentTarget.style.transform = `translateY(-4px)`;
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background = `rgba(0, 217, 127, 0.1)`;
    e.currentTarget.style.boxShadow = `none`;
    e.currentTarget.style.transform = `translateY(0)`;
  }}
  >
    <div style={{ fontSize: 26, marginBottom: 4 }}>{icon}</div>
    <div style={{ fontSize: 24, fontWeight: 800, color: `#a8f3d8`, lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 12, color: "rgba(168, 243, 216, 0.65)", marginTop: 4 }}>{label}</div>
  </div>
);

export const Button = ({ children, onClick, variant = "primary", color = "00d97f", size = "md", style = {} }) => {
  const sizes = { sm: "7px 14px", md: "11px 20px", lg: "14px 26px" };
  const fontSizes = { sm: 12, md: 14, lg: 15 };
  return (
    <button
      onClick={onClick}
      style={{
        background: variant === "primary"
          ? `linear-gradient(135deg, #00d97f, #20e0b0)`
          : variant === "outline"
          ? "transparent"
          : "rgba(255,255,255,0.9)",
        color: variant === "primary" ? "#fff" : `#00d97f`,
        border: variant === "outline" ? `1.5px solid rgba(32, 224, 176, 0.5)` : "none",
        borderRadius: 14,
        padding: sizes[size],
        fontSize: fontSizes[size],
        fontWeight: 700,
        cursor: "pointer",
        fontFamily: "'Inter', sans-serif",
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        boxShadow: variant === "primary" ? `0 12px 30px rgba(0, 217, 127, 0.3)` : "none",
        transition: "all 0.2s ease",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (variant === "primary") {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 16px 40px rgba(0, 217, 127, 0.4)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = `${variant === "primary" ? "0 12px 30px rgba(0, 217, 127, 0.3)" : "none"}`;
      }}
    >{children}</button>
  );
};

export const Card = ({ children, style = {} }) => (
  <div style={{
    background: "rgba(255, 255, 255, 0.06)",
    borderRadius: 20,
    padding: 24,
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.25)",
    backdropFilter: "blur(24px)",
    transition: "all 0.3s ease",
    ...style,
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.border = "1px solid rgba(32, 224, 176, 0.3)";
    e.currentTarget.style.background = "rgba(255, 255, 255, 0.075)";
    e.currentTarget.style.transform = "translateY(-4px)";
    e.currentTarget.style.boxShadow = "0 28px 80px rgba(0, 0, 0, 0.35)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.border = "1px solid rgba(255, 255, 255, 0.1)";
    e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "0 20px 60px rgba(0, 0, 0, 0.25)";
  }}
  >{children}</div>
);

export const Input = ({ placeholder, value, onChange, style = {} }) => (
  <input
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    style={{
      border: "1.5px solid rgba(255,255,255,0.18)",
      borderRadius: 12,
      padding: "11px 16px",
      fontSize: 14,
      fontFamily: "'Inter', sans-serif",
      outline: "none",
      background: "rgba(255,255,255,0.06)",
      color: "#f5f7fa",
      transition: "all 0.2s ease",
      ...style,
    }}
    onFocus={(e) => {
      e.currentTarget.style.borderColor = "rgba(32, 224, 176, 0.6)";
      e.currentTarget.style.background = "rgba(255,255,255,0.08)";
      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(32, 224, 176, 0.15)";
    }}
    onBlur={(e) => {
      e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
      e.currentTarget.style.background = "rgba(255,255,255,0.06)";
      e.currentTarget.style.boxShadow = "none";
    }}
  />
);

export const SectionTitle = ({ children, sub }) => (
  <div style={{ marginBottom: 24 }}>
    <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: "#f5f7fa", letterSpacing: -0.5 }}>{children}</h2>
    {sub && <p style={{ margin: "6px 0 0", fontSize: 14, color: "rgba(245, 247, 250, 0.65)" }}>{sub}</p>}
  </div>
);

// Top navigation bar shared across roles
export const NavBar = ({ rol, accentColor, tabs, activeTab, onTabChange, userInitials, onLogout }) => (
  <div style={{
    background: "rgba(4, 8, 10, 0.8)",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    padding: "0 28px",
    display: "flex",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.3)",
    backdropFilter: "blur(24px)",
  }}>
    {/* Logo */}
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 0", marginRight: 40, flexShrink: 0 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 12,
        background: `linear-gradient(135deg, #00d97f, #20e0b0)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, boxShadow: `0 12px 30px rgba(0, 217, 127, 0.35)`,
        fontWeight: 900,
        color: "#fff",
      }}>🌿</div>
      <span style={{ fontWeight: 900, fontSize: 18, color: "#f5f7fa", letterSpacing: -0.5 }}>
        FP<span style={{ color: `#00d97f` }}>Connect</span>
      </span>
    </div>

    {/* Tabs */}
    {tabs.map(t => (
      <button key={t.key} onClick={() => onTabChange(t.key)} style={{
        background: "none", border: "none", cursor: "pointer",
        padding: "16px 14px",
        borderBottom: `3px solid ${activeTab === t.key ? `#00d97f` : "transparent"}`,
        color: activeTab === t.key ? `#a8f3d8` : "rgba(245, 247, 250, 0.65)",
        fontWeight: activeTab === t.key ? 700 : 600,
        fontSize: 14, display: "flex", alignItems: "center", gap: 7,
        fontFamily: "'Inter', sans-serif",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        if (activeTab !== t.key) {
          e.currentTarget.style.color = "rgba(245, 247, 250, 0.85)";
        }
      }}
      onMouseLeave={(e) => {
        if (activeTab !== t.key) {
          e.currentTarget.style.color = "rgba(245, 247, 250, 0.65)";
        }
      }}
      >
        <span>{t.icon}</span>{t.label}
      </button>
    ))}

    {/* Right side */}
    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
      <span style={{ fontSize: 11, color: "rgba(245, 247, 250, 0.55)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{rol}</span>
      <Avatar iniciales={userInitials} size={36} bg="00d97f" />
      <button onClick={onLogout} style={{
        background: "rgba(255, 107, 122, 0.12)", border: "1.5px solid rgba(255, 107, 122, 0.3)", borderRadius: 10,
        padding: "7px 14px", fontSize: 13, color: "#ffb8c0", cursor: "pointer",
        fontFamily: "'Inter', sans-serif",
        fontWeight: 700,
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255, 107, 122, 0.2)";
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(255, 107, 122, 0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255, 107, 122, 0.12)";
        e.currentTarget.style.boxShadow = "none";
      }}
      >Salir</button>
    </div>
  </div>
);

export const PageWrapper = ({ children }) => (
  <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 28px" }}>
    {children}
  </div>
);
