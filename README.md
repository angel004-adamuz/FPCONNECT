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

| Capa | Tecnología | Razón |
|------|-----------|-------|
| **Frontend web** | React 18 + Vite | UI moderna, build rápido, HMR |
| **Backend API** | Node.js + Express | Rápido, escalable, ecosistema npm robusto |
| **Base de datos** | PostgreSQL | RDBMS profesional, relaciones complejas, índices avanzados |
| **ORM** | Prisma | Type-safe, migrations automáticas, devX excelente |
| **Autenticación** | JWT + bcrypt | Stateless, seguro, estándar API REST |
| **Tiempo real** | Socket.io | Mensajería, notificaciones, sincronización live |
| **Validación** | Joi | Validaciones robustas, mensajes claros |
| **Seguridad** | Helmet + CORS | Headers seguros, protección XSS/CSRF |
| **Logging** | Morgan + custom | Trazabilidad, debugging |
| **Deploy backend** | Railway/Render | Fácil deploy, escalable, BD incluida |
| **Deploy frontend** | Vercel | Optimizado React, edge functions |
| **App escritorio** | Tauri 2 + React | Mismo código reutilizado, bundle pequeño |
| **Mapa** | Leaflet.js + OpenStreetMap | Open source, sin licencia |
| **Fuentes** | Inter (Google Fonts) | Sans Serif optimizada para UI y legibilidad |

---

## Novedades recientes (abril 2026)

- Tipografia global migrada a Inter en todo el frontend.
- Rediseño de Conexiones con subtabs de Siguiendo y Seguidores.
- Nueva pestaña de Noticias FP con convocatorias y becas.
- Vista de perfil publico tipo LinkedIn para usuarios.
- Mejoras de feed: likes/comentarios, texto "Me gusta" y mensajes de estado.

---

## 📁 Estructura del proyecto

```
fpconnect/
├── frontend/ (React + Vite)
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── data/          # Datos de prueba
│   │   ├── pages/         # Páginas de cada rol
│   │   ├── styles/        # CSS global
│   │   ├── App.jsx        # Router principal
│   │   └── main.jsx       # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── backend/ (Node.js + Express + PostgreSQL)
    ├── src/
    │   ├── config/        # Configuración (BD, JWT, logger)
    │   ├── controllers/   # Lógica de endpoints
    │   ├── routes/        # Definición de rutas API
    │   ├── services/      # Lógica de negocio
    │   ├── middlewares/   # Auth, validación, errores
    │   ├── validators/    # Schemas Joi
    │   ├── sockets/       # WebSocket (mensajería)
    │   ├── utils/         # Funciones auxiliares
    │   └── index.js       # Servidor principal
    ├── prisma/
    │   ├── schema.prisma  # Modelos BD (18 tablas)
    │   └── seed.js        # Datos iniciales
    ├── .env.example       # Variables de entorno
    ├── package.json
    └── README.md          # Frontend setup
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
---

## 🔧 Backend - Decisiones de Arquitectura (TFG Nivel Avanzado)

### 🗄️ Por qué PostgreSQL + Prisma

**PostgreSQL:**
- ✅ RDBMS robusto, usado en producción (startups, Google, AirBnB)
- ✅ Relaciones complejas (many-to-many, constraints)
- ✅ Índices avanzados (performance en búsquedas)
- ✅ Transacciones ACID garantizadas
- ✅ Escalabilidad horizontal con replicación
- ❌ No fue elegido: MongoDB (NoSQL overkill aquí, relaciones complejas)
- ❌ No fue elegido: SQLite (desarrollo local, no escala)

**Prisma ORM:**
- ✅ Type-safe queries (TypeScript auto-complete)
- ✅ Migrations automáticas y versionadas
- ✅ Studio web para inspeccionar datos
- ✅ Dev experience excelente (less boilerplate)
- ✅ Relaciones simplificadas vs Sequelize/TypeORM
- ❌ No fue elegido: Raw SQL (error-prone, SQL injection)
- ❌ No fue elegido: Sequelize (verbose, muchas callbacks)

### 🔐 Arquitectura de Autenticación

**JWT + Refresh Tokens:**
- ✅ Stateless (no almacena sesiones en servidor)
- ✅ Escalable (múltiples servidores, sin sincronización)
- ✅ Mobile-friendly (token en localStorage/secure storage)
- ✅ CORS compatible (headers Authorization)
- ✅ Expiración configurable (7 días + refresh 30 días)

**Flujo:**
```
1. Login → Genera JWT (7d) + Refresh Token (30d)
2. Requests API → Header: Authorization: Bearer <JWT>
3. JWT expira → Client manda Refresh Token
4. Backend genera nuevo JWT → Client continúa
5. Seguridad: bcrypt (10 rounds) para contraseñas
```

### 💬 WebSocket - Por qué Socket.io

**Alternativas consideradas:**
- ✅ Socket.io: Fallback polling, eventos simples, comunidad grande
- ❌ WebSocket puro: Sin fallback, más bajo nivel
- ❌ GraphQL Subscriptions: Overkill, más complejidad
- ❌ Server-Sent Events: Solo servidor → cliente

**Casos uso:**
- Mensajería directa (M2M)
- Notificaciones en tiempo real
- Feed live (posts nuevos)
- Usuarios en línea/estado

### 📊 Modelo de Datos (18 tablas)

**Núcleo:**
- `User` → Cuenta principal (email, contraseña, rol)
- `StudentProfile`, `EnterpriseProfile`, `CenterProfile` → Datos específicos

**Red Social:**
- `Post`, `Comment`, `Like` → Feed interactivo
- `Connection` → Sistema follow (arquitectura)
- `Activity` → Auditoría de acciones

**Mensajería:**
- `Conversation`, `Message` → Chat 1-1 y grupo
- Índices en `createdAt` para queries rápidas

**Bolsa empleo:**
- `JobOffer`, `JobApplication` → Ciclo vida oferta
- Enums (PRACTICAS, EMPLEO, BECA)

**Notificaciones + Auditoría:**
- `Notification` → Mail/push triggers
- `AuditLog` → Compliance regulatory

### 🎯 Patrón de Carpetas (Escalabilidad)

```
src/
├── config/        # Centralizar: BD, JWT, logger, env
├── controllers/   # Mapean rutas → servicios (thin logic)
├── routes/        # Definir endpoints + validación
├── services/      # Lógica compleja (negocios, transacciones)
├── middlewares/   # Auth, validación, errores globales
├── validators/    # Schemas Joi reutilizables
├── sockets/       # WebSocket handlers
├── errors/        # Custom error classes
└── utils/         # Helpers (formatters, dates, etc)
```

**Ventajas:**
- Separación clara responsabilidades
- Testeable (servicios sin dependencias HTTP)
- Reutilizable (servicios usables en CLI, jobs, etc)
- Escalable (agregar features = nuevos archivos)

### ⚡ Optimizaciones de Performance

1. **Índices en BD:**
   - `email` (login 50ms vs 500ms sin índice)
   - `userId` (filtrar posts/mensajes)
   - `createdAt` (pagination, sorting)

2. **Lazy Loading:**
   - Relations opcionales en Prisma (`.include()`)
   - Evitar N+1 queries

3. **Caching (futuro):**
   - Redis para sesiones, feed cache
   - Rate limiting (socket.io + express)

4. **Logging:**
   - Morgan para HTTP
   - Custom logger con niveles (debug, info, warn, error)
   - No loguear contraseñas

### 🔒 Seguridad

- **Helmet:** Headers HTTP seguros (XSS, clickjacking, etc)
- **CORS:** Whitelist de origins
- **Validación:** Joi + middleware validate
- **Error messages:** Genéricos (no filtran DB)
- **Rate limiting:** (TODO - agregar express-rate-limit)
- **SQL Injection:** Imposible con Prisma (parameterized queries)
- **CSRF:** Tokens de sesión (futuro)

---

## 🗺️ Hoja de ruta completa

### Fase 1 — Backend Base ✅ (COMPLETADO)
- ✅ Estructura escalable
- ✅ Autenticación JWT completa
- ✅ Prisma + PostgreSQL setup
- ✅ Socket.io configurado
- ✅ Middlewares (auth, validación, errores)

### Fase 2 — API Endpoints Core ✅ (COMPLETADO)
- ✅ Endpoints posts (CRUD + feed + search)
- ✅ Endpoints comentarios (CRUD + likes)
- ✅ Sistema connections/follow
- ✅ Endpoints usuarios (perfil + search)
- ✅ Búsqueda avanzada (posts + usuarios)
- ✅ Documentación completa endpoints

### Fase 3 — Features Red Social (EN DESARROLLO)
- [ ] Notificaciones en tiempo real
- [ ] Bolsa de empleo (job offers + applications)
- [ ] Perfil avanzado (CV upload, skills)
- [ ] Sistema de recomendaciones
- [ ] Mensajería privada (1-1 y grupos)

### Fase 4 — Optimización + Deploy
- [ ] Rate limiting + caching (Redis)
- [ ] Documentación Swagger/OpenAPI
- [ ] Tests (Jest + Supertest)
- [ ] CI/CD (GitHub Actions)

### Fase 5 — Deploy + App Escritorio
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] App para Windows
- [ ] Si da tiempo Chatbot IA (OpenAI/Gemini)
---

## 🚀 Setup Backend

### Requisitos previos
- Node.js 18+
- PostgreSQL 14+
- Git

### Instalación paso a paso

```bash
# 1. Ir a carpeta backend
cd backend

# 2. Instalar dependencias
npm install

# 3. Crear archivo .env (copiar de .env.example)
cp .env.example .env

# 4. Actualizar DATABASE_URL en .env
# Ejemplo local:
# DATABASE_URL="postgresql://user:password@localhost:5432/fpconnect_db?schema=public"

# 5. Ejecutar migraciones Prisma
npm run db:setup

# 6. Generar cliente Prisma
npm run db:generate

# 7. Iniciar servidor desarrollo
npm run dev

# ✅ Servidor en http://localhost:3000
```

### Variables de entorno (.env)

```env
# Puerto
PORT=3000
NODE_ENV=development

# Base de datos PostgreSQL
DATABASE_URL=postgresql://user:pass@localhost:5432/fpconnect_db

# JWT
JWT_SECRET=tu_super_secret_25_caracteres_minimo_2024
REFRESH_TOKEN_SECRET=otro_secret_25_caracteres_minimo_2024

# CORS
CORS_ORIGIN=http://localhost:5173

# Otros
FRONTEND_URL=http://localhost:5173
```

### Primeras pruebas con cURL

```bash
# 1. Registrar usuario
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securePass123",
    "firstName": "Juan",
    "lastName": "García",
    "role": "ALUMNO"
  }'

# 2. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securePass123"
  }'

# 3. Obtener perfil (usar token del login)
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <tu_token_aqui>"
```

### Prisma Studio (UI para BD)

```bash
# Visualizar/editar BD en web
npx prisma studio

# Abre en http://localhost:5555
```

---

## 🚀 Setup Frontend

```bash
# 1. Desde raíz del proyecto
cd frontend (o simplemente npm install si estás en raíz)

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor desarrollo
npm run dev

# ✅ Accede en http://localhost:5173
```

---

## 🎓 Datos de prueba incluidos

- **6 centros FP** reales de Andalucía (Almería, Málaga, Sevilla, Granada, Córdoba, Jaén)
- **6 alumnos** con perfiles completos, skills y disponibilidad
- **4 empresas** con vacantes y descripción
- **5 noticias** de becas, convocatorias y eventos

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
