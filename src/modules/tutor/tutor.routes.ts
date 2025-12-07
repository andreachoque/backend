import { Router } from 'express';
import { RolUsuario } from '@prisma/client';
import { middlewareAutenticacion, requerirRol } from '../../core/auth';
import { TutorController } from './tutor.controller';
import { consultaAsistenciasSchema, consultaCalificacionesSchema, rutaHijoParamsSchema } from './tutor.validations';

const router = Router();

router.use(middlewareAutenticacion);
router.use(requerirRol(RolUsuario.TUTOR));

router.get('/hijos', TutorController.obtenerHijos);

router.get('/hijos/:estudianteId/calificaciones', (req, res, next) => {
  const paramsParse = rutaHijoParamsSchema.safeParse(req.params);
  const queryParse = consultaCalificacionesSchema.safeParse(req.query);

  if (!paramsParse.success || !queryParse.success) {
    const errores = {
      ...(paramsParse.success ? {} : paramsParse.error.flatten()),
      ...(queryParse.success ? {} : queryParse.error.flatten())
    };
    return res.status(400).json({ mensaje: 'Datos inválidos', errores });
  }

  req.params = paramsParse.data;
  req.query = queryParse.data as any;
  next();
}, TutorController.obtenerCalificaciones);

router.get('/hijos/:estudianteId/asistencias', (req, res, next) => {
  const paramsParse = rutaHijoParamsSchema.safeParse(req.params);
  const queryParse = consultaAsistenciasSchema.safeParse(req.query);

  if (!paramsParse.success || !queryParse.success) {
    const errores = {
      ...(paramsParse.success ? {} : paramsParse.error.flatten()),
      ...(queryParse.success ? {} : queryParse.error.flatten())
    };
    return res.status(400).json({ mensaje: 'Datos inválidos', errores });
  }

  req.params = paramsParse.data;
  req.query = queryParse.data as any;
  next();
}, TutorController.obtenerAsistencias);

router.get('/comunicaciones', TutorController.obtenerComunicaciones);

export const rutasTutor = router;