import { z } from 'zod';

export const filtrosCalificacionesSchema = z.object({
  cursoMateriaId: z.string().uuid().optional(),
  planEvaluacionId: z.string().uuid().optional(),
  limit: z.coerce.number().int().positive().max(100).default(50)
});

export const filtrosAsistenciasSchema = z.object({
  estado: z.enum(['PRESENTE', 'AUSENTE', 'ATRASO', 'LICENCIA']).optional(),
  desde: z.coerce.date().optional(),
  hasta: z.coerce.date().optional(),
  limit: z.coerce.number().int().positive().max(200).default(100)
});

export const filtrosAgendaSchema = z.object({
  desde: z.coerce.date().optional(),
  hasta: z.coerce.date().optional(),
  limitEventos: z.coerce.number().int().positive().max(200).default(50),
  limitEvaluaciones: z.coerce.number().int().positive().max(200).default(50)
});

export const filtrosMensajesSchema = z.object({
  tipo: z.enum(['ANUNCIO', 'TAREA', 'AVISO']).optional(),
  limit: z.coerce.number().int().positive().max(200).default(50)
});