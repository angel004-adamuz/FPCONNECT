# Despliegue de Produccion (Linux Server)

## 1. Objetivo
Definir un entorno de produccion valido para backend y base de datos, alineado con los requisitos de Sistemas Informaticos.

## 2. Arquitectura objetivo
- SO: Ubuntu Server 24.04 LTS
- Reverse proxy: Nginx
- Backend Node.js: PM2
- Base de datos: PostgreSQL 15
- Certificados TLS: Let's Encrypt
- Logs: journald + rotacion de logs

## 3. Pasos de instalacion
1. Actualizar sistema:
   - `sudo apt update && sudo apt upgrade -y`
2. Instalar Node LTS, Nginx y PostgreSQL.
3. Crear usuario de servicio sin privilegios.
4. Clonar repositorio y configurar variables de entorno.
5. Ejecutar migraciones Prisma:
   - `npm run db:generate`
   - `npx prisma migrate deploy`
6. Arrancar backend con PM2 y habilitar arranque automatico.
7. Configurar Nginx para proxy a `localhost:3000`.
8. Activar HTTPS con certbot.

## 4. Endurecimiento y seguridad
- Firewall con UFW (80/443 abiertos, 22 restringido).
- Base de datos no expuesta a internet publica.
- Backups diarios de PostgreSQL con retencion de 7-30 dias.
- Rotacion de secretos (JWT, DB, API keys).

## 5. Verificacion
- Health check: `GET /health` devuelve 200.
- Logs sin errores criticos durante 24h.
- Tiempo de respuesta medio < 500ms para endpoints principales.
