---
# FPConnect — Próxima sesión

## Estado actual
- Auth completo con persistencia
- Feed con posts, likes, comentarios
- Sistema de seguimiento
- Bolsa de empleo con aplicaciones
- Mensajería 1-1 en tiempo real
- Notificaciones en tiempo real
- Tests backend (16/16 passing)

## Tareas para mañana

### 1. Animaciones UI/UX
Mejorar la experiencia de usuario añadiendo animaciones suaves en toda la app:
- Transiciones de entrada/salida en cards y listas (fade + slide)
- Animación al dar like (corazón que pulsa)
- Skeleton loaders mientras cargan posts, perfiles y ofertas
- Transición suave al abrir/cerrar el panel de mensajes y notificaciones
- Micro-animaciones en botones (hover, click feedback)
- Animación de entrada en el dashboard al hacer login
- Usar CSS transitions o una librería ligera como framer-motion

### 2. Reemplazar emojis por imágenes generadas con IA
Sustituir todos los emojis usados en la UI por imágenes generadas con GPT Image:
- Identificar todos los emojis usados en componentes JSX y CSS
- Generar imágenes consistentes con el estilo visual de la app para cada emoji
- Guardarlas en src/assets/icons/
- Reemplazar cada emoji por un <img> o componente <Icon> reutilizable

---
