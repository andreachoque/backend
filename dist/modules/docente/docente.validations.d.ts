import { z } from 'zod';
export declare const crearPlanEvaluacionSchema: z.ZodObject<{
    titulo: z.ZodString;
    descripcion: z.ZodOptional<z.ZodString>;
    porcentaje: z.ZodNumber;
    fecha: z.ZodOptional<z.ZodString>;
    cursoMateriaId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    cursoMateriaId: string;
    titulo: string;
    porcentaje: number;
    fecha?: string | undefined;
    descripcion?: string | undefined;
}, {
    cursoMateriaId: string;
    titulo: string;
    porcentaje: number;
    fecha?: string | undefined;
    descripcion?: string | undefined;
}>;
export declare const registrarCalificacionSchema: z.ZodObject<{
    planEvaluacionId: z.ZodString;
    estudianteId: z.ZodString;
    puntaje: z.ZodNumber;
    retroalimentacion: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    puntaje: number;
    estudianteId: string;
    planEvaluacionId: string;
    retroalimentacion?: string | undefined;
}, {
    puntaje: number;
    estudianteId: string;
    planEvaluacionId: string;
    retroalimentacion?: string | undefined;
}>;
export declare const registrarAsistenciasSchema: z.ZodObject<{
    cursoMateriaId: z.ZodString;
    fecha: z.ZodOptional<z.ZodString>;
    registros: z.ZodArray<z.ZodObject<{
        estudianteId: z.ZodString;
        estado: z.ZodNativeEnum<{
            PRESENTE: "PRESENTE";
            AUSENTE: "AUSENTE";
            ATRASO: "ATRASO";
            LICENCIA: "LICENCIA";
        }>;
        fecha: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        estado: "PRESENTE" | "AUSENTE" | "ATRASO" | "LICENCIA";
        estudianteId: string;
        fecha?: string | undefined;
    }, {
        estado: "PRESENTE" | "AUSENTE" | "ATRASO" | "LICENCIA";
        estudianteId: string;
        fecha?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    cursoMateriaId: string;
    registros: {
        estado: "PRESENTE" | "AUSENTE" | "ATRASO" | "LICENCIA";
        estudianteId: string;
        fecha?: string | undefined;
    }[];
    fecha?: string | undefined;
}, {
    cursoMateriaId: string;
    registros: {
        estado: "PRESENTE" | "AUSENTE" | "ATRASO" | "LICENCIA";
        estudianteId: string;
        fecha?: string | undefined;
    }[];
    fecha?: string | undefined;
}>;
export declare const consultaPlanSchema: z.ZodObject<{
    cursoMateriaId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    cursoMateriaId?: string | undefined;
}, {
    cursoMateriaId?: string | undefined;
}>;
export declare const consultaAsistenciaSchema: z.ZodObject<{
    cursoMateriaId: z.ZodOptional<z.ZodString>;
    fecha: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fecha?: string | undefined;
    cursoMateriaId?: string | undefined;
}, {
    fecha?: string | undefined;
    cursoMateriaId?: string | undefined;
}>;
