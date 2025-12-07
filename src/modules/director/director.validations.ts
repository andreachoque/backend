// src/modules/director/director.validations.ts
import { z } from 'zod';

// Esquemas de validación para el módulo director
export const crearCursoSchema = z.object({
  nombre: z.string().min(1, 'El nombre del curso es requerido'),
  nivelId: z.string().uuid('ID de nivel inválido'),
  anoAcademicoId: z.string().uuid('ID de año académico inválido'),
});

export const crearMateriaSchema = z.object({
  nombre: z.string().min(1, 'El nombre de la materia es requerido'),
});

export const asignarDocenteSchema = z.object({
  cursoMateriaId: z.string().uuid('ID de curso-materia inválido'),
  docenteId: z.string().uuid('ID de docente inválido'),
});

export const asignarEstudianteCursoSchema = z.object({
  estudianteId: z.string().uuid('ID de estudiante inválido'),
  cursoId: z.string().uuid('ID de curso inválido'),
});

export const crearEventoSchema = z.object({
  titulo: z.string().min(1, 'El título del evento es requerido'),
  fecha: z.string().datetime('Fecha inválida'),
  descripcion: z.string().optional(),
  cursoId: z.string().uuid('ID de curso inválido').optional().nullable(),
});

export const crearAnoAcademicoSchema = z.object({
  nombre: z.string().min(1, 'El nombre del año académico es requerido'),
  fechaInicio: z.string().datetime('Fecha de inicio inválida'),
  fechaFin: z.string().datetime('Fecha de fin inválida'),
});

// Esquema para query parameters
export const queryParamsSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  search: z.string().optional(),
});