# 🌿 FPConnect — Red Social de Formación Profesional

**TFG — Desarrollo de Aplicaciones Multiplataforma (DAM) · 2025**

> Plataforma web para conectar alumnos de FP, centros educativos y empresas en Andalucía.

---

## 🚀 Arrancar el proyecto

### Requisitos previos
- Node.js 18+
- Git

### 1. Clonar el repositorio
```bash
git clone https://github.com/rafamarcoss/FPCONNECT.git
cd FPCONNECT
```

### 2. Configurar el frontend
```bash
npm install
```
Crea un archivo `.env` en la raíz:
VITE_API_BASE_URL=http://localhost:3000/api

### 3. Configurar el backend
```bash
cd backend
npm install
```
Crea un archivo `.env` en la carpeta `backend`:
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
JWT_SECRET=tu_jwt_secret
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=tu_refresh_secret
REFRESH_TOKEN_EXPIRES_IN=30d
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173

### 4. Preparar la base de datos
```bash
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```

### 5. Arrancar backend y frontend

Terminal 1 (backend):
```bash
cd backend
npm run dev
```

Terminal 2 (frontend):
```bash
npm run dev
```

Abre el navegador en **http://localhost:5173** 🎉

---

## 🏗️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React 18 + Vite |
| **Backend** | Node.js + Express + Prisma |
| **Base de datos** | PostgreSQL (Supabase) |
| **Autenticación** | JWT + Refresh Tokens |
| **Deploy web** | Vercel (frontend) |

---

## 📁 Estructura del proyecto
FPCONNECT/
├── src/                  # Frontend React
│   ├── components/       # Componentes reutilizables
│   ├── pages/            # Vistas por rol (Alumno, Centro, Empresa)
│   ├── services/         # Llamadas al backend (API client)
│   ├── store/            # Estado global (Zustand)
│   └── App.jsx           # Router principal
├── backend/              # Backend Node.js
│   ├── src/
│   │   ├── routes/       # Endpoints REST
│   │   ├── controllers/  # Lógica de negocio
│   │   ├── middleware/   # Auth, validación
│   │   └── config/       # Prisma, logger
│   └── prisma/
│       ├── schema.prisma # Modelo de datos
│       └── seed.js       # Datos de prueba
└── .env                  # Variables de entorno frontend

---

## 👥 Roles y funcionalidades

### 🎓 Alumno
- Feed de publicaciones con me gusta y comentarios
- Conexiones: seguir centros, empresas y otros alumnos
- Explorar centros educativos, empresas y alumnos de Andalucía
- Noticias FP: becas, convocatorias y eventos

### 🏫 Centro FP
- Dashboard con métricas del centro
- Gestión de alumnos y publicaciones
- Perfil público del centro

### 💼 Empresa
- Buscador de talento filtrado por ciclo y ciudad
- Gestión de ofertas de trabajo y prácticas FCT
- Perfil de empresa público

---

## 🗃️ Datos de prueba (seed)

- **5 centros FP** de Andalucía (Granada, Málaga, Sevilla, Córdoba, Huelva)
- **10 empresas** tecnológicas andaluzas
- **10 alumnos** con perfiles completos (DAM, DAW, ASIR, SMR)
- Publicaciones, conexiones y seguimientos entre todos ellos

Credenciales de prueba:
- Email: `alumno@test.com` / Contraseña: `Password123`

---

## 🔐 Seguridad

- Autenticación con JWT + Refresh Token automático
- Row Level Security (RLS) activado en Supabase
- Contraseñas hasheadas con bcrypt

---

*Desarrollado como Trabajo de Fin de Grado · DAM · 2025*  
*Stack: React + Vite + Express + Prisma + PostgreSQL (Supabase)*