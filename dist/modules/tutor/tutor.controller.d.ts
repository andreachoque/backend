import { Response } from 'express';
import { RequestConUsuario } from '../../core/auth';
export declare class TutorController {
    private static obtenerPerfilTutor;
    static obtenerHijos(req: RequestConUsuario, res: Response): Promise<Response<any, Record<string, any>>>;
    static obtenerCalificaciones(req: RequestConUsuario, res: Response): Promise<Response<any, Record<string, any>>>;
    static obtenerAsistencias(req: RequestConUsuario, res: Response): Promise<Response<any, Record<string, any>>>;
    static obtenerComunicaciones(req: RequestConUsuario, res: Response): Promise<Response<any, Record<string, any>>>;
}
