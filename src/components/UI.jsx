// ── Shared reusable components ─────────────────────────────────────────────

export const Badge = ({ text, color = "00A878" }) => (
  <span style={{
    background: `#${color}18`,
    color: `#${color}`,
    border: `1px solid #${color}40`,
    borderRadius: 6,
    padding: "2px 9px",
    fontSize: 11,
    fontWeight: 700,
    fontFamily: "'DM Sans', sans-serif",
    whiteSpace: "nowrap",
    display: "inline-block",
  }}>{text}</span>
);

export const Avatar = ({ iniciales, size = 40, bg = "00A878" }) => (
  <div style={{
    width: size,
    height: size,
    borderRadius: size / 2,
    background: `linear-gradient(135deg, #${bg}, #${bg}bb)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 800,
    fontSize: size * 0.33,
    fontFamily: "'DM Sans', sans-serif",
    flexShrink: 0,
    boxShadow: `0 4px 14px #${bg}40`,
    letterSpacing: 0.5,
  }}>{iniciales}</div>
);

export const Star = ({ filled = true }) => (
  <span style={{ color: filled ? "#F5C518" : "#ddd", fontSize: 13 }}>★</span>
);

export const StatCard = ({ value, label, icon, color = "00A878" }) => (
  <div style={{
    background: `#${color}14`,
    borderRadius: 12,
    padding: "14px 18px",
    border: `1px solid #${color}25`,
    minWidth: 100,
  }}>
    <div style={{ fontSize: 24, marginBottom: 2 }}>{icon}</div>
    <div style={{ fontSize: 22, fontWeight: 800, color: `#${color}`, lineHeight: 1.1 }}>{value}</div>
    <div style={{ fontSize: 11, color: "#888", marginTop: 3 }}>{label}</div>
  </div>
);

export const Button = ({ children, onClick, variant = "primary", color = "00A878", size = "md", style = {} }) => {
  const sizes = { sm: "6px 12px", md: "10px 18px", lg: "13px 24px" };
  const fontSizes = { sm: 12, md: 13, lg: 15 };
  return (
    <button
      onClick={onClick}
      style={{
        background: variant === "primary"
          ? `linear-gradient(135deg, #${color}, #${color}cc)`
          : variant === "outline"
          ? "transparent"
          : "#f5f5f5",
        color: variant === "primary" ? "#fff" : `#${color}`,
        border: variant === "outline" ? `1.5px solid #${color}` : "none",
        borderRadius: 9,
        padding: sizes[size],
        fontSize: fontSizes[size],
        fontWeight: 700,
        cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        boxShadow: variant === "primary" ? `0 4px 14px #${color}30` : "none",
        transition: "opacity 0.15s",
        ...style,
      }}
    >{children}</button>
  );
};

export const Card = ({ children, style = {} }) => (
  <div style={{
    background: "#fff",
    borderRadius: 14,
    padding: 20,
    border: "1px solid #f0f0f0",
    boxShadow: "0 2px 12px #00000008",
    ...style,
  }}>{children}</div>
);

export const Input = ({ placeholder, value, onChange, style = {} }) => (
  <input
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    style={{
      border: "1.5px solid #e8e8e8",
      borderRadius: 10,
      padding: "9px 14px",
      fontSize: 13,
      fontFamily: "'DM Sans', sans-serif",
      outline: "none",
      background: "#fff",
      color: "#333",
      transition: "border-color 0.15s",
      ...style,
    }}
  />
);

export const SectionTitle = ({ children, sub }) => (
  <div style={{ marginBottom: 20 }}>
    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#111", letterSpacing: -0.3 }}>{children}</h2>
    {sub && <p style={{ margin: "4px 0 0", fontSize: 13, color: "#888" }}>{sub}</p>}
  </div>
);

// Top navigation bar shared across roles
export const NavBar = ({ rol, accentColor, tabs, activeTab, onTabChange, userInitials, onLogout }) => (
  <div style={{
    background: "#fff",
    borderBottom: "1px solid #ebebeb",
    padding: "0 28px",
    display: "flex",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 1px 12px #00000009",
  }}>
    {/* Logo */}
    <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "13px 0", marginRight: 36, flexShrink: 0 }}>
      <div style={{
        width: 32, height: 32, borderRadius: 9,
        background: `linear-gradient(135deg, #${accentColor}, #${accentColor}bb)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16, boxShadow: `0 4px 12px #${accentColor}40`,
      }}>🌿</div>
      <span style={{ fontWeight: 800, fontSize: 17, color: "#111", letterSpacing: -0.4 }}>
        FP<span style={{ color: `#${accentColor}` }}>Connect</span>
      </span>
    </div>

    {/* Tabs */}
    {tabs.map(t => (
      <button key={t.key} onClick={() => onTabChange(t.key)} style={{
        background: "none", border: "none", cursor: "pointer",
        padding: "17px 13px",
        borderBottom: `2.5px solid ${activeTab === t.key ? `#${accentColor}` : "transparent"}`,
        color: activeTab === t.key ? `#${accentColor}` : "#666",
        fontWeight: activeTab === t.key ? 700 : 500,
        fontSize: 13, display: "flex", alignItems: "center", gap: 6,
        fontFamily: "'DM Sans', sans-serif",
        transition: "color 0.15s",
      }}>
        <span>{t.icon}</span>{t.label}
      </button>
    ))}

    {/* Right side */}
    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ fontSize: 11, color: "#bbb", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{rol}</span>
      <Avatar iniciales={userInitials} size={32} bg={accentColor} />
      <button onClick={onLogout} style={{
        background: "none", border: "1px solid #e8e8e8", borderRadius: 8,
        padding: "5px 10px", fontSize: 12, color: "#888", cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
      }}>Salir</button>
    </div>
  </div>
);

export const PageWrapper = ({ children }) => (
  <div style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 24px" }}>
    {children}
  </div>
);
