import { z } from 'zod';
export declare const filtrosCalificacionesSchema: z.ZodObject<{
    cursoMateriaId: z.ZodOptional<z.ZodString>;
    planEvaluacionId: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    planEvaluacionId?: string | undefined;
    cursoMateriaId?: string | undefined;
}, {
    limit?: number | undefined;
    planEvaluacionId?: string | undefined;
    cursoMateriaId?: string | undefined;
}>;
export declare const filtrosAsistenciasSchema: z.ZodObject<{
    estado: z.ZodOptional<z.ZodEnum<["PRESENTE", "AUSENTE", "ATRASO", "LICENCIA"]>>;
    desde: z.ZodOptional<z.ZodDate>;
    hasta: z.ZodOptional<z.ZodDate>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    estado?: "PRESENTE" | "AUSENTE" | "ATRASO" | "LICENCIA" | undefined;
    desde?: Date | undefined;
    hasta?: Date | undefined;
}, {
    estado?: "PRESENTE" | "AUSENTE" | "ATRASO" | "LICENCIA" | undefined;
    limit?: number | undefined;
    desde?: Date | undefined;
    hasta?: Date | undefined;
}>;
export declare const filtrosAgendaSchema: z.ZodObject<{
    desde: z.ZodOptional<z.ZodDate>;
    hasta: z.ZodOptional<z.ZodDate>;
    limitEventos: z.ZodDefault<z.ZodNumber>;
    limitEvaluaciones: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limitEventos: number;
    limitEvaluaciones: number;
    desde?: Date | undefined;
    hasta?: Date | undefined;
}, {
    desde?: Date | undefined;
    hasta?: Date | undefined;
    limitEventos?: number | undefined;
    limitEvaluaciones?: number | undefined;
}>;
export declare const filtrosMensajesSchema: z.ZodObject<{
    tipo: z.ZodOptional<z.ZodEnum<["ANUNCIO", "TAREA", "AVISO"]>>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    tipo?: "ANUNCIO" | "TAREA" | "AVISO" | undefined;
}, {
    tipo?: "ANUNCIO" | "TAREA" | "AVISO" | undefined;
    limit?: number | undefined;
}>;
