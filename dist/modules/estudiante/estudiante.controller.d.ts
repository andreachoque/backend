import { Response } from 'express';
import { RequestConUsuario } from '../../core/auth';
export declare class EstudianteController {
    private static obtenerPerfilEstudiante;
    static obtenerPerfil(req: RequestConUsuario, res: Response): Promise<Response<any, Record<string, any>>>;
    static obtenerCalificaciones(req: RequestConUsuario, res: Response): Promise<Response<any, Record<string, any>>>;
    static obtenerAsistencias(req: RequestConUsuario, res: Response): Promise<Response<any, Record<string, any>>>;
    static obtenerAgenda(req: RequestConUsuario, res: Response): Promise<Response<any, Record<string, any>>>;
    static obtenerMensajesCurso(req: RequestConUsuario, res: Response): Promise<Response<any, Record<string, any>>>;
}
