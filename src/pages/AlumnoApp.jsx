import { useState } from "react";
import { centros, alumnos, empresas, noticias, ciclosInfo } from "../data/datos";
import { Badge, Avatar, Card, Button, Input, SectionTitle, NavBar, PageWrapper, StatCard, Star } from "../components/UI";

const ACCENT = "00A878";

const tabs = [
  { key: "inicio", label: "Inicio", icon: "⚡" },
  { key: "centros", label: "Centros", icon: "🏫" },
  { key: "alumnos", label: "Comunidad", icon: "👥" },
  { key: "empresas", label: "Empresas", icon: "💼" },
  { key: "mapa", label: "Mapa", icon: "📍" },
  { key: "noticias", label: "Noticias", icon: "📰" },
  { key: "perfil", label: "Mi Perfil", icon: "👤" },
];

const yo = alumnos[0];

export default function AlumnoApp({ user, onLogout }) {
  const [tab, setTab] = useState("inicio");
  const [busquedaCentros, setBusquedaCentros] = useState("");
  const [filtroCiclo, setFiltroCiclo] = useState("Todos");
  const [centroSeleccionado, setCentroSeleccionado] = useState(null);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);

  const centrosFiltrados = centros.filter(c => {
    const matchBusq = c.nombre.toLowerCase().includes(busquedaCentros.toLowerCase()) ||
      c.ciudad.toLowerCase().includes(busquedaCentros.toLowerCase());
    const matchCiclo = filtroCiclo === "Todos" || c.ciclos.includes(filtroCiclo);
    return matchBusq && matchCiclo;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#F6F8FA", fontFamily: "'DM Sans', sans-serif" }}>
      <NavBar
        rol="Alumno"
        accentColor={ACCENT}
        tabs={tabs}
        activeTab={tab}
        onTabChange={setTab}
        userInitials={user.initials}
        onLogout={onLogout}
      />

      <PageWrapper>

        {/* ── INICIO ─────────────────────────────────────────────── */}
        {tab === "inicio" && (
          <div>
            {/* Hero banner */}
            <div style={{
              background: "linear-gradient(135deg, #00A878 0%, #007A57 100%)",
              borderRadius: 20, padding: "28px 32px", marginBottom: 24, color: "#fff",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", right: -30, top: -30, fontSize: 120, opacity: 0.08, lineHeight: 1 }}>🎓</div>
              <div style={{ position: "absolute", right: 120, bottom: -20, fontSize: 80, opacity: 0.06, lineHeight: 1 }}>💻</div>
              <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>
                ¡Hola, {yo.nombre.split(" ")[0]}! 👋
              </h1>
              <p style={{ margin: "0 0 22px", opacity: 0.85, fontSize: 14, lineHeight: 1.6 }}>
                Tu perfil está al <strong>85%</strong> — sube tu CV para llegar al 100% y aparecer en más búsquedas de empresas.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <StatCard value="3" label="Empresas interesadas" icon="💼" color="ffffff" />
                <StatCard value="2" label="Becas disponibles" icon="💰" color="ffffff" />
                <StatCard value={centros.length} label="Centros en Andalucía" icon="🏫" color="ffffff" />
                <StatCard value="94%" label="Mayor inserción laboral" icon="📈" color="ffffff" />
              </div>
            </div>

            {/* Grid dashboard */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              {/* Noticias recientes */}
              <Card>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#111", marginBottom: 14 }}>📢 Últimas noticias</div>
                {noticias.slice(0, 3).map(n => (
                  <div key={n.id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #f5f5f5" }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 3 }}>
                      {n.urgente && <Badge text="NUEVO" color="EF4444" />}
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#222", lineHeight: 1.4 }}>{n.titulo}</span>
                    </div>
                    <div style={{ color: "#bbb", fontSize: 11 }}>{n.fecha}</div>
                  </div>
                ))}
                <Button variant="outline" color={ACCENT} size="sm" onClick={() => setTab("noticias")}>
                  Ver todas →
                </Button>
              </Card>

              {/* Empresas activas */}
              <Card>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#111", marginBottom: 14 }}>🏢 Empresas buscando perfiles</div>
                {empresas.map(e => (
                  <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #f8f8f8" }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 9,
                      background: `#${e.color}18`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 800, color: `#${e.color}`,
                    }}>{e.logo}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#222" }}>{e.nombre}</div>
                      <div style={{ fontSize: 11, color: "#aaa" }}>{e.sector} · {e.ciudad}</div>
                    </div>
                    <Badge text={`${e.vacantes} plazas`} color={e.color} />
                  </div>
                ))}
                <Button variant="outline" color={ACCENT} size="sm" onClick={() => setTab("empresas")}>
                  Ver todas →
                </Button>
              </Card>

              {/* Progreso de perfil */}
              <Card>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#111", marginBottom: 14 }}>✅ Completa tu perfil</div>
                {[
                  { label: "Información básica", done: true },
                  { label: "Foto de perfil", done: true },
                  { label: "Descripción y bio", done: true },
                  { label: "Habilidades técnicas", done: true },
                  { label: "Subir CV en PDF", done: false },
                  { label: "Proyectos y GitHub", done: false },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%",
                      background: item.done ? "#00A87820" : "#f0f0f0",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, color: item.done ? "#00A878" : "#ccc",
                    }}>{item.done ? "✓" : ""}</div>
                    <span style={{ fontSize: 13, color: item.done ? "#333" : "#aaa" }}>{item.label}</span>
                  </div>
                ))}
              </Card>

              {/* Ciclos disponibles */}
              <Card>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#111", marginBottom: 14 }}>📚 Ciclos en Andalucía</div>
                {Object.entries(ciclosInfo).map(([key, val]) => (
                  <div key={key} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                    <Badge text={key} color={ACCENT} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#333" }}>{val.nombre}</div>
                      <div style={{ fontSize: 11, color: "#aaa" }}>{val.salida}</div>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          </div>
        )}

        {/* ── CENTROS ────────────────────────────────────────────── */}
        {tab === "centros" && !centroSeleccionado && (
          <div>
            <SectionTitle sub={`${centros.length} centros de FP tecnológica en Andalucía`}>
              Directorio de Centros FP
            </SectionTitle>

            {/* Filtros */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
              <Input
                placeholder="🔍  Ciudad, nombre o ciclo..."
                value={busquedaCentros}
                onChange={e => setBusquedaCentros(e.target.value)}
                style={{ width: 260 }}
              />
              {["Todos", "DAM", "DAW", "ASIR", "SMR", "GBD"].map(c => (
                <button key={c} onClick={() => setFiltroCiclo(c)} style={{
                  background: filtroCiclo === c ? `#${ACCENT}` : "#fff",
                  color: filtroCiclo === c ? "#fff" : "#666",
                  border: `1.5px solid ${filtroCiclo === c ? `#${ACCENT}` : "#e0e0e0"}`,
                  borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600,
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                }}>{c}</button>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {centrosFiltrados.map(c => (
                <Card key={c.id} style={{ cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s" }}
                  onClick={() => setCentroSeleccionado(c)}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ fontSize: 32 }}>{c.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 15, color: "#111", lineHeight: 1.3 }}>{c.nombre}</div>
                      <div style={{ color: "#888", fontSize: 12, marginTop: 2 }}>📍 {c.ciudad} · {c.alumnos} alumnos</div>
                    </div>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 3,
                      background: "#FFF9E6", borderRadius: 8, padding: "4px 8px",
                    }}>
                      <Star /><span style={{ fontSize: 13, fontWeight: 700, color: "#b8930a" }}>{c.rating}</span>
                    </div>
                  </div>
                  <p style={{ color: "#666", fontSize: 12, lineHeight: 1.6, margin: "0 0 12px" }}>{c.descripcion}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                    {c.ciclos.map(cl => <Badge key={cl} text={cl} />)}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "#bbb" }}>🤝 {c.convenios} convenios · {c.insercion}% inserción</span>
                    <Button size="sm">Ver perfil →</Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Centro detalle */}
        {tab === "centros" && centroSeleccionado && (
          <div>
            <button onClick={() => setCentroSeleccionado(null)} style={{
              background: "none", border: "none", color: `#${ACCENT}`, fontSize: 13,
              fontWeight: 700, cursor: "pointer", marginBottom: 20, fontFamily: "'DM Sans', sans-serif",
              display: "flex", alignItems: "center", gap: 6,
            }}>← Volver al directorio</button>
            <Card>
              <div style={{ display: "flex", gap: 20, alignItems: "flex-start", marginBottom: 24 }}>
                <div style={{ fontSize: 60 }}>{centroSeleccionado.emoji}</div>
                <div style={{ flex: 1 }}>
                  <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800, color: "#111" }}>{centroSeleccionado.nombre}</h1>
                  <div style={{ color: "#888", fontSize: 14, marginBottom: 12 }}>
                    📍 {centroSeleccionado.ciudad}, {centroSeleccionado.provincia}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {centroSeleccionado.ciclos.map(c => <Badge key={c} text={c} />)}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <StatCard value={centroSeleccionado.alumnos} label="Alumnos" icon="🎓" />
                  <StatCard value={`${centroSeleccionado.insercion}%`} label="Inserción" icon="📈" />
                  <StatCard value={centroSeleccionado.convenios} label="Convenios" icon="🤝" />
                </div>
              </div>
              <p style={{ color: "#555", fontSize: 15, lineHeight: 1.8, borderTop: "1px solid #f5f5f5", paddingTop: 20 }}>
                {centroSeleccionado.descripcion}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 20 }}>
                <div style={{ background: "#f8f8f8", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 11, color: "#aaa", marginBottom: 4 }}>TELÉFONO</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#333" }}>{centroSeleccionado.telefono}</div>
                </div>
                <div style={{ background: "#f8f8f8", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 11, color: "#aaa", marginBottom: 4 }}>EMAIL</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#333" }}>{centroSeleccionado.email}</div>
                </div>
                <div style={{ background: "#f8f8f8", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 11, color: "#aaa", marginBottom: 4 }}>WEB</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#333" }}>{centroSeleccionado.web}</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ── COMUNIDAD ──────────────────────────────────────────── */}
        {tab === "alumnos" && !alumnoSeleccionado && (
          <div>
            <SectionTitle sub="Alumnos de FP que comparten su perfil público">
              Comunidad de Alumnos
            </SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {alumnos.map(a => (
                <Card key={a.id} style={{ cursor: "pointer" }} onClick={() => setAlumnoSeleccionado(a)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <Avatar iniciales={a.iniciales} size={52} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 15, color: "#111" }}>{a.nombre}</div>
                      <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>
                        {a.ciclo} · {a.centro} · {a.ciudad} · Nota: {a.nota}
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {a.skills.slice(0, 4).map(s => <Badge key={s} text={s} />)}
                        {a.skills.length > 4 && <Badge text={`+${a.skills.length - 4}`} color="888888" />}
                      </div>
                    </div>
                    <div>
                      <Badge text={a.disponible ? "✅ Disponible" : "🔒 No disponible"} color={a.disponible ? "00A878" : "999999"} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {tab === "alumnos" && alumnoSeleccionado && (
          <div>
            <button onClick={() => setAlumnoSeleccionado(null)} style={{
              background: "none", border: "none", color: `#${ACCENT}`, fontSize: 13,
              fontWeight: 700, cursor: "pointer", marginBottom: 20, fontFamily: "'DM Sans', sans-serif",
            }}>← Volver a la comunidad</button>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 18 }}>
              <Card style={{ textAlign: "center" }}>
                <Avatar iniciales={alumnoSeleccionado.iniciales} size={72} style={{ margin: "0 auto 12px" }} />
                <div style={{ fontWeight: 800, fontSize: 17, color: "#111", marginTop: 12 }}>{alumnoSeleccionado.nombre}</div>
                <div style={{ color: "#888", fontSize: 13, marginBottom: 12 }}>{alumnoSeleccionado.ciclo} · {alumnoSeleccionado.ciudad}</div>
                <Badge text={alumnoSeleccionado.disponible ? "✅ Disponible" : "🔒 No disponible"} color={alumnoSeleccionado.disponible ? "00A878" : "999999"} />
                <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 16 }}>
                  <div><div style={{ fontWeight: 800, fontSize: 20, color: "#111" }}>{alumnoSeleccionado.nota}</div><div style={{ fontSize: 11, color: "#aaa" }}>Nota media</div></div>
                  <div><div style={{ fontWeight: 800, fontSize: 20, color: "#111" }}>{alumnoSeleccionado.proyectos}</div><div style={{ fontSize: 11, color: "#aaa" }}>Proyectos</div></div>
                </div>
              </Card>
              <div>
                <Card style={{ marginBottom: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#111", marginBottom: 10 }}>📝 Sobre mí</div>
                  <p style={{ color: "#555", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{alumnoSeleccionado.bio}</p>
                </Card>
                <Card>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#111", marginBottom: 12 }}>🛠️ Habilidades</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {alumnoSeleccionado.skills.map(s => <Badge key={s} text={s} />)}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* ── EMPRESAS ───────────────────────────────────────────── */}
        {tab === "empresas" && (
          <div>
            <SectionTitle sub="Empresas que buscan alumnos de FP para prácticas y empleo">
              Empresas colaboradoras
            </SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {empresas.map(e => (
                <Card key={e.id}>
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: `#${e.color}18`, display: "flex",
                      alignItems: "center", justifyContent: "center",
                      fontSize: 16, fontWeight: 800, color: `#${e.color}`,
                    }}>{e.logo}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 15, color: "#111" }}>{e.nombre}</div>
                      <div style={{ color: "#888", fontSize: 12, marginTop: 2 }}>{e.sector} · {e.ciudad} · {e.empleados} empleados</div>
                    </div>
                  </div>
                  <p style={{ color: "#666", fontSize: 13, lineHeight: 1.6, margin: "0 0 14px" }}>{e.descripcion}</p>
                  <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                    {e.perfiles.map(p => <Badge key={p} text={p} color={e.color} />)}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#aaa" }}>💼 {e.vacantes} plazas abiertas</span>
                    <Button size="sm" color={e.color}>Ver más →</Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── MAPA ───────────────────────────────────────────────── */}
        {tab === "mapa" && (
          <div>
            <SectionTitle sub="Centros y empresas geolocalizados en toda Andalucía">
              Mapa de Andalucía FP
            </SectionTitle>
            <Card style={{ padding: 0, overflow: "hidden", height: 440, position: "relative" }}>
              <div style={{
                height: "100%",
                background: "linear-gradient(160deg, #e8f4ec 0%, #d4ead8 40%, #c8e4d0 100%)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                position: "relative",
              }}>
                {/* Mapa SVG simulado de Andalucía */}
                <svg viewBox="0 0 500 280" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.25 }}>
                  <path d="M30 140 Q80 80 150 90 Q200 70 250 85 Q300 60 360 80 Q420 70 470 100 Q490 130 460 160 Q430 200 380 210 Q320 230 250 220 Q180 240 120 220 Q60 210 30 180 Z" fill="#00A878" stroke="#007A57" strokeWidth="2" />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontSize: 48, marginBottom: 8 }}>🗺️</div>
                </div>
                {/* Pins */}
                {[
                  { ciudad: "Almería", x: "78%", y: "65%", color: "#00A878" },
                  { ciudad: "Málaga", x: "42%", y: "78%", color: "#00A878" },
                  { ciudad: "Sevilla", x: "22%", y: "42%", color: "#00A878" },
                  { ciudad: "Granada", x: "58%", y: "55%", color: "#00A878" },
                  { ciudad: "Córdoba", x: "38%", y: "32%", color: "#00A878" },
                  { ciudad: "Jaén", x: "55%", y: "35%", color: "#00A878" },
                ].map(pin => (
                  <div key={pin.ciudad} style={{
                    position: "absolute", left: pin.x, top: pin.y,
                    transform: "translate(-50%, -100%)",
                    display: "flex", flexDirection: "column", alignItems: "center",
                    cursor: "pointer",
                  }}>
                    <div style={{
                      background: "#fff", borderRadius: 8, padding: "4px 8px",
                      fontSize: 11, fontWeight: 700, color: "#333",
                      boxShadow: "0 2px 10px #00000020", marginBottom: 2,
                      whiteSpace: "nowrap",
                    }}>{pin.ciudad}</div>
                    <div style={{ color: pin.color, fontSize: 22 }}>📍</div>
                  </div>
                ))}
              </div>
            </Card>
            <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
              {centros.map(c => (
                <div key={c.id} style={{
                  background: "#fff", borderRadius: 10, padding: "8px 14px",
                  display: "flex", alignItems: "center", gap: 8,
                  boxShadow: "0 2px 8px #00000010", border: "1px solid #f0f0f0",
                }}>
                  <span style={{ fontSize: 18 }}>📍</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 12, color: "#111" }}>{c.nombre}</div>
                    <div style={{ fontSize: 11, color: "#999" }}>{c.ciudad} · {c.ciclos.join(", ")}</div>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: "#aaa", marginTop: 12, textAlign: "center" }}>
              💡 En la versión final, mapa interactivo con Leaflet.js + OpenStreetMap con geolocalización real
            </p>
          </div>
        )}

        {/* ── NOTICIAS ───────────────────────────────────────────── */}
        {tab === "noticias" && (
          <div>
            <SectionTitle sub="Becas, convocatorias y eventos del ecosistema FP andaluz">
              Noticias y Convocatorias
            </SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {noticias.map(n => (
                <Card key={n.id} style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
                  <div style={{
                    width: 50, height: 50, borderRadius: 13,
                    background: n.categoria === "Beca" ? "#00A87818" : n.categoria === "Convocatoria" ? "#2563EB18" : "#F59E0B18",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, flexShrink: 0,
                  }}>
                    {n.categoria === "Beca" ? "💰" : n.categoria === "Convocatoria" ? "📋" : "🏆"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                      <Badge
                        text={n.categoria}
                        color={n.categoria === "Beca" ? "00A878" : n.categoria === "Convocatoria" ? "2563EB" : "F59E0B"}
                      />
                      {n.urgente && <Badge text="⚡ URGENTE" color="EF4444" />}
                      <span style={{ color: "#ccc", fontSize: 12, marginLeft: "auto" }}>{n.fecha}</span>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "#111", marginBottom: 8 }}>{n.titulo}</div>
                    <div style={{ color: "#666", fontSize: 13, lineHeight: 1.7 }}>{n.resumen}</div>
                    <div style={{ marginTop: 12 }}>
                      <Button variant="outline" size="sm">Más info →</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── PERFIL ─────────────────────────────────────────────── */}
        {tab === "perfil" && (
          <div>
            <SectionTitle>Mi Perfil</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 18 }}>
              {/* Sidebar */}
              <div>
                <Card style={{ textAlign: "center", marginBottom: 14 }}>
                  <Avatar iniciales={yo.iniciales} size={72} style={{ margin: "0 auto" }} />
                  <div style={{ fontWeight: 800, fontSize: 18, color: "#111", marginTop: 14 }}>{yo.nombre}</div>
                  <div style={{ color: "#888", fontSize: 13, marginBottom: 14 }}>{yo.ciclo} · {yo.ciudad}</div>
                  <Badge text="✅ Disponible para prácticas" />
                  <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 18 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontWeight: 800, fontSize: 22, color: "#111" }}>{yo.nota}</div>
                      <div style={{ fontSize: 11, color: "#aaa" }}>Nota media</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontWeight: 800, fontSize: 22, color: "#111" }}>{yo.proyectos}</div>
                      <div style={{ fontSize: 11, color: "#aaa" }}>Proyectos</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 18, borderTop: "1px solid #f5f5f5", paddingTop: 14 }}>
                    <Button style={{ width: "100%", justifyContent: "center" }}>✏️ Editar perfil</Button>
                  </div>
                </Card>
                <Card>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#111", marginBottom: 12 }}>🛠️ Habilidades</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {yo.skills.map(s => <Badge key={s} text={s} />)}
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <Button variant="outline" size="sm">+ Añadir skill</Button>
                  </div>
                </Card>
              </div>

              {/* Main */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Card>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#111", marginBottom: 12 }}>📝 Sobre mí</div>
                  <p style={{ color: "#555", fontSize: 14, lineHeight: 1.8, margin: 0 }}>{yo.bio}</p>
                </Card>
                <Card>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#111", marginBottom: 14 }}>💼 Proyectos</div>
                  {[
                    { titulo: "App Gestión Tareas", desc: "React + Node.js + PostgreSQL · Proyecto personal", año: "2024", icon: "🚀" },
                    { titulo: "E-commerce Artesanía", desc: "Vue.js + Laravel · Proyecto de módulo", año: "2024", icon: "🛒" },
                    { titulo: "Dashboard Analítica", desc: "React + Chart.js · TFG de 1er curso", año: "2023", icon: "📊" },
                  ].map((p, i) => (
                    <div key={i} style={{
                      display: "flex", gap: 14, marginBottom: 14, paddingBottom: 14,
                      borderBottom: i < 2 ? "1px solid #f8f8f8" : "none",
                    }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10, background: "#00A87818",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                      }}>{p.icon}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#111" }}>{p.titulo}</div>
                        <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>{p.desc} · {p.año}</div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm">+ Añadir proyecto</Button>
                </Card>
                <Card style={{ display: "flex", gap: 12, alignItems: "center", background: "#f8fffe", border: "1.5px solid #00A87820" }}>
                  <div style={{ fontSize: 32 }}>📄</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#111" }}>Curriculum Vitae</div>
                    <div style={{ fontSize: 12, color: "#aaa" }}>Ningún CV subido aún. Sube tu CV en PDF para que las empresas puedan descargarlo.</div>
                  </div>
                  <Button>Subir CV</Button>
                </Card>
              </div>
            </div>
          </div>
        )}

      </PageWrapper>
    </div>
  );
}
