import { z } from 'zod';
import { RolUsuario } from '@prisma/client';

export const paginacionBaseSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 1))
    .refine((v) => Number.isInteger(v) && v > 0, { message: 'page debe ser un entero mayor a 0' }),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 20))
    .refine((v) => Number.isInteger(v) && v > 0 && v <= 100, { message: 'limit debe estar entre 1 y 100' }),
});

export const consultarUsuariosSchema = paginacionBaseSchema.extend({
  search: z.string().optional(),
  rol: z.nativeEnum(RolUsuario).optional(),
  activo: z
    .string()
    .optional()
    .transform((v) => {
      if (v === undefined) return undefined;
      if (v === 'true') return true;
      if (v === 'false') return false;
      return v;
    })
    .refine((v) => v === undefined || typeof v === 'boolean', { message: 'activo debe ser true o false' }),
});

export const crearUsuarioSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  rol: z.nativeEnum(RolUsuario),
  nombre: z.string().min(1, 'Nombre requerido'),
  apellido: z.string().min(1, 'Apellido requerido'),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  fotoUrl: z.string().url('URL inválida').optional(),
});

export const actualizarUsuarioSchema = crearUsuarioSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: 'Debe enviar al menos un campo para actualizar',
});

export const auditoriaQuerySchema = paginacionBaseSchema.extend({
  usuarioId: z.string().uuid('usuarioId debe ser un UUID').optional(),
  accion: z.string().optional(),
  desde: z
    .string()
    .optional()
    .transform((v) => (v ? new Date(v) : undefined))
    .refine((v) => v === undefined || v instanceof Date && !Number.isNaN(v.getTime()), { message: 'desde debe ser fecha válida' }),
  hasta: z
    .string()
    .optional()
    .transform((v) => (v ? new Date(v) : undefined))
    .refine((v) => v === undefined || v instanceof Date && !Number.isNaN(v.getTime()), { message: 'hasta debe ser fecha válida' }),
});