import { z } from 'zod';

export const rutaHijoParamsSchema = z.object({
  estudianteId: z.string().uuid('El identificador del estudiante debe ser un UUID válido')
});

export const consultaCalificacionesSchema = z.object({
  cursoMateriaId: z.string().uuid().optional(),
  planEvaluacionId: z.string().uuid().optional(),
  limit: z.coerce.number().int().positive().max(100).default(50)
});

export const consultaAsistenciasSchema = z.object({
  estado: z.enum(['PRESENTE', 'AUSENTE', 'ATRASO', 'LICENCIA']).optional(),
  desde: z.coerce.date().optional(),
  hasta: z.coerce.date().optional(),
  limit: z.coerce.number().int().positive().max(200).default(100)
});