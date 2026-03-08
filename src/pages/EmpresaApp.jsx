import { useState } from "react";
import { alumnos, centros, noticias } from "../data/datos";
import { Badge, Avatar, Card, Button, SectionTitle, NavBar, PageWrapper, StatCard } from "../components/UI";

const ACCENT = "7C3AED";

const tabs = [
  { key: "talento", label: "Buscar Talento", icon: "🔍" },
  { key: "centros", label: "Centros FP", icon: "🏫" },
  { key: "vacantes", label: "Mis Vacantes", icon: "💼" },
  { key: "noticias", label: "Noticias", icon: "📰" },
  { key: "perfil", label: "Mi Empresa", icon: "🏢" },
];

const myEmpresa = {
  nombre: "Soluciones Tech SL",
  sector: "Desarrollo Software",
  ciudad: "Málaga",
  empleados: "25-50",
  descripcion: "Startup malagueña especializada en desarrollo de software a medida para el sector turístico andaluz. Ambiente dinámico, metodologías ágiles y prácticas remuneradas con posibilidad de contrato.",
  logo: "ST",
  web: "www.solucionestech.es",
  email: "rrhh@solucionestech.es",
  telefono: "952 111 222",
};

const vacantes = [
  { id: 1, titulo: "Frontend Developer — Prácticas", tipo: "Prácticas", ciclo: "DAW", candidatos: 8, estado: "Activa", publicada: "Hace 5 días" },
  { id: 2, titulo: "Mobile Developer Jr.", tipo: "Contrato", ciclo: "DAM", candidatos: 5, estado: "Activa", publicada: "Hace 1 semana" },
  { id: 3, titulo: "Soporte Técnico IT", tipo: "Prácticas", ciclo: "SMR", candidatos: 3, estado: "Activa", publicada: "Hace 2 semanas" },
];

export default function EmpresaApp({ user, onLogout }) {
  const [tab, setTab] = useState("talento");
  const [filtroCiclo, setFiltroCiclo] = useState("Todos");
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [interesados, setInteresados] = useState([]);

  const alumnosFiltrados = alumnos.filter(a => {
    const matchDisp = a.disponible;
    const matchCiclo = filtroCiclo === "Todos" || a.ciclo.includes(filtroCiclo);
    return matchDisp && matchCiclo;
  });

  const toggleInteres = (id) => {
    setInteresados(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8F5FF", fontFamily: "'DM Sans', sans-serif" }}>
      <NavBar
        rol="Empresa"
        accentColor={ACCENT}
        tabs={tabs}
        activeTab={tab}
        onTabChange={setTab}
        userInitials={user.initials}
        onLogout={onLogout}
      />

      <PageWrapper>

        {/* ── BUSCAR TALENTO ─────────────────────────────────────── */}
        {tab === "talento" && !alumnoSeleccionado && (
          <div>
            {/* Hero */}
            <div style={{
              background: "linear-gradient(135deg, #7C3AED 0%, #5b21b6 100%)",
              borderRadius: 20, padding: "26px 32px", marginBottom: 24, color: "#fff",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", right: -30, bottom: -30, fontSize: 130, opacity: 0.07 }}>🚀</div>
              <h1 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800 }}>Encuentra el talento que necesitas 🚀</h1>
              <p style={{ margin: "0 0 20px", opacity: 0.8, fontSize: 14 }}>
                Alumnos de FP disponibles para prácticas y empleo en toda Andalucía
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <StatCard value={alumnos.filter(a => a.disponible).length} label="Disponibles ahora" icon="✅" color="ffffff" />
                <StatCard value={centros.length} label="Centros asociados" icon="🏫" color="ffffff" />
                <StatCard value="5" label="Ciclos disponibles" icon="📚" color="ffffff" />
                <StatCard value={interesados.length} label="Perfiles guardados" icon="⭐" color="ffffff" />
              </div>
            </div>

            {/* Filtros */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#888" }}>Filtrar por ciclo:</span>
              {["Todos", "DAW", "DAM", "ASIR", "SMR"].map(c => (
                <button key={c} onClick={() => setFiltroCiclo(c)} style={{
                  background: filtroCiclo === c ? `#${ACCENT}` : "#fff",
                  color: filtroCiclo === c ? "#fff" : "#666",
                  border: `1.5px solid ${filtroCiclo === c ? `#${ACCENT}` : "#e0e0e0"}`,
                  borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600,
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                }}>{c}</button>
              ))}
              <span style={{ fontSize: 12, color: "#bbb", marginLeft: "auto" }}>
                {alumnosFiltrados.length} perfiles encontrados
              </span>
            </div>

            {/* Grid de alumnos */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {alumnosFiltrados.map(a => (
                <Card key={a.id}>
                  <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                    <Avatar iniciales={a.iniciales} size={52} bg={ACCENT} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 15, color: "#111" }}>{a.nombre}</div>
                      <div style={{ fontSize: 12, color: "#888", marginTop: 1 }}>{a.ciclo} · {a.ciudad}</div>
                      <div style={{ fontSize: 12, color: "#aaa", marginTop: 1 }}>
                        ⭐ Nota: <strong style={{ color: "#333" }}>{a.nota}</strong> · {a.proyectos} proyectos
                      </div>
                    </div>
                    <button
                      onClick={() => toggleInteres(a.id)}
                      title={interesados.includes(a.id) ? "Quitar de guardados" : "Guardar perfil"}
                      style={{
                        background: "none", border: "none", cursor: "pointer", fontSize: 20,
                        color: interesados.includes(a.id) ? "#F59E0B" : "#ddd",
                        transition: "color 0.2s",
                      }}
                    >★</button>
                  </div>
                  <p style={{ color: "#666", fontSize: 12, lineHeight: 1.6, margin: "0 0 12px" }}>{a.bio}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
                    {a.skills.map(s => <Badge key={s} text={s} color={ACCENT} />)}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button
                      color={ACCENT}
                      size="sm"
                      style={{ flex: 1, justifyContent: "center" }}
                      onClick={() => setAlumnoSeleccionado(a)}
                    >
                      👤 Ver perfil completo
                    </Button>
                    <Button variant="outline" color={ACCENT} size="sm">💌 Contactar</Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Alumno detalle */}
        {tab === "talento" && alumnoSeleccionado && (
          <div>
            <button onClick={() => setAlumnoSeleccionado(null)} style={{
              background: "none", border: "none", color: `#${ACCENT}`, fontSize: 13,
              fontWeight: 700, cursor: "pointer", marginBottom: 20, fontFamily: "'DM Sans', sans-serif",
            }}>← Volver a la búsqueda</button>
            <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 18 }}>
              <div>
                <Card style={{ textAlign: "center", marginBottom: 14 }}>
                  <Avatar iniciales={alumnoSeleccionado.iniciales} size={72} bg={ACCENT} />
                  <div style={{ fontWeight: 800, fontSize: 18, color: "#111", marginTop: 14 }}>{alumnoSeleccionado.nombre}</div>
                  <div style={{ color: "#888", fontSize: 13, marginBottom: 12 }}>{alumnoSeleccionado.ciclo} · {alumnoSeleccionado.ciudad}</div>
                  <Badge text="✅ Disponible para prácticas" color="00A878" />
                  <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 18 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontWeight: 800, fontSize: 22, color: "#111" }}>{alumnoSeleccionado.nota}</div>
                      <div style={{ fontSize: 11, color: "#aaa" }}>Nota media</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontWeight: 800, fontSize: 22, color: "#111" }}>{alumnoSeleccionado.proyectos}</div>
                      <div style={{ fontSize: 11, color: "#aaa" }}>Proyectos</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                    <Button color={ACCENT} style={{ justifyContent: "center" }}>💌 Contactar alumno</Button>
                    <Button variant="outline" color={ACCENT} style={{ justifyContent: "center" }}>📄 Descargar CV</Button>
                  </div>
                </Card>
                <Card>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#111", marginBottom: 12 }}>🛠️ Habilidades</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {alumnoSeleccionado.skills.map(s => <Badge key={s} text={s} color={ACCENT} />)}
                  </div>
                </Card>
              </div>
              <div>
                <Card style={{ marginBottom: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>📝 Sobre el alumno</div>
                  <p style={{ color: "#555", fontSize: 14, lineHeight: 1.8, margin: 0 }}>{alumnoSeleccionado.bio}</p>
                </Card>
                <Card style={{ marginBottom: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>🎓 Formación</div>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "#2563EB15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏫</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#111" }}>{alumnoSeleccionado.ciclo}</div>
                      <div style={{ fontSize: 12, color: "#999" }}>{alumnoSeleccionado.centro} · {alumnoSeleccionado.ciudad}</div>
                    </div>
                  </div>
                </Card>
                <Card>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>🔗 Redes</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <Button variant="outline" color="333333" size="sm">🐱 {alumnoSeleccionado.github}</Button>
                    <Button variant="outline" color="0A66C2" size="sm">in {alumnoSeleccionado.linkedin}</Button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* ── CENTROS FP ─────────────────────────────────────────── */}
        {tab === "centros" && (
          <div>
            <SectionTitle sub="Centros con alumnos disponibles para prácticas en tu sector">
              Centros FP en Andalucía
            </SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {centros.map(c => (
                <Card key={c.id}>
                  <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                    <div style={{ fontSize: 32 }}>{c.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: "#111" }}>{c.nombre}</div>
                      <div style={{ fontSize: 12, color: "#888" }}>📍 {c.ciudad} · {c.alumnos} alumnos</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                    {c.ciclos.map(cl => <Badge key={cl} text={cl} color={ACCENT} />)}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "#bbb" }}>{c.insercion}% inserción laboral</span>
                    <Button size="sm" color={ACCENT}>Contactar centro</Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── VACANTES ───────────────────────────────────────────── */}
        {tab === "vacantes" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <SectionTitle sub="Gestiona tus ofertas de prácticas y empleo">Mis Vacantes</SectionTitle>
              <Button color={ACCENT}>+ Nueva vacante</Button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {vacantes.map(v => (
                <Card key={v.id} style={{ display: "flex", alignItems: "center", gap: 18 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, background: `#${ACCENT}15`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0,
                  }}>💼</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "#111" }}>{v.titulo}</div>
                    <div style={{ fontSize: 12, color: "#888", marginTop: 3 }}>
                      {v.tipo} · Ciclo: {v.ciclo} · Publicada: {v.publicada}
                    </div>
                  </div>
                  <div style={{ textAlign: "center", minWidth: 60 }}>
                    <div style={{ fontWeight: 800, fontSize: 24, color: `#${ACCENT}` }}>{v.candidatos}</div>
                    <div style={{ fontSize: 11, color: "#aaa" }}>candidatos</div>
                  </div>
                  <Badge text={v.estado} color="00A878" />
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button variant="outline" size="sm" color={ACCENT}>Ver candidatos</Button>
                    <Button size="sm" color={ACCENT}>Editar</Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Stats vacantes */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginTop: 20 }}>
              <StatCard value="16" label="Total candidatos" icon="👥" color={ACCENT} />
              <StatCard value="3" label="Vacantes activas" icon="✅" color={ACCENT} />
              <StatCard value="2" label="Contratados este año" icon="🤝" color={ACCENT} />
            </div>
          </div>
        )}

        {/* ── NOTICIAS ───────────────────────────────────────────── */}
        {tab === "noticias" && (
          <div>
            <SectionTitle sub="Novedades del ecosistema FP que afectan a tu empresa">
              Noticias del Sector
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
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <Badge text={n.categoria} color={n.categoria === "Beca" ? "00A878" : n.categoria === "Convocatoria" ? "2563EB" : "F59E0B"} />
                      {n.urgente && <Badge text="⚡ URGENTE" color="EF4444" />}
                      <span style={{ color: "#ccc", fontSize: 11, marginLeft: "auto" }}>{n.fecha}</span>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "#111", marginBottom: 6 }}>{n.titulo}</div>
                    <div style={{ color: "#666", fontSize: 13, lineHeight: 1.6 }}>{n.resumen}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── PERFIL EMPRESA ─────────────────────────────────────── */}
        {tab === "perfil" && (
          <div>
            <SectionTitle>Perfil de Empresa</SectionTitle>
            <Card style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", gap: 20, alignItems: "flex-start", marginBottom: 24 }}>
                <div style={{
                  width: 68, height: 68, borderRadius: 16,
                  background: `#${ACCENT}18`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, fontWeight: 800, color: `#${ACCENT}`,
                }}>{myEmpresa.logo}</div>
                <div style={{ flex: 1 }}>
                  <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 800, color: "#111" }}>{myEmpresa.nombre}</h1>
                  <div style={{ color: "#888", fontSize: 14, marginBottom: 14 }}>
                    💻 {myEmpresa.sector} · 📍 {myEmpresa.ciudad} · 🏢 {myEmpresa.empleados} empleados
                  </div>
                  <Badge text="3 plazas de prácticas abiertas" color={ACCENT} />
                </div>
                <Button color={ACCENT}>✏️ Editar perfil</Button>
              </div>
              <p style={{ color: "#555", fontSize: 15, lineHeight: 1.8, borderTop: "1px solid #f5f5f5", paddingTop: 20, margin: 0 }}>
                {myEmpresa.descripcion}
              </p>
            </Card>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              {[
                { label: "Teléfono", value: myEmpresa.telefono, icon: "📞" },
                { label: "Email RRHH", value: myEmpresa.email, icon: "✉️" },
                { label: "Web", value: myEmpresa.web, icon: "🌐" },
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
