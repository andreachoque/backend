import { Response } from 'express';
import { RequestConUsuario } from '../../core/auth';
export declare class DocenteController {
    static obtenerCargaAcademica(req: RequestConUsuario, res: Response): Promise<Response<any, Record<string, any>>>;
    static obtenerEstudiantesDelCurso(req: RequestConUsuario, res: Response): Promise<Response<any, Record<string, any>>>;
    static crearPlanEvaluacion(req: RequestConUsuario, res: Response): Promise<Response<any, Record<string, any>>>;
    static obtenerPlanes(req: RequestConUsuario, res: Response): Promise<Response<any, Record<string, any>>>;
    static registrarCalificacion(req: RequestConUsuario, res: Response): Promise<Response<any, Record<string, any>>>;
    static registrarAsistencias(req: RequestConUsuario, res: Response): Promise<Response<any, Record<string, any>>>;
    static obtenerAsistencias(req: RequestConUsuario, res: Response): Promise<Response<any, Record<string, any>>>;
}
