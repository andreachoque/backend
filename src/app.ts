import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { rutasAuth } from './modules/auth/auth.routes';
import { rutasAdmin } from './modules/admin/admin.routes';
import { rutasDirector } from './modules/director/director.routes'; // ← CORREGIDO: rutasDirector
import { rutasDocente } from './modules/docente/docente.routes';
import { rutasTutor } from './modules/tutor/tutor.routes';
import { rutasEstudiante } from './modules/estudiante/estudiante.routes';
import { verificarConexionBD } from './core/prisma';

const app = express();

// ==================== MIDDLEWARES GLOBALES ====================
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ==================== RUTAS DE LA API ====================

// Health check
app.get('/api/health', async (_req, res) => {
  const conexionBD = await verificarConexionBD();
  res.json({ 
    estado: 'ok',
    mensaje: 'API Académica funcionando correctamente',
    timestamp: new Date().toISOString(),
    baseDeDatos: conexionBD ? 'conectada' : 'error'
  });
});

// Ruta de bienvenida
app.get('/api', (_req, res) => {
  res.json({
    mensaje: 'Bienvenido a la API del Sistema Académico',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      admin: '/api/admin',
      director: '/api/director',
      docente: '/api/docente',
      tutor: '/api/tutor',
      estudiante: '/api/estudiante',
      health: '/api/health'
    }
  });
});

// Rutas de autenticación
app.use('/api/auth', rutasAuth);

// ==================== RUTAS ADMINISTRADOR ====================
app.use('/api/admin', rutasAdmin);

// ==================== NUEVAS RUTAS: MÓDULO DIRECTOR ====================
app.use('/api/director', rutasDirector);

// ==================== NUEVAS RUTAS: MÓDULO DOCENTE ====================
app.use('/api/docente', rutasDocente);

// ==================== NUEVAS RUTAS: MÓDULO TUTOR ====================
app.use('/api/tutor', rutasTutor);

// ==================== NUEVAS RUTAS: MÓDULO ESTUDIANTE ====================
app.use('/api/estudiante', rutasEstudiante);

// ==================== MANEJO DE ERRORES ====================

// Middleware para rutas no encontradas (404)
app.use('*', (req, res) => {
  res.status(404).json({
    mensaje: 'Ruta no encontrada',
    ruta: req.originalUrl,
    metodo: req.method
  });
});

// Middleware global de errores
app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('💥 Error no manejado:', error);
  res.status(500).json({
    mensaje: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

export default app;