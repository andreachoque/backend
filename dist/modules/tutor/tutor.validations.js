"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consultaAsistenciasSchema = exports.consultaCalificacionesSchema = exports.rutaHijoParamsSchema = void 0;
const zod_1 = require("zod");
exports.rutaHijoParamsSchema = zod_1.z.object({
    estudianteId: zod_1.z.string().uuid('El identificador del estudiante debe ser un UUID válido')
});
exports.consultaCalificacionesSchema = zod_1.z.object({
    cursoMateriaId: zod_1.z.string().uuid().optional(),
    planEvaluacionId: zod_1.z.string().uuid().optional(),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(50)
});
exports.consultaAsistenciasSchema = zod_1.z.object({
    estado: zod_1.z.enum(['PRESENTE', 'AUSENTE', 'ATRASO', 'LICENCIA']).optional(),
    desde: zod_1.z.coerce.date().optional(),
    hasta: zod_1.z.coerce.date().optional(),
    limit: zod_1.z.coerce.number().int().positive().max(200).default(100)
});
//# sourceMappingURL=tutor.validations.js.map