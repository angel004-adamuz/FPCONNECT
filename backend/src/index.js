// Servidor principal - FPConnect Backend
import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Configuración
import config from './config/index.js';
import logger from './config/logger.js';
import prisma from './config/prisma.js';

// Middlewares
import { errorHandler } from './middlewares/errorHandler.js';

// Socket.io
import { initializeSocket } from './sockets/messaging.socket.js';

// Rutas
import authRoutes from './routes/auth.routes.js';
import postRoutes from './routes/post.routes.js';
import commentRoutes from './routes/comment.routes.js';
import userRoutes from './routes/user.routes.js';
import connectionRoutes from './routes/connection.routes.js';
import jobOfferRoutes from './routes/jobOffer.routes.js';

// ============ INICIALIZACIÓN ============

const app = express();
const server = http.createServer(app);
const io = initializeSocket(server, config);

const isPrivateIpv4Host = (hostname) => {
  if (!hostname) return false;
  if (/^10\./.test(hostname)) return true;
  if (/^192\.168\./.test(hostname)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)) return true;
  return false;
};

const isDevelopmentLanOrigin = (origin) => {
  if (!config.isDevelopment()) return false;
  try {
    const parsed = new URL(origin);
    const hostname = parsed.hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1' || isPrivateIpv4Host(hostname);
  } catch {
    return false;
  }
};

// ============ BODY PARSERS ============

app.use(express.json());
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ============ SEGURIDAD ============

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin Origin (Postman, curl, server-to-server)
    if (!origin) {
      callback(null, true);
      return;
    }

    const allowedOrigins = config.cors_origin || [];
    const isExplicitlyAllowed = allowedOrigins.includes(origin);
    const isLocalhostOrLanDevOrigin = isDevelopmentLanOrigin(origin);

    if (isExplicitlyAllowed || isLocalhostOrLanDevOrigin) {
      callback(null, true);
      return;
    }

    callback(new Error('CORS origin no permitido'));
  },
  credentials: true,
}));

// ============ LOGGING ============

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// ============ HEALTH CHECK ============

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Servidor activo ✅',
    timestamp: new Date().toISOString(),
    environment: config.node_env,
  });
});

// ============ API ROUTES ============

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/posts/:postId/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/job-offers', jobOfferRoutes);

// Rutas temporales de demostración
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'FPConnect API v1.0',
    docs: 'https://github.com/fpconnect/backend',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      posts: '/api/posts',
      comments: '/api/posts/:postId/comments',
      users: '/api/users',
      connections: '/api/connections',
      messages: '/api/messages (próximamente)',
      jobs: '/api/jobs (próximamente)',
    },
  });
});

// ============ 404 - RUTA NO ENCONTRADA ============

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.path,
    method: req.method,
  });
});

// ============ ERROR HANDLING ============

app.use(errorHandler);

// ============ SERVIDOR ============

const startServer = async () => {
  try {
    // Verificar conexión a BD
    await prisma.$connect();
    logger.info('✅ Conectado a base de datos PostgreSQL');

    // Iniciar servidor
    server.listen(config.port, config.host, () => {
      logger.info(`
╔═══════════════════════════════════════╗
║   🚀 FPConnect Backend - Servidor      ║
║   Host: ${config.host}
║   Puerto: ${config.port}
║   Ambiente: ${config.node_env}
║   Log Level: ${config.log_level}
║═══════════════════════════════════════╝
      `);
      logger.info(`📍 Accede a http://localhost:${config.port} y desde tu LAN con la IP del equipo`);
      logger.info('💬 WebSocket activo para mensajería en tiempo real');
    });
  } catch (error) {
    logger.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
};

// ============ MANEJO DE SEÑALES ============

process.on('SIGTERM', async () => {
  logger.warn('⚠️ Señal SIGTERM recibida');
  await prisma.$disconnect();
  server.close(() => {
    logger.info('✅ Servidor cerrado');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.warn('⚠️ Señal SIGINT recibida');
  await prisma.$disconnect();
  server.close(() => {
    logger.info('✅ Servidor cerrado');
    process.exit(0);
  });
});

process.on('uncaughtException', (error) => {
  logger.error('❌ Excepción no capturada:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Promesa rechazada no manejada:', reason);
  process.exit(1);
});

// ============ EXPORTAR ============

startServer();

export { app, server, io };
