import { useState } from "react";

/* ──────────────────────────────────────────────────────────
   BADGE
────────────────────────────────────────────────────────── */

export const Badge = ({ text, color = "00d97f" }) => (
  <span
    style={{
      background: `linear-gradient(
        135deg,
        rgba(0,217,127,0.18),
        rgba(32,224,176,0.08)
      )`,
      color: "#d9fff1",
      border: `1px solid rgba(32,224,176,0.35)`,
      borderRadius: 999,
      padding: "5px 12px",
      fontSize: 11,
      fontWeight: 800,
      whiteSpace: "nowrap",
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      backdropFilter: "blur(12px)",
      boxShadow: "0 8px 22px rgba(0,217,127,0.12)",
      transition: "all .25s ease",
      letterSpacing: 0.3,
    }}
  >
    ✦ {text}
  </span>
);

/* ──────────────────────────────────────────────────────────
   AVATAR
────────────────────────────────────────────────────────── */

export const Avatar = ({
  iniciales,
  size = 42,
  bg = "00d97f",
}) => {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `
          linear-gradient(
            135deg,
            #00d97f,
            #20e0b0,
            #5b9eff
          )
        `,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 900,
        fontSize: size * 0.34,
        flexShrink: 0,
        letterSpacing: 1,
        position: "relative",
        cursor: "pointer",
        transform: hover
          ? "translateY(-2px) scale(1.05)"
          : "translateY(0) scale(1)",
        transition: "all .28s ease",
        boxShadow: hover
          ? "0 18px 40px rgba(0,217,127,0.35)"
          : "0 10px 28px rgba(0,217,127,0.22)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -2,
          borderRadius: "50%",
          background: `
            linear-gradient(
              135deg,
              rgba(255,255,255,.7),
              transparent
            )
          `,
          opacity: .5,
        }}
      />

      <span style={{ position: "relative", zIndex: 2 }}>
        {iniciales}
      </span>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────
   STAR
────────────────────────────────────────────────────────── */

export const Star = ({ filled = true }) => (
  <span
    style={{
      color: filled ? "#F5C518" : "#4b5563",
      fontSize: 13,
      filter: filled
        ? "drop-shadow(0 0 6px rgba(245,197,24,.35))"
        : "none",
    }}
  >
    ★
  </span>
);

/* ──────────────────────────────────────────────────────────
   STAT CARD
────────────────────────────────────────────────────────── */

export const StatCard = ({
  value,
  label,
  icon,
}) => {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 22,
        padding: "22px",
        minWidth: 130,
        background: `
          linear-gradient(
            145deg,
            rgba(255,255,255,0.08),
            rgba(255,255,255,0.03)
          )
        `,
        border: "1px solid rgba(255,255,255,0.1)",
        backdropFilter: "blur(24px)",
        cursor: "pointer",
        transform: hover
          ? "translateY(-6px)"
          : "translateY(0)",
        transition: "all .3s cubic-bezier(.2,.8,.2,1)",
        boxShadow: hover
          ? "0 24px 60px rgba(0,0,0,.35)"
          : "0 12px 30px rgba(0,0,0,.18)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(
              circle at top right,
              rgba(0,217,127,.16),
              transparent 40%
            )
          `,
        }}
      />

      <div
        style={{
          fontSize: 32,
          marginBottom: 10,
          position: "relative",
        }}
      >
        {icon}
      </div>

      <div
        style={{
          fontSize: 30,
          fontWeight: 900,
          color: "#fff",
          lineHeight: 1,
          position: "relative",
        }}
      >
        {value}
      </div>

      <div
        style={{
          fontSize: 13,
          color: "rgba(255,255,255,.62)",
          marginTop: 7,
          position: "relative",
        }}
      >
        {label}
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────
   BUTTON
────────────────────────────────────────────────────────── */

export const Button = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  style = {},
  ...props
}) => {
  const [hover, setHover] = useState(false);

  const sizes = {
    sm: {
      padding: "8px 15px",
      fontSize: 12,
    },
    md: {
      padding: "11px 20px",
      fontSize: 14,
    },
    lg: {
      padding: "14px 28px",
      fontSize: 15,
    },
  };

  return (
    <button
      {...props}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        overflow: "hidden",
        border: variant === "outline"
          ? "1px solid rgba(255,255,255,.16)"
          : "none",

        background:
          variant === "primary"
            ? `
              linear-gradient(
                135deg,
                #00d97f,
                #20e0b0
              )
            `
            : variant === "outline"
            ? "rgba(255,255,255,.04)"
            : "#fff",

        color:
          variant === "primary"
            ? "#fff"
            : "#d8fff0",

        borderRadius: 16,
        fontWeight: 800,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,

        transform: hover
          ? "translateY(-2px)"
          : "translateY(0)",

        transition: "all .28s ease",

        boxShadow:
          variant === "primary"
            ? hover
              ? "0 22px 50px rgba(0,217,127,.38)"
              : "0 12px 30px rgba(0,217,127,.22)"
            : "none",

        ...sizes[size],
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: hover ? "130%" : "-120%",
          width: "70%",
          height: "100%",
          background: `
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.22),
              transparent
            )
          `,
          transition: ".8s",
        }}
      />

      <span style={{ position: "relative", zIndex: 2 }}>
        {children}
      </span>
    </button>
  );
};

/* ──────────────────────────────────────────────────────────
   CARD
────────────────────────────────────────────────────────── */

export const Card = ({
  children,
  style = {},
}) => {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 26,
        padding: 24,

        background: `
          linear-gradient(
            145deg,
            rgba(255,255,255,0.08),
            rgba(255,255,255,0.03)
          )
        `,

        border: hover
          ? "1px solid rgba(32,224,176,.25)"
          : "1px solid rgba(255,255,255,.08)",

        backdropFilter: "blur(24px)",

        transform: hover
          ? "translateY(-5px)"
          : "translateY(0)",

        transition: "all .3s cubic-bezier(.2,.8,.2,1)",

        boxShadow: hover
          ? `
            0 30px 80px rgba(0,0,0,.35),
            0 0 30px rgba(0,217,127,.08)
          `
          : "0 16px 40px rgba(0,0,0,.22)",

        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(
              circle at top right,
              rgba(0,217,127,.12),
              transparent 35%
            )
          `,
          opacity: hover ? 1 : .6,
          transition: ".3s",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────
   INPUT
────────────────────────────────────────────────────────── */

export const Input = ({
  placeholder,
  value,
  onChange,
  style = {},
  ...props
}) => {
  const [focus, setFocus] = useState(false);

  return (
    <input
      {...props}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={{
        width: "100%",
        borderRadius: 14,
        border: focus
          ? "1px solid rgba(32,224,176,.55)"
          : "1px solid rgba(255,255,255,.12)",

        padding: "13px 16px",
        fontSize: 14,

        background: focus
          ? "rgba(255,255,255,.08)"
          : "rgba(255,255,255,.05)",

        color: "#fff",

        outline: "none",

        transition: "all .24s ease",

        boxShadow: focus
          ? "0 0 0 4px rgba(0,217,127,.10)"
          : "none",

        ...style,
      }}
    />
  );
};

/* ──────────────────────────────────────────────────────────
   SECTION TITLE
────────────────────────────────────────────────────────── */

export const SectionTitle = ({
  children,
  sub,
}) => (
  <div style={{ marginBottom: 28 }}>
    <h2
      style={{
        margin: 0,
        fontSize: 30,
        fontWeight: 900,
        letterSpacing: -1,
        color: "#fff",
      }}
    >
      {children}
    </h2>

    {sub && (
      <p
        style={{
          marginTop: 8,
          color: "rgba(255,255,255,.62)",
          lineHeight: 1.6,
          maxWidth: 650,
        }}
      >
        {sub}
      </p>
    )}
  </div>
);

/* ──────────────────────────────────────────────────────────
   NAVBAR
────────────────────────────────────────────────────────── */

export const NavBar = ({
  rol,
  tabs,
  activeTab,
  onTabChange,
  userInitials,
  onLogout,
}) => (
  <div
    style={{
      position: "sticky",
      top: 0,
      zIndex: 100,

      backdropFilter: "blur(28px)",

      background: `
        linear-gradient(
          180deg,
          rgba(4,8,10,.88),
          rgba(4,8,10,.68)
        )
      `,

      borderBottom: "1px solid rgba(255,255,255,.08)",

      boxShadow: "0 10px 40px rgba(0,0,0,.22)",

      padding: "0 28px",

      display: "flex",
      alignItems: "center",
      gap: 20,
    }}
  >
    {/* LOGO */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 0",
        marginRight: 30,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 14,

          background: `
            linear-gradient(
              135deg,
              #00d97f,
              #20e0b0,
              #5b9eff
            )
          `,

          display: "grid",
          placeItems: "center",

          color: "#fff",
          fontWeight: 900,
          fontSize: 18,

          boxShadow: `
            0 12px 35px rgba(0,217,127,.35)
          `,
        }}
      >
        ✦
      </div>

      <div
        style={{
          fontWeight: 900,
          fontSize: 20,
          letterSpacing: -.6,
          color: "#fff",
        }}
      >
        FP
        <span style={{ color: "#20e0b0" }}>
          Connect
        </span>
      </div>
    </div>

    {/* TABS */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onTabChange(t.key)}
          style={{
            border: "none",
            cursor: "pointer",

            background:
              activeTab === t.key
                ? `
                  linear-gradient(
                    135deg,
                    rgba(0,217,127,.22),
                    rgba(32,224,176,.08)
                  )
                `
                : "transparent",

            color:
              activeTab === t.key
                ? "#d9fff1"
                : "rgba(255,255,255,.6)",

            borderRadius: 14,

            padding: "10px 15px",

            display: "flex",
            alignItems: "center",
            gap: 8,

            fontWeight:
              activeTab === t.key
                ? 800
                : 600,

            transition: ".24s ease",

            border:
              activeTab === t.key
                ? "1px solid rgba(32,224,176,.25)"
                : "1px solid transparent",
          }}
        >
          <span>{t.icon}</span>
          {t.label}
        </button>
      ))}
    </div>

    {/* RIGHT */}
    <div
      style={{
        marginLeft: "auto",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <Badge text={rol} />

      <Avatar
        iniciales={userInitials}
        size={38}
      />

      <Button
        variant="outline"
        size="sm"
        onClick={onLogout}
        style={{
          color: "#ffb8c0",
          border: "1px solid rgba(255,107,122,.22)",
          background: "rgba(255,107,122,.08)",
        }}
      >
        Salir
      </Button>
    </div>
  </div>
);

/* ──────────────────────────────────────────────────────────
   PAGE WRAPPER
────────────────────────────────────────────────────────── */

export const PageWrapper = ({
  children,
}) => (
  <div
    style={{
      maxWidth: 1180,
      margin: "0 auto",
      padding: "34px 28px",
    }}
  >
    {children}
  </div>
);