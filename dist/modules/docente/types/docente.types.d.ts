import { EstadoAsistencia } from '@prisma/client';
export interface PlanEvaluacionPayload {
    titulo: string;
    descripcion?: string;
    porcentaje: number;
    fecha?: Date;
    cursoMateriaId: string;
}
export interface CalificacionPayload {
    planEvaluacionId: string;
    estudianteId: string;
    puntaje: number;
    retroalimentacion?: string;
}
export interface RegistroAsistenciaPayload {
    cursoMateriaId: string;
    fecha?: Date;
    registros: Array<{
        estudianteId: string;
        estado: EstadoAsistencia;
        fecha?: Date;
    }>;
}
