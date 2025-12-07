import { z } from 'zod';
export declare const crearCursoSchema: z.ZodObject<{
    nombre: z.ZodString;
    nivelId: z.ZodString;
    anoAcademicoId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    nombre: string;
    nivelId: string;
    anoAcademicoId: string;
}, {
    nombre: string;
    nivelId: string;
    anoAcademicoId: string;
}>;
export declare const crearMateriaSchema: z.ZodObject<{
    nombre: z.ZodString;
}, "strip", z.ZodTypeAny, {
    nombre: string;
}, {
    nombre: string;
}>;
export declare const asignarDocenteSchema: z.ZodObject<{
    cursoMateriaId: z.ZodString;
    docenteId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    docenteId: string;
    cursoMateriaId: string;
}, {
    docenteId: string;
    cursoMateriaId: string;
}>;
export declare const asignarEstudianteCursoSchema: z.ZodObject<{
    estudianteId: z.ZodString;
    cursoId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    cursoId: string;
    estudianteId: string;
}, {
    cursoId: string;
    estudianteId: string;
}>;
export declare const crearEventoSchema: z.ZodObject<{
    titulo: z.ZodString;
    fecha: z.ZodString;
    descripcion: z.ZodOptional<z.ZodString>;
    cursoId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    fecha: string;
    titulo: string;
    cursoId?: string | null | undefined;
    descripcion?: string | undefined;
}, {
    fecha: string;
    titulo: string;
    cursoId?: string | null | undefined;
    descripcion?: string | undefined;
}>;
export declare const crearAnoAcademicoSchema: z.ZodObject<{
    nombre: z.ZodString;
    fechaInicio: z.ZodString;
    fechaFin: z.ZodString;
}, "strip", z.ZodTypeAny, {
    nombre: string;
    fechaInicio: string;
    fechaFin: string;
}, {
    nombre: string;
    fechaInicio: string;
    fechaFin: string;
}>;
export declare const queryParamsSchema: z.ZodObject<{
    page: z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>;
    limit: z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    search?: string | undefined;
}, {
    search?: string | undefined;
    page?: string | undefined;
    limit?: string | undefined;
}>;
