import { Response } from 'express';
import { RequestConUsuario } from '../../core/auth';
export declare class DirectorController {
    static obtenerDashboard(req: RequestConUsuario, res: Response): Promise<void>;
    static obtenerCursos(req: RequestConUsuario, res: Response): Promise<void>;
    static crearCurso(req: RequestConUsuario, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static obtenerMaterias(req: RequestConUsuario, res: Response): Promise<void>;
    static crearMateria(req: RequestConUsuario, res: Response): Promise<void>;
    static asignarDocenteMateria(req: RequestConUsuario, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static asignarEstudianteCurso(req: RequestConUsuario, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static obtenerCalificaciones(req: RequestConUsuario, res: Response): Promise<void>;
    static obtenerAsistencias(req: RequestConUsuario, res: Response): Promise<void>;
}
