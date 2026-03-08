# 🌿 FPConnect — Red Social de Formación Profesional

**TFG — Desarrollo de Aplicaciones Multiplataforma (DAM) · 2025**

> Plataforma web y de escritorio para conectar alumnos de FP, centros educativos y empresas en Andalucía.

---

## 🚀 Arrancar el proyecto (demo web)

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Abrir en el navegador
# → http://localhost:5173
```

---

## 🏗️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend web** | React 18 + Vite + CSS-in-JS |
| **App escritorio** | Tauri 2 + React (mismo código) |
| **Backend (producción)** | Supabase (PostgreSQL + Auth + Storage) |
| **Mapa** | Leaflet.js + OpenStreetMap |
| **Deploy web** | Vercel |
| **Fuentes** | DM Sans (Google Fonts) |

---

## 📁 Estructura del proyecto

```
fpconnect/
├── src/
│   ├── components/
│   │   └── UI.jsx          # Componentes reutilizables (Badge, Avatar, Card, NavBar...)
│   ├── data/
│   │   └── datos.js        # Datos de prueba (centros, alumnos, empresas, noticias)
│   ├── pages/
│   │   ├── LoginPage.jsx   # Pantalla de login con selección de rol
│   │   ├── AlumnoApp.jsx   # Dashboard completo del alumno
│   │   ├── CentroApp.jsx   # Dashboard del centro educativo
│   │   └── EmpresaApp.jsx  # Dashboard de empresa/recruiting
│   ├── styles/
│   │   └── global.css      # Reset y estilos globales
│   ├── App.jsx             # Router principal por rol
│   └── main.jsx            # Punto de entrada React
├── index.html
├── vite.config.js
└── package.json
```

---

## 👥 Roles y funcionalidades

### 🎓 Alumno
- Dashboard personal con estadísticas y noticias
- Directorio de centros con filtros por ciclo y provincia
- Mapa de centros y empresas en Andalucía
- Comunidad de alumnos — ver perfiles públicos
- Feed de noticias: becas, convocatorias, eventos
- Perfil público con CV, skills, proyectos y experiencia

### 🏫 Centro FP
- Dashboard con métricas del centro
- Gestión de alumnos registrados
- Vista de empresas colaboradoras
- Perfil público del centro

### 💼 Empresa
- Buscador de talento con filtros por ciclo y ciudad
- Perfil completo de cada alumno disponible
- Gestión de vacantes (prácticas y empleo)
- Directorio de centros FP para convenios
- Perfil de empresa público

---

## 🗺️ Hoja de ruta completa

### Fase 1 — Demo (actual) ✅
- Login multi-rol
- Dashboards funcionales para los 3 roles
- Datos de prueba realistas

### Fase 2 — Backend real
- Supabase: autenticación JWT
- Base de datos PostgreSQL
- Storage para CVs y fotos

### Fase 3 — Features avanzadas
- Mapa interactivo con Leaflet.js geolocalizado
- Sistema de mensajería empresa ↔ alumno
- Notificaciones en tiempo real (Supabase Realtime)
- Upload de CV en PDF

### Fase 4 — App escritorio
- Tauri 2: empaquetar como .exe para Windows
- Mismo código React reutilizado
- Instalador con Tauri Bundler

---

## 🎓 Datos de prueba incluidos

- **6 centros FP** reales de Andalucía (Almería, Málaga, Sevilla, Granada, Córdoba, Jaén)
- **6 alumnos** con perfiles completos, skills y disponibilidad
- **4 empresas** con vacantes y descripción
- **5 noticias** de becas, convocatorias y eventos

---

## 📊 Modelo de datos (Supabase / PostgreSQL)

```sql
-- Usuarios
usuarios (id, email, rol, created_at)

-- Alumnos
alumnos (id, usuario_id, nombre, ciclo, centro_id, ciudad, bio, nota, disponible, cv_url, foto_url)

-- Centros
centros (id, usuario_id, nombre, ciudad, provincia, descripcion, telefono, email, web, lat, lng)

-- Empresas
empresas (id, usuario_id, nombre, sector, ciudad, descripcion, empleados, logo_url)

-- Ciclos (relación N:M con centros)
centros_ciclos (centro_id, ciclo)

-- Skills (relación N:M con alumnos)
alumnos_skills (alumno_id, skill)

-- Noticias
noticias (id, titulo, categoria, resumen, fecha, urgente, url)

-- Vacantes
vacantes (id, empresa_id, titulo, tipo, ciclo, estado, created_at)

-- Intereses empresa → alumno
intereses (id, empresa_id, alumno_id, created_at)
```

---

*Desarrollado como Trabajo de Fin de Grado · DAM · 2025*
*Stack: React + Vite + Supabase + Tauri*
