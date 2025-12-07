// src/modules/director/director.routes.ts
// Añadir al inicio del archivo director.routes.ts
import { Response } from 'express'; // Faltaba esta importación
import { Router } from 'express';
import { DirectorController } from './director.controller';
import { middlewareAutenticacion, requerirRol, RequestConUsuario } from '../../core/auth';
import { RolUsuario } from '@prisma/client';
import { prisma } from '../../core/prisma';
import {
  crearCursoSchema,
  crearMateriaSchema,
  asignarDocenteSchema,
  asignarEstudianteCursoSchema,
  crearEventoSchema,
  crearAnoAcademicoSchema,
  queryParamsSchema
} from './director.validations';

const router = Router();

// ==================== MIDDLEWARES DE SEGURIDAD ====================
// Todas las rutas del director requieren autenticación y rol DIRECTOR
router.use(middlewareAutenticacion);
router.use(requerirRol(RolUsuario.DIRECTOR));

// ==================== DASHBOARD Y ESTADÍSTICAS ====================

/**
 * GET /api/director/dashboard
 * Obtiene el dashboard del director con estadísticas generales
 */
router.get('/dashboard', DirectorController.obtenerDashboard);

// ==================== GESTIÓN DE CURSOS ====================

/**
 * GET /api/director/cursos
 * Obtiene todos los cursos con paginación y búsqueda
 * Query params: page, limit, search
 */
router.get('/cursos', (req, res, next) => {
  try {
    // Validar y transformar query parameters
    const parsed = queryParamsSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({
        mensaje: 'Parámetros de consulta inválidos',
        errores: parsed.error.flatten(),
      });
    }
    // Guardar los valores parseados en res.locals
    res.locals.page = parsed.data.page;
    res.locals.limit = parsed.data.limit;
    res.locals.search = parsed.data.search;
    next();
  } catch (error) {
    res.status(400).json({ 
      mensaje: 'Parámetros de consulta inválidos', 
      errores: error 
    });
  }
}, DirectorController.obtenerCursos);

/**
 * POST /api/director/cursos
 * Crea un nuevo curso
 * Body: { nombre, nivelId, anoAcademicoId }
 */
router.post('/cursos', (req, res, next) => {
  try {
    crearCursoSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ 
      mensaje: 'Datos de entrada inválidos', 
      errores: error 
    });
  }
}, DirectorController.crearCurso);

// ==================== GESTIÓN DE MATERIAS ====================

/**
 * GET /api/director/materias
 * Obtiene todas las materias con sus cursos asignados
 */
router.get('/materias', DirectorController.obtenerMaterias);

/**
 * POST /api/director/materias
 * Crea una nueva materia
 * Body: { nombre }
 */
router.post('/materias', (req, res, next) => {
  try {
    crearMateriaSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ 
      mensaje: 'Datos de entrada inválidos', 
      errores: error 
    });
  }
}, DirectorController.crearMateria);

// ==================== ASIGNACIONES ====================

/**
 * POST /api/director/asignar-docente
 * Asigna un docente a una materia en un curso
 * Body: { cursoMateriaId, docenteId }
 */
router.post('/asignar-docente', (req, res, next) => {
  try {
    asignarDocenteSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ 
      mensaje: 'Datos de entrada inválidos', 
      errores: error 
    });
  }
}, DirectorController.asignarDocenteMateria);

/**
 * POST /api/director/asignar-estudiante-curso
 * Asigna un estudiante a un curso
 * Body: { estudianteId, cursoId }
 */
router.post('/asignar-estudiante-curso', (req, res, next) => {
  try {
    asignarEstudianteCursoSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ 
      mensaje: 'Datos de entrada inválidos', 
      errores: error 
    });
  }
}, DirectorController.asignarEstudianteCurso);

// ==================== SUPERVISIÓN (SOLO LECTURA) ====================

/**
 * GET /api/director/calificaciones
 * Obtiene calificaciones para supervisión (solo lectura)
 * Query params: cursoId, materiaId
 */
router.get('/calificaciones', DirectorController.obtenerCalificaciones);

/**
 * GET /api/director/asistencias
 * Obtiene asistencias para supervisión (solo lectura)
 * Query params: fecha, cursoId, estudianteId
 */
router.get('/asistencias', DirectorController.obtenerAsistencias);

// ==================== GESTIÓN DE AÑOS ACADÉMICOS ====================

/**
 * GET /api/director/anos-academicos
 * Obtiene todos los años académicos
 */
router.get('/anos-academicos', async (req: RequestConUsuario, res: Response) => {
  try {
    const anosAcademicos = await prisma.anoAcademico.findMany({
      orderBy: { fechaInicio: 'desc' },
      include: {
        cursos: {
          include: {
            estudiantes: true,
            materias: true
          }
        }
      }
    });

    res.json({
      mensaje: 'Años académicos obtenidos exitosamente',
      anosAcademicos
    });
  } catch (error) {
    console.error('💥 Error en obtener años académicos:', error);
    res.status(500).json({
      mensaje: 'Error al obtener años académicos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/director/anos-academicos
 * Crea un nuevo año académico
 * Body: { nombre, fechaInicio, fechaFin }
 */
// En la ruta POST /anos-academicos
router.post('/anos-academicos', (req: RequestConUsuario, res: Response, next) => {
  try {
    crearAnoAcademicoSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ 
      mensaje: 'Datos de entrada inválidos', 
      errores: error 
    });
  }
}, async (req: RequestConUsuario, res: Response) => {
  try {
    // VERIFICACIÓN AÑADIDA AQUÍ
    if (!req.usuario) {
      return res.status(401).json({ mensaje: 'Usuario no autenticado' });
    }

    const { nombre, fechaInicio, fechaFin } = req.body;

    await prisma.anoAcademico.updateMany({
      where: { activo: true },
      data: { activo: false }
    });

    const anoAcademico = await prisma.anoAcademico.create({
      data: {
        nombre,
        fechaInicio: new Date(fechaInicio),
        fechaFin: new Date(fechaFin),
        activo: true
      }
    });

    await prisma.registroAuditoria.create({
      data: {
        accion: 'CREAR_ANO_ACADEMICO',
        detalles: `Año académico creado: ${nombre}`,
        usuarioId: req.usuario.sub, // Ahora seguro
        ipAddress: req.ip
      }
    });

    res.status(201).json({
      mensaje: 'Año académico creado exitosamente',
      anoAcademico
    });
  } catch (error) {
    console.error('💥 Error en crear año académico:', error);
    res.status(500).json({
      mensaje: 'Error al crear año académico',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// En la ruta POST /eventos
router.post('/eventos', (req: RequestConUsuario, res: Response, next) => {
  try {
    crearEventoSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ 
      mensaje: 'Datos de entrada inválidos', 
      errores: error 
    });
  }
}, async (req: RequestConUsuario, res: Response) => {
  try {
    // VERIFICACIÓN AÑADIDA AQUÍ
    if (!req.usuario) {
      return res.status(401).json({ mensaje: 'Usuario no autenticado' });
    }

    const { titulo, fecha, descripcion, cursoId } = req.body;

    const evento = await prisma.evento.create({
      data: {
        titulo,
        fecha: new Date(fecha),
        descripcion,
        cursoId: cursoId || null
      },
      include: {
        curso: true
      }
    });

    await prisma.registroAuditoria.create({
      data: {
        accion: 'CREAR_EVENTO',
        detalles: `Evento creado: ${titulo}`,
        usuarioId: req.usuario.sub, // Ahora seguro
        ipAddress: req.ip
      }
    });

    res.status(201).json({
      mensaje: 'Evento creado exitosamente',
      evento
    });
  } catch (error) {
    console.error('💥 Error en crear evento:', error);
    res.status(500).json({
      mensaje: 'Error al crear evento',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Al final de director.routes.ts
export const rutasDirector = router;