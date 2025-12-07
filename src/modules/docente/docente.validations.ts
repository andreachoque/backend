import { z } from 'zod';
import { EstadoAsistencia } from '@prisma/client';

export const crearPlanEvaluacionSchema = z.object({
  titulo: z.string().min(1, 'El título es requerido'),
  descripcion: z.string().optional(),
  porcentaje: z.number().min(0, 'El porcentaje no puede ser negativo').max(100, 'El porcentaje no puede superar 100'),
  fecha: z.string().datetime().optional(),
  cursoMateriaId: z.string().uuid('ID de curso-materia inválido'),
});

export const registrarCalificacionSchema = z.object({
  planEvaluacionId: z.string().uuid('ID de plan inválido'),
  estudianteId: z.string().uuid('ID de estudiante inválido'),
  puntaje: z.number().min(0, 'La nota no puede ser negativa'),
  retroalimentacion: z.string().optional(),
});

export const registrarAsistenciasSchema = z.object({
  cursoMateriaId: z.string().uuid('ID de curso-materia inválido'),
  fecha: z.string().datetime().optional(),
  registros: z.array(z.object({
    estudianteId: z.string().uuid('ID de estudiante inválido'),
    estado: z.nativeEnum(EstadoAsistencia, { required_error: 'Estado de asistencia requerido' }),
    fecha: z.string().datetime().optional(),
  })).min(1, 'Debe registrar al menos un estudiante'),
});

export const consultaPlanSchema = z.object({
  cursoMateriaId: z.string().uuid('ID de curso-materia inválido').optional(),
});

export const consultaAsistenciaSchema = z.object({
  cursoMateriaId: z.string().uuid('ID de curso-materia inválido').optional(),
  fecha: z.string().datetime().optional(),
});