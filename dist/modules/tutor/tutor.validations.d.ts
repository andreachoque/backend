import { z } from 'zod';
export declare const rutaHijoParamsSchema: z.ZodObject<{
    estudianteId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    estudianteId: string;
}, {
    estudianteId: string;
}>;
export declare const consultaCalificacionesSchema: z.ZodObject<{
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
export declare const consultaAsistenciasSchema: z.ZodObject<{
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
