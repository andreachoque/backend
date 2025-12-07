import { Response } from 'express';
import { prisma } from '../../core/prisma';
import { RequestConUsuario } from '../../core/auth';
import { actualizarUsuarioSchema, auditoriaQuerySchema, consultarUsuariosSchema, crearUsuarioSchema } from './admin.validations';

export class AdminController {
  static async listarUsuarios(req: RequestConUsuario, res: Response) {
    try {
      const parsed = consultarUsuariosSchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ mensaje: 'Parámetros inválidos', errores: parsed.error.flatten() });
      }

      const { page, limit, search, rol, activo } = parsed.data;

      const where: any = {};
      if (search) {
        where.OR = [
          { nombre: { contains: search, mode: 'insensitive' } },
          { apellido: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }
      if (rol) {
        where.rol = rol;
      }
      if (typeof activo === 'boolean') {
        where.activo = activo;
      }

      const [total, usuarios] = await Promise.all([
        prisma.usuario.count({ where }),
        prisma.usuario.findMany({
          where,
          select: {
            id: true,
            email: true,
            nombre: true,
            apellido: true,
            rol: true,
            activo: true,
            telefono: true,
            direccion: true,
            fotoUrl: true,
            fechaCreacion: true,
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { fechaCreacion: 'desc' },
        }),
      ]);

      return res.json({
        mensaje: 'Usuarios obtenidos',
        pagina: page,
        limite: limit,
        total,
        usuarios,
      });
    } catch (error) {
      console.error('💥 Error en listarUsuarios:', error);
      return res.status(500).json({ mensaje: 'Error al obtener usuarios', error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined });
    }
  }

  static async crearUsuario(req: RequestConUsuario, res: Response) {
    try {
      const parsed = crearUsuarioSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ mensaje: 'Datos inválidos', errores: parsed.error.flatten() });
      }

      const datos = parsed.data;

      const creado = await prisma.usuario.create({
        data: datos,
        select: {
          id: true,
          email: true,
          nombre: true,
          apellido: true,
          rol: true,
          activo: true,
          fechaCreacion: true,
        },
      });

      return res.status(201).json({ mensaje: 'Usuario creado correctamente', usuario: creado });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        return res.status(409).json({ mensaje: 'El email ya está registrado' });
      }
      console.error('💥 Error en crearUsuario:', error);
      return res.status(500).json({ mensaje: 'Error al crear usuario', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
  }

  static async actualizarUsuario(req: RequestConUsuario, res: Response) {
    try {
      const idUsuario = req.params.id;
      const parsedBody = actualizarUsuarioSchema.safeParse(req.body);
      if (!parsedBody.success) {
        return res.status(400).json({ mensaje: 'Datos inválidos', errores: parsedBody.error.flatten() });
      }

      const data = parsedBody.data;

      const actualizado = await prisma.usuario.update({
        where: { id: idUsuario },
        data,
        select: {
          id: true,
          email: true,
          nombre: true,
          apellido: true,
          rol: true,
          activo: true,
          telefono: true,
          direccion: true,
          fotoUrl: true,
          fechaCreacion: true,
        },
      });

      return res.json({ mensaje: 'Usuario actualizado', usuario: actualizado });
    } catch (error: any) {
      if (error?.code === 'P2025') {
        return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      }
      console.error('💥 Error en actualizarUsuario:', error);
      return res.status(500).json({ mensaje: 'Error al actualizar usuario', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
  }

  static async obtenerAuditoria(req: RequestConUsuario, res: Response) {
    try {
      const parsed = auditoriaQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ mensaje: 'Parámetros inválidos', errores: parsed.error.flatten() });
      }

      const { page, limit, usuarioId, accion, desde, hasta } = parsed.data;

      const where: any = {};
      if (usuarioId) where.usuarioId = usuarioId;
      if (accion) where.accion = { contains: accion, mode: 'insensitive' };
      if (desde || hasta) {
        where.fechaHora = {};
        if (desde) where.fechaHora.gte = desde;
        if (hasta) where.fechaHora.lte = hasta;
      }

      const [total, registros] = await Promise.all([
        prisma.registroAuditoria.count({ where }),
        prisma.registroAuditoria.findMany({
          where,
          include: {
            usuario: {
              select: { id: true, email: true, nombre: true, apellido: true, rol: true },
            },
          },
          orderBy: { fechaHora: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);

      return res.json({
        mensaje: 'Registros de auditoría obtenidos',
        pagina: page,
        limite: limit,
        total,
        registros,
      });
    } catch (error) {
      console.error('💥 Error en obtenerAuditoria:', error);
      return res.status(500).json({ mensaje: 'Error al obtener auditoría', error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined });
    }
  }
}