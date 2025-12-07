import { Response } from 'express';
import { prisma } from '../../core/prisma';
import { RequestConUsuario } from '../../core/auth';
import { CalificacionPayload, PlanEvaluacionPayload, RegistroAsistenciaPayload } from './types/docente.types';

export class DocenteController {
  static async obtenerCargaAcademica(req: RequestConUsuario, res: Response) {
    try {
      const docente = await prisma.perfilDocente.findUnique({
        where: { usuarioId: req.usuario!.sub },
      });

      if (!docente) {
        return res.status(404).json({ mensaje: 'Perfil de docente no encontrado' });
      }

      const asignaciones = await prisma.cursoMateria.findMany({
        where: { docenteId: docente.id },
        include: {
          curso: { include: { nivel: true, anoAcademico: true } },
          materia: true,
          evaluaciones: true,
        },
        orderBy: [{ curso: { nombre: 'asc' } }, { materia: { nombre: 'asc' } }],
      });

      return res.json({
        mensaje: 'Carga académica obtenida',
        asignaciones,
      });
    } catch (error) {
      console.error('💥 Error en obtenerCargaAcademica:', error);
      return res.status(500).json({
        mensaje: 'Error al obtener carga académica',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      });
    }
  }

  static async obtenerEstudiantesDelCurso(req: RequestConUsuario, res: Response) {
    try {
      const docente = await prisma.perfilDocente.findUnique({
        where: { usuarioId: req.usuario!.sub },
      });

      if (!docente) {
        return res.status(404).json({ mensaje: 'Perfil de docente no encontrado' });
      }

      const cursoMateriaId = req.params.cursoMateriaId;

      const cursoMateria = await prisma.cursoMateria.findFirst({
        where: { id: cursoMateriaId, docenteId: docente.id },
        include: { curso: true, materia: true },
      });

      if (!cursoMateria) {
        return res.status(403).json({ mensaje: 'No tienes acceso a este curso-materia' });
      }

      const estudiantes = await prisma.perfilEstudiante.findMany({
        where: { cursoId: cursoMateria.cursoId },
        include: {
          usuario: { select: { nombre: true, apellido: true, email: true } },
        },
        orderBy: { usuario: { apellido: 'asc' } },
      });

      return res.json({
        mensaje: 'Estudiantes obtenidos',
        curso: {
          id: cursoMateria.curso.id,
          nombre: cursoMateria.curso.nombre,
          materia: cursoMateria.materia.nombre,
        },
        estudiantes,
      });
    } catch (error) {
      console.error('💥 Error en obtenerEstudiantesDelCurso:', error);
      return res.status(500).json({
        mensaje: 'Error al obtener estudiantes',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      });
    }
  }

  static async crearPlanEvaluacion(req: RequestConUsuario, res: Response) {
    try {
      const docente = await prisma.perfilDocente.findUnique({
        where: { usuarioId: req.usuario!.sub },
      });

      if (!docente) {
        return res.status(404).json({ mensaje: 'Perfil de docente no encontrado' });
      }

      const data = req.body as PlanEvaluacionPayload;

      const cursoMateria = await prisma.cursoMateria.findFirst({
        where: { id: data.cursoMateriaId, docenteId: docente.id },
        include: { materia: true, curso: true },
      });

      if (!cursoMateria) {
        return res.status(403).json({ mensaje: 'No puedes crear evaluaciones en este curso-materia' });
      }

      const plan = await prisma.planEvaluacion.create({
        data: {
          titulo: data.titulo,
          descripcion: data.descripcion,
          porcentaje: data.porcentaje,
          fecha: data.fecha ? new Date(data.fecha) : null,
          cursoMateriaId: data.cursoMateriaId,
        },
      });

      await prisma.registroAuditoria.create({
        data: {
          accion: 'CREAR_PLAN_EVALUACION',
          detalles: `Plan creado para ${cursoMateria.materia.nombre} - ${cursoMateria.curso.nombre}`,
          usuarioId: req.usuario!.sub,
          ipAddress: req.ip,
        },
      });

      return res.status(201).json({
        mensaje: 'Plan de evaluación creado',
        plan,
      });
    } catch (error) {
      console.error('💥 Error en crearPlanEvaluacion:', error);
      return res.status(500).json({
        mensaje: 'Error al crear plan de evaluación',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      });
    }
  }

  static async obtenerPlanes(req: RequestConUsuario, res: Response) {
    try {
      const docente = await prisma.perfilDocente.findUnique({
        where: { usuarioId: req.usuario!.sub },
      });

      if (!docente) {
        return res.status(404).json({ mensaje: 'Perfil de docente no encontrado' });
      }

      const { cursoMateriaId } = req.query;

      const planes = await prisma.planEvaluacion.findMany({
        where: {
          ...(cursoMateriaId ? { cursoMateriaId: cursoMateriaId as string } : {}),
          cursoMateria: { docenteId: docente.id },
        },
        include: {
          cursoMateria: {
            include: { curso: true, materia: true },
          },
          calificaciones: true,
        },
        orderBy: { fecha: 'asc' },
      });

      return res.json({
        mensaje: 'Planes de evaluación obtenidos',
        planes,
      });
    } catch (error) {
      console.error('💥 Error en obtenerPlanes:', error);
      return res.status(500).json({
        mensaje: 'Error al obtener planes de evaluación',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      });
    }
  }

  static async registrarCalificacion(req: RequestConUsuario, res: Response) {
    try {
      const docente = await prisma.perfilDocente.findUnique({
        where: { usuarioId: req.usuario!.sub },
      });

      if (!docente) {
        return res.status(404).json({ mensaje: 'Perfil de docente no encontrado' });
      }

      const data = req.body as CalificacionPayload;

      const plan = await prisma.planEvaluacion.findFirst({
        where: {
          id: data.planEvaluacionId,
          cursoMateria: { docenteId: docente.id },
        },
        include: {
          cursoMateria: { include: { curso: true, materia: true } },
        },
      });

      if (!plan) {
        return res.status(403).json({ mensaje: 'No puedes registrar calificaciones en este plan' });
      }

      const estudiante = await prisma.perfilEstudiante.findUnique({
        where: { id: data.estudianteId },
        include: { curso: true },
      });

      if (!estudiante || estudiante.cursoId !== plan.cursoMateria.cursoId) {
        return res.status(400).json({ mensaje: 'El estudiante no pertenece al curso de este plan' });
      }

      const calificacionExistente = await prisma.calificacion.findFirst({
        where: {
          estudianteId: data.estudianteId,
          planEvaluacionId: data.planEvaluacionId,
        },
      });

      let calificacion;

      if (calificacionExistente) {
        calificacion = await prisma.calificacion.update({
          where: { id: calificacionExistente.id },
          data: {
            puntaje: data.puntaje,
            retroalimentacion: data.retroalimentacion,
          },
        });
      } else {
        calificacion = await prisma.calificacion.create({
          data: {
            puntaje: data.puntaje,
            retroalimentacion: data.retroalimentacion,
            estudianteId: data.estudianteId,
            planEvaluacionId: data.planEvaluacionId,
          },
        });
      }

      await prisma.registroAuditoria.create({
        data: {
          accion: 'REGISTRAR_CALIFICACION',
          detalles: `Calificación registrada para ${plan.cursoMateria.materia.nombre} - ${plan.cursoMateria.curso.nombre}`,
          usuarioId: req.usuario!.sub,
          ipAddress: req.ip,
        },
      });

      return res.status(calificacionExistente ? 200 : 201).json({
        mensaje: 'Calificación guardada',
        calificacion,
      });
    } catch (error) {
      console.error('💥 Error en registrarCalificacion:', error);
      return res.status(500).json({
        mensaje: 'Error al registrar calificación',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      });
    }
  }

  static async registrarAsistencias(req: RequestConUsuario, res: Response) {
    try {
      const docente = await prisma.perfilDocente.findUnique({
        where: { usuarioId: req.usuario!.sub },
      });

      if (!docente) {
        return res.status(404).json({ mensaje: 'Perfil de docente no encontrado' });
      }

      const data = req.body as RegistroAsistenciaPayload;

      const cursoMateria = await prisma.cursoMateria.findFirst({
        where: { id: data.cursoMateriaId, docenteId: docente.id },
        include: { curso: true, materia: true },
      });

      if (!cursoMateria) {
        return res.status(403).json({ mensaje: 'No puedes registrar asistencia en este curso-materia' });
      }

      const fechaBase = data.fecha ? new Date(data.fecha) : new Date();

      await prisma.asistencia.createMany({
        data: data.registros.map((registro) => ({
          estudianteId: registro.estudianteId,
          estado: registro.estado,
          fecha: registro.fecha ? new Date(registro.fecha) : fechaBase,
          cursoMateriaId: data.cursoMateriaId,
        })),
      });

      await prisma.registroAuditoria.create({
        data: {
          accion: 'REGISTRAR_ASISTENCIA',
          detalles: `Asistencias registradas para ${cursoMateria.materia.nombre} - ${cursoMateria.curso.nombre}`,
          usuarioId: req.usuario!.sub,
          ipAddress: req.ip,
        },
      });

      return res.status(201).json({
        mensaje: 'Asistencias registradas',
      });
    } catch (error) {
      console.error('💥 Error en registrarAsistencias:', error);
      return res.status(500).json({
        mensaje: 'Error al registrar asistencias',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      });
    }
  }

  static async obtenerAsistencias(req: RequestConUsuario, res: Response) {
    try {
      const docente = await prisma.perfilDocente.findUnique({
        where: { usuarioId: req.usuario!.sub },
      });

      if (!docente) {
        return res.status(404).json({ mensaje: 'Perfil de docente no encontrado' });
      }

      const { cursoMateriaId, fecha } = req.query;

      const where: any = {
        cursoMateria: { docenteId: docente.id },
      };

      if (cursoMateriaId) {
        where.cursoMateriaId = cursoMateriaId as string;
      }

      if (fecha) {
        const fechaObj = new Date(fecha as string);
        const fin = new Date(fechaObj);
        fin.setDate(fin.getDate() + 1);
        where.fecha = { gte: fechaObj, lt: fin };
      }

      const asistencias = await prisma.asistencia.findMany({
        where,
        include: {
          estudiante: { include: { usuario: true, curso: true } },
          cursoMateria: { include: { curso: true, materia: true } },
        },
        orderBy: { fecha: 'desc' },
        take: 200,
      });

      return res.json({
        mensaje: 'Asistencias obtenidas',
        asistencias,
      });
    } catch (error) {
      console.error('💥 Error en obtenerAsistencias:', error);
      return res.status(500).json({
        mensaje: 'Error al obtener asistencias',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      });
    }
  }
}