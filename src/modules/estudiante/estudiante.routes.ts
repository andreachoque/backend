import { Router } from 'express';
import { RolUsuario } from '@prisma/client';
import { middlewareAutenticacion, requerirRol, RequestConUsuario } from '../../core/auth';
import { EstudianteController } from './estudiante.controller';
import {
  filtrosAgendaSchema,
  filtrosAsistenciasSchema,
  filtrosCalificacionesSchema,
  filtrosMensajesSchema
} from './estudiante.validations';

const router = Router();

router.use(middlewareAutenticacion);
router.use(requerirRol(RolUsuario.ESTUDIANTE));

router.get('/perfil', EstudianteController.obtenerPerfil);

router.get('/calificaciones', (req: RequestConUsuario, res, next) => {
  const parsed = filtrosCalificacionesSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ mensaje: 'Filtros inválidos', errores: parsed.error.flatten() });
  }
  req.query = parsed.data as any;
  next();
}, EstudianteController.obtenerCalificaciones);

router.get('/asistencias', (req: RequestConUsuario, res, next) => {
  const parsed = filtrosAsistenciasSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ mensaje: 'Filtros inválidos', errores: parsed.error.flatten() });
  }
  req.query = parsed.data as any;
  next();
}, EstudianteController.obtenerAsistencias);

router.get('/agenda', (req: RequestConUsuario, res, next) => {
  const parsed = filtrosAgendaSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ mensaje: 'Filtros inválidos', errores: parsed.error.flatten() });
  }
  req.query = parsed.data as any;
  next();
}, EstudianteController.obtenerAgenda);

router.get('/mensajes', (req: RequestConUsuario, res, next) => {
  const parsed = filtrosMensajesSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ mensaje: 'Filtros inválidos', errores: parsed.error.flatten() });
  }
  req.query = parsed.data as any;
  next();
}, EstudianteController.obtenerMensajesCurso);

export const rutasEstudiante = router;