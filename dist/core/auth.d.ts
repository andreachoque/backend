import { Request, Response, NextFunction } from 'express';
import { RolUsuario } from '@prisma/client';
export interface PayloadJWT {
    sub: string;
    rol: RolUsuario;
}
export interface RequestConUsuario extends Request {
    usuario?: PayloadJWT;
}
export declare function generarToken(payload: PayloadJWT): string;
export declare function middlewareAutenticacion(req: RequestConUsuario, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
export declare function requerirRol(...rolesPermitidos: RolUsuario[]): (req: RequestConUsuario, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
