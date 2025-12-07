// src/core/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { RolUsuario } from '@prisma/client';

const CLAVE_JWT = process.env.JWT_SECRET || 'clave_secreta_por_defecto';

export interface PayloadJWT {
  sub: string;
  rol: RolUsuario;
}

export interface RequestConUsuario extends Request {
  usuario?: PayloadJWT;
}

export function generarToken(payload: PayloadJWT): string {
  return jwt.sign(payload, CLAVE_JWT, { expiresIn: '8h' });
}

export function middlewareAutenticacion(
  req: RequestConUsuario,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;
  
  if (!header) {
    return res.status(401).json({ mensaje: 'Token no proporcionado' });
  }

  const [tipo, token] = header.split(' ');
  
  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ mensaje: 'Formato de token inválido' });
  }

  try {
    const decodificado = jwt.verify(token, CLAVE_JWT) as PayloadJWT;
    req.usuario = decodificado;
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
}

export function requerirRol(...rolesPermitidos: RolUsuario[]) {
  return (req: RequestConUsuario, res: Response, next: NextFunction) => {
    if (!req.usuario) {
      return res.status(401).json({ mensaje: 'No autenticado' });
    }
    
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ 
        mensaje: 'No autorizado: rol insuficiente',
        rolActual: req.usuario.rol,
        rolesRequeridos: rolesPermitidos
      });
    }
    
    next();
  };
}