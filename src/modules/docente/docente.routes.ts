import { Router } from 'express';
import { RolUsuario } from '@prisma/client';
import { middlewareAutenticacion, requerirRol, RequestConUsuario } from '../../core/auth';
import { DocenteController } from './docente.controller';
import {
  consultaAsistenciaSchema,
  consultaPlanSchema,
  crearPlanEvaluacionSchema,
  registrarAsistenciasSchema,
  registrarCalificacionSchema,
} from './docente.validations';

const router = Router();

router.use(middlewareAutenticacion);
router.use(requerirRol(RolUsuario.DOCENTE));

router.get('/carga-academica', DocenteController.obtenerCargaAcademica);
router.get('/carga-academica/:cursoMateriaId/estudiantes', DocenteController.obtenerEstudiantesDelCurso);

router.get('/planes', (req: RequestConUsuario, res, next) => {
  const parsed = consultaPlanSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ mensaje: 'Parámetros inválidos', errores: parsed.error.flatten() });
  }
  req.query = parsed.data as any;
  next();
}, DocenteController.obtenerPlanes);

router.post('/planes', (req, res, next) => {
  const parsed = crearPlanEvaluacionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ mensaje: 'Datos inválidos', errores: parsed.error.flatten() });
  }
  req.body = parsed.data;
  next();
}, DocenteController.crearPlanEvaluacion);

router.post('/calificaciones', (req, res, next) => {
  const parsed = registrarCalificacionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ mensaje: 'Datos inválidos', errores: parsed.error.flatten() });
  }
  req.body = parsed.data;
  next();
}, DocenteController.registrarCalificacion);

router.post('/asistencias', (req, res, next) => {
  const parsed = registrarAsistenciasSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ mensaje: 'Datos inválidos', errores: parsed.error.flatten() });
  }
  req.body = parsed.data;
  next();
}, DocenteController.registrarAsistencias);

router.get('/asistencias', (req: RequestConUsuario, res, next) => {
  const parsed = consultaAsistenciaSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ mensaje: 'Parámetros inválidos', errores: parsed.error.flatten() });
  }
  req.query = parsed.data as any;
  next();
}, DocenteController.obtenerAsistencias);

export const rutasDocente = router;