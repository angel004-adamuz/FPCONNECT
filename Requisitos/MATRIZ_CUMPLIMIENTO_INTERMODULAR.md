# Matriz de Cumplimiento - Proyecto Intermodular DAM (FPConnect)

## 1. Objetivo
Este documento enlaza los criterios de la carpeta `Requisitos/` con evidencias concretas del proyecto para facilitar revision y defensa.

## 2. Evidencias por modulo

### 0373 - Lenguajes de marcas y SGI
- Criterio: uso de lenguaje de marcas de proposito general.
- Evidencia:
  - `package.json` y `backend/package.json` (JSON real de configuracion).
  - `backend/prisma/schema.prisma` (DSL declarativo del modelo de datos).
  - `Requisitos\config_proyecto.yaml` (YAML de configuracion y metadatos para memoria).

### 0483 - Sistemas Informaticos
- Criterio: preparacion del entorno de despliegue (Windows Server/Linux).
- Evidencia:
  - `backend/README.md` (setup de backend y DB).
  - `backend/DATABASE_SETUP.md` (proceso de base de datos).
  - `Requisitos\despliegue_produccion_linux.md` (plan de despliegue propuesto).

### 0484 - Bases de Datos
- Criterio: tablas, relaciones, tipos y claves.
- Evidencia:
  - `backend/prisma/schema.prisma`.
  - `backend/prisma/migrations/**/migration.sql`.
  - `backend/ARCHITECTURE.md`.

### 0485 - Programacion (POO)
- Criterio: clases, propiedades, metodos, constructores, herencia.
- Evidencia:
  - `backend/src/services/*.js` y `backend/src/controllers/*.js` (encapsulan logica por dominio).
  - `backend/src/middlewares/errorHandler.js` (`AppError` como clase base reutilizable).
  - `backend/src/sockets/messaging.socket.js` (objetos y handlers de dominio en tiempo real).

### 0487 - Entornos de Desarrollo
- Criterio: control de versiones.
- Evidencia:
  - Repositorio Git del proyecto (`.git/`).
  - Historial de commits y ramas de trabajo.

### 1665 - Digitalizacion aplicada
- Criterio: herramientas colaborativas y gestion documental.
- Evidencia:
  - Repositorio estructurado por carpetas.
  - Documentacion tecnica en `README.md`, `FRONTEND_INTEGRATION.md`, `backend/*.md`.

### 1708 - Sostenibilidad
- Criterio: impacto ambiental, eficiencia y reciclaje.
- Evidencia:
  - `Requisitos\plan_sostenibilidad_cpd.md`.

### 1709 - IPE I
- Criterio: CV tecnico y perfil profesional.
- Evidencia:
  - `Requisitos\resumen_ejecutivo_en.md` (extracto profesional en ingles tecnico).
  - `Requisitos\glosario_es_en.md`.

### 0489 - Programacion multimedia y dispositivos moviles
- Criterio: version movil de la aplicacion.
- Estado:
  - Parcial: interfaz responsive en frontend web (`src/pages/*.jsx`, `src/styles/global.css`).
  - Pendiente: empaquetado movil nativo (Flutter/Android/iOS) como linea futura.

### 0179 - Ingles profesional
- Criterio: textos tecnicos en ingles y glosario.
- Evidencia:
  - `Requisitos\resumen_ejecutivo_en.md`.
  - `Requisitos\glosario_es_en.md`.

### 0486 - Acceso a datos
- Criterio: ORM y consultas SQL.
- Evidencia:
  - Prisma ORM en `backend/prisma/schema.prisma` y `backend/src/services/*.js`.
  - Migraciones y consultas generadas por Prisma.

### 0491 - Sistemas de gestion y procesos
- Criterio: extracciones de datos e informes.
- Evidencia:
  - Endpoints de consulta y agregacion (`backend/src/controllers/*.js`, `backend/src/services/*.js`).
  - `backend/API_ENDPOINTS.md` y `backend/ENDPOINTS_SUMMARY.md`.

### 0488 - Desarrollo de interfaces
- Criterio: usabilidad, distribucion y navegacion coherente.
- Evidencia:
  - `src/pages/LoginPage.jsx`, `src/pages/AlumnoApp.jsx`, `src/pages/CentroApp.jsx`, `src/pages/EmpresaApp.jsx`.
  - Componentes reutilizables en `src/components/`.

### 0490 - Programacion de servicios y procesos
- Criterio: servidor en red, sockets y concurrencia cliente-servidor.
- Evidencia:
  - `backend/src/index.js` (servidor HTTP).
  - `backend/src/sockets/messaging.socket.js` (Socket.io, conexion simultanea).

### 0492 - Proyecto intermodular
- Criterio: documentacion metrica y presentacion.
- Evidencia:
  - `FPConnect_TFG.tex` (memoria).
  - `FPConnect_TFG_Presentacion.pptx` (presentacion).

## 3. Riesgos y acciones de cierre
- Riesgo: modulo movil (0489) no empaquetado de forma nativa.
- Accion propuesta: desarrollar MVP movil con React Native o Flutter usando el backend existente.

- Riesgo: falta de anexos formalizados en memoria.
- Accion propuesta: incorporar anexos de API, scripts y capturas en version final PDF.
