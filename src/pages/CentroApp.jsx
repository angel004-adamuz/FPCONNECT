import { useState } from "react";
import { centros, alumnos, empresas, noticias } from "../data/datos";
import { Badge, Avatar, Card, Button, SectionTitle, NavBar, PageWrapper, StatCard } from "../components/UI";

const ACCENT = "2563EB";
const myCentro = centros[1]; // IES Politécnico Jesús Marín

const tabs = [
  { key: "dashboard", label: "Dashboard", icon: "📊" },
  { key: "alumnos", label: "Alumnos", icon: "🎓" },
  { key: "empresas", label: "Empresas", icon: "🏢" },
  { key: "noticias", label: "Noticias", icon: "📰" },
  { key: "perfil", label: "Mi Centro", icon: "🏫" },
];

export default function CentroApp({ user, onLogout }) {
  const [tab, setTab] = useState("dashboard");
  const [filtroDisponible, setFiltroDisponible] = useState("Todos");

  const alumnosFiltrados = alumnos.filter(a => {
    if (filtroDisponible === "Disponibles") return a.disponible;
    if (filtroDisponible === "No disponibles") return !a.disponible;
    return true;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#F0F5FF", fontFamily: "'DM Sans', sans-serif" }}>
      <NavBar
        rol="Centro FP"
        accentColor={ACCENT}
        tabs={tabs}
        activeTab={tab}
        onTabChange={setTab}
        userInitials={user.initials}
        onLogout={onLogout}
      />

      <PageWrapper>

        {/* ── DASHBOARD ──────────────────────────────────────────── */}
        {tab === "dashboard" && (
          <div>
            {/* Hero */}
            <div style={{
              background: "linear-gradient(135deg, #2563EB 0%, #1d4ed8 100%)",
              borderRadius: 20, padding: "28px 32px", marginBottom: 24, color: "#fff",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", right: -40, top: -40, fontSize: 140, opacity: 0.06 }}>🏛️</div>
              <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800 }}>{myCentro.nombre}</h1>
              <p style={{ margin: "0 0 22px", opacity: 0.8, fontSize: 14 }}>
                Panel de gestión · {myCentro.ciudad}, {myCentro.provincia}
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <StatCard value={myCentro.alumnos} label="Alumnos activos" icon="🎓" color="ffffff" />
                <StatCard value={myCentro.convenios} label="Convenios empresa" icon="🤝" color="ffffff" />
                <StatCard value={myCentro.ciclos.length} label="Ciclos ofertados" icon="📚" color="ffffff" />
                <StatCard value={`${myCentro.insercion}%`} label="Inserción laboral" icon="📈" color="ffffff" />
              </div>
            </div>

            {/* Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
              {/* Alumnos por ciclo */}
              <Card>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#111", marginBottom: 14 }}>📊 Alumnos por ciclo</div>
                {[
                  { ciclo: "DAW", n: 145, color: "2563EB" },
                  { ciclo: "DAM", n: 130, color: "00A878" },
                  { ciclo: "SMR", n: 105, color: "7C3AED" },
                  { ciclo: "ASIR", n: 100, color: "F59E0B" },
                ].map(item => (
                  <div key={item.ciclo} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                      <span style={{ fontWeight: 700, color: "#333" }}>{item.ciclo}</span>
                      <span style={{ color: "#999" }}>{item.n} alumnos</span>
                    </div>
                    <div style={{ height: 8, background: "#f0f0f0", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{
                        width: `${(item.n / 145) * 100}%`, height: "100%",
                        background: `#${item.color}`, borderRadius: 4,
                        transition: "width 0.5s ease",
                      }} />
                    </div>
                  </div>
                ))}
              </Card>

              {/* Actividad reciente */}
              <Card>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#111", marginBottom: 14 }}>🔔 Actividad reciente</div>
                {[
                  { texto: "Nueva empresa interesada en alumnos DAW", hora: "Hace 2h", tipo: "empresa" },
                  { texto: "Alejandro Ruiz ha subido su CV actualizado", hora: "Hace 3h", tipo: "alumno" },
                  { texto: "Solicitud de convenio de AppFactory Córdoba", hora: "Ayer", tipo: "empresa" },
                  { texto: "5 alumnos nuevos se han registrado en la plataforma", hora: "Hace 2 días", tipo: "info" },
                  { texto: "Nueva beca Erasmus+ publicada en noticias", hora: "Hace 3 días", tipo: "noticia" },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 10, marginBottom: 12, paddingBottom: 12,
                    borderBottom: i < 4 ? "1px solid #f8f8f8" : "none",
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: item.tipo === "empresa" ? "#7C3AED15" : item.tipo === "alumno" ? "#00A87815" : "#2563EB15",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                    }}>
                      {item.tipo === "empresa" ? "🏢" : item.tipo === "alumno" ? "👤" : item.tipo === "noticia" ? "📰" : "ℹ️"}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, color: "#333", lineHeight: 1.4 }}>{item.texto}</div>
                      <div style={{ fontSize: 11, color: "#bbb", marginTop: 2 }}>{item.hora}</div>
                    </div>
                  </div>
                ))}
              </Card>
            </div>

            {/* Empresas colaboradoras */}
            <Card>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#111", marginBottom: 14 }}>🏢 Empresas colaboradoras del centro</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
                {empresas.map(e => (
                  <div key={e.id} style={{
                    background: "#f8f8fc", borderRadius: 10, padding: "12px 14px",
                    display: "flex", alignItems: "center", gap: 10,
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 9, background: `#${e.color}18`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 800, color: `#${e.color}`, flexShrink: 0,
                    }}>{e.logo}</div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#111" }}>{e.nombre}</div>
                      <div style={{ fontSize: 11, color: "#aaa" }}>{e.vacantes} plazas</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ── ALUMNOS ────────────────────────────────────────────── */}
        {tab === "alumnos" && (
          <div>
            <SectionTitle sub={`${alumnos.length} alumnos registrados en la plataforma`}>
              Gestión de Alumnos
            </SectionTitle>
            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              {["Todos", "Disponibles", "No disponibles"].map(f => (
                <button key={f} onClick={() => setFiltroDisponible(f)} style={{
                  background: filtroDisponible === f ? `#${ACCENT}` : "#fff",
                  color: filtroDisponible === f ? "#fff" : "#666",
                  border: `1.5px solid ${filtroDisponible === f ? `#${ACCENT}` : "#e0e0e0"}`,
                  borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600,
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                }}>{f}</button>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {alumnosFiltrados.map(a => (
                <Card key={a.id} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <Avatar iniciales={a.iniciales} size={48} bg={ACCENT} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "#111" }}>{a.nombre}</div>
                    <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>
                      {a.ciclo} · Nota media: <strong>{a.nota}</strong> · {a.proyectos} proyectos
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {a.skills.slice(0, 4).map(s => <Badge key={s} text={s} color={ACCENT} />)}
                      {a.skills.length > 4 && <Badge text={`+${a.skills.length - 4}`} color="999999" />}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                    <Badge text={a.disponible ? "✅ Disponible" : "🔒 No disponible"} color={a.disponible ? "00A878" : "999999"} />
                    <Button size="sm" color={ACCENT}>Ver perfil</Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── EMPRESAS ───────────────────────────────────────────── */}
        {tab === "empresas" && (
          <div>
            <SectionTitle sub="Empresas con convenio activo con el centro">
              Empresas colaboradoras
            </SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {empresas.map(e => (
                <Card key={e.id}>
                  <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 13, background: `#${e.color}18`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, fontWeight: 800, color: `#${e.color}`,
                    }}>{e.logo}</div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: "#111" }}>{e.nombre}</div>
                      <div style={{ color: "#888", fontSize: 12 }}>{e.sector} · {e.empleados} empleados · {e.ciudad}</div>
                      <div style={{ marginTop: 6 }}>
                        {e.perfiles.map(p => <Badge key={p} text={p} color={e.color} />)}
                      </div>
                    </div>
                  </div>
                  <p style={{ color: "#666", fontSize: 13, lineHeight: 1.6, margin: "0 0 14px" }}>{e.descripcion}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#aaa" }}>💼 {e.vacantes} plazas disponibles</span>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Button variant="outline" size="sm" color={e.color}>Contactar</Button>
                      <Button size="sm" color={e.color}>Ver empresa →</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── NOTICIAS ───────────────────────────────────────────── */}
        {tab === "noticias" && (
          <div>
            <SectionTitle sub="Información relevante para el centro y sus alumnos">
              Noticias y Convocatorias
            </SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {noticias.map(n => (
                <Card key={n.id} style={{ display: "flex", gap: 16 }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                    background: n.categoria === "Beca" ? "#00A87815" : n.categoria === "Convocatoria" ? "#2563EB15" : "#F59E0B15",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                  }}>
                    {n.categoria === "Beca" ? "💰" : n.categoria === "Convocatoria" ? "📋" : "🏆"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                      <Badge text={n.categoria} color={n.categoria === "Beca" ? "00A878" : n.categoria === "Convocatoria" ? "2563EB" : "F59E0B"} />
                      {n.urgente && <Badge text="⚡ URGENTE" color="EF4444" />}
                      <span style={{ fontSize: 11, color: "#ccc", marginLeft: "auto" }}>{n.fecha}</span>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "#111", marginBottom: 6 }}>{n.titulo}</div>
                    <div style={{ color: "#666", fontSize: 13, lineHeight: 1.6 }}>{n.resumen}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── PERFIL CENTRO ──────────────────────────────────────── */}
        {tab === "perfil" && (
          <div>
            <SectionTitle>Perfil del Centro</SectionTitle>
            <Card style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", gap: 20, alignItems: "flex-start", marginBottom: 24 }}>
                <div style={{ fontSize: 64 }}>{myCentro.emoji}</div>
                <div style={{ flex: 1 }}>
                  <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800, color: "#111" }}>{myCentro.nombre}</h1>
                  <div style={{ color: "#888", fontSize: 14, marginBottom: 14 }}>
                    📍 {myCentro.ciudad}, {myCentro.provincia} · Centro público · Desde 1980
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {myCentro.ciclos.map(c => <Badge key={c} text={c} color={ACCENT} />)}
                  </div>
                </div>
                <Button color={ACCENT}>✏️ Editar perfil</Button>
              </div>

              <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
                <StatCard value={myCentro.alumnos} label="Alumnos" icon="🎓" color={ACCENT} />
                <StatCard value={`${myCentro.insercion}%`} label="Inserción" icon="📈" color={ACCENT} />
                <StatCard value={myCentro.convenios} label="Convenios" icon="🤝" color={ACCENT} />
                <StatCard value={`${myCentro.rating}⭐`} label="Valoración" icon="" color={ACCENT} />
              </div>

              <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 20 }}>
                <p style={{ color: "#555", fontSize: 15, lineHeight: 1.8, margin: 0 }}>
                  {myCentro.descripcion}
                </p>
              </div>
            </Card>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              {[
                { label: "Teléfono", value: myCentro.telefono, icon: "📞" },
                { label: "Email", value: myCentro.email, icon: "✉️" },
                { label: "Web", value: myCentro.web, icon: "🌐" },
              ].map(item => (
                <Card key={item.label}>
                  <div style={{ fontSize: 11, color: "#aaa", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {item.icon} {item.label}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#333" }}>{item.value}</div>
                </Card>
              ))}
            </div>
          </div>
        )}

      </PageWrapper>
    </div>
  );
}
