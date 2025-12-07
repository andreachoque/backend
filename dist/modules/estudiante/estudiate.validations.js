"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filtrosMensajesSchema = exports.filtrosAgendaSchema = exports.filtrosAsistenciasSchema = exports.filtrosCalificacionesSchema = void 0;
const zod_1 = require("zod");
exports.filtrosCalificacionesSchema = zod_1.z.object({
    cursoMateriaId: zod_1.z.string().uuid().optional(),
    planEvaluacionId: zod_1.z.string().uuid().optional(),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(50)
});
exports.filtrosAsistenciasSchema = zod_1.z.object({
    estado: zod_1.z.enum(['PRESENTE', 'AUSENTE', 'ATRASO', 'LICENCIA']).optional(),
    desde: zod_1.z.coerce.date().optional(),
    hasta: zod_1.z.coerce.date().optional(),
    limit: zod_1.z.coerce.number().int().positive().max(200).default(100)
});
exports.filtrosAgendaSchema = zod_1.z.object({
    desde: zod_1.z.coerce.date().optional(),
    hasta: zod_1.z.coerce.date().optional(),
    limitEventos: zod_1.z.coerce.number().int().positive().max(200).default(50),
    limitEvaluaciones: zod_1.z.coerce.number().int().positive().max(200).default(50)
});
exports.filtrosMensajesSchema = zod_1.z.object({
    tipo: zod_1.z.enum(['ANUNCIO', 'TAREA', 'AVISO']).optional(),
    limit: zod_1.z.coerce.number().int().positive().max(200).default(50)
});
//# sourceMappingURL=estudiate.validations.js.map