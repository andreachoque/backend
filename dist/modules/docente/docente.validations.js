"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consultaAsistenciaSchema = exports.consultaPlanSchema = exports.registrarAsistenciasSchema = exports.registrarCalificacionSchema = exports.crearPlanEvaluacionSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.crearPlanEvaluacionSchema = zod_1.z.object({
    titulo: zod_1.z.string().min(1, 'El título es requerido'),
    descripcion: zod_1.z.string().optional(),
    porcentaje: zod_1.z.number().min(0, 'El porcentaje no puede ser negativo').max(100, 'El porcentaje no puede superar 100'),
    fecha: zod_1.z.string().datetime().optional(),
    cursoMateriaId: zod_1.z.string().uuid('ID de curso-materia inválido'),
});
exports.registrarCalificacionSchema = zod_1.z.object({
    planEvaluacionId: zod_1.z.string().uuid('ID de plan inválido'),
    estudianteId: zod_1.z.string().uuid('ID de estudiante inválido'),
    puntaje: zod_1.z.number().min(0, 'La nota no puede ser negativa'),
    retroalimentacion: zod_1.z.string().optional(),
});
exports.registrarAsistenciasSchema = zod_1.z.object({
    cursoMateriaId: zod_1.z.string().uuid('ID de curso-materia inválido'),
    fecha: zod_1.z.string().datetime().optional(),
    registros: zod_1.z.array(zod_1.z.object({
        estudianteId: zod_1.z.string().uuid('ID de estudiante inválido'),
        estado: zod_1.z.nativeEnum(client_1.EstadoAsistencia, { required_error: 'Estado de asistencia requerido' }),
        fecha: zod_1.z.string().datetime().optional(),
    })).min(1, 'Debe registrar al menos un estudiante'),
});
exports.consultaPlanSchema = zod_1.z.object({
    cursoMateriaId: zod_1.z.string().uuid('ID de curso-materia inválido').optional(),
});
exports.consultaAsistenciaSchema = zod_1.z.object({
    cursoMateriaId: zod_1.z.string().uuid('ID de curso-materia inválido').optional(),
    fecha: zod_1.z.string().datetime().optional(),
});
//# sourceMappingURL=docente.validations.js.map