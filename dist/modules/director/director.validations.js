"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryParamsSchema = exports.crearAnoAcademicoSchema = exports.crearEventoSchema = exports.asignarEstudianteCursoSchema = exports.asignarDocenteSchema = exports.crearMateriaSchema = exports.crearCursoSchema = void 0;
const zod_1 = require("zod");
exports.crearCursoSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(1, 'El nombre del curso es requerido'),
    nivelId: zod_1.z.string().uuid('ID de nivel inválido'),
    anoAcademicoId: zod_1.z.string().uuid('ID de año académico inválido'),
});
exports.crearMateriaSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(1, 'El nombre de la materia es requerido'),
});
exports.asignarDocenteSchema = zod_1.z.object({
    cursoMateriaId: zod_1.z.string().uuid('ID de curso-materia inválido'),
    docenteId: zod_1.z.string().uuid('ID de docente inválido'),
});
exports.asignarEstudianteCursoSchema = zod_1.z.object({
    estudianteId: zod_1.z.string().uuid('ID de estudiante inválido'),
    cursoId: zod_1.z.string().uuid('ID de curso inválido'),
});
exports.crearEventoSchema = zod_1.z.object({
    titulo: zod_1.z.string().min(1, 'El título del evento es requerido'),
    fecha: zod_1.z.string().datetime('Fecha inválida'),
    descripcion: zod_1.z.string().optional(),
    cursoId: zod_1.z.string().uuid('ID de curso inválido').optional().nullable(),
});
exports.crearAnoAcademicoSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(1, 'El nombre del año académico es requerido'),
    fechaInicio: zod_1.z.string().datetime('Fecha de inicio inválida'),
    fechaFin: zod_1.z.string().datetime('Fecha de fin inválida'),
});
exports.queryParamsSchema = zod_1.z.object({
    page: zod_1.z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: zod_1.z.string().optional().transform(val => val ? parseInt(val) : 10),
    search: zod_1.z.string().optional(),
});
//# sourceMappingURL=director.validations.js.map