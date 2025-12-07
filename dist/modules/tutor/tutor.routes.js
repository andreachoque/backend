"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rutasTutor = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../../core/auth");
const tutor_controller_1 = require("./tutor.controller");
const tutor_validations_1 = require("./tutor.validations");
const router = (0, express_1.Router)();
router.use(auth_1.middlewareAutenticacion);
router.use((0, auth_1.requerirRol)(client_1.RolUsuario.TUTOR));
router.get('/hijos', tutor_controller_1.TutorController.obtenerHijos);
router.get('/hijos/:estudianteId/calificaciones', (req, res, next) => {
    const paramsParse = tutor_validations_1.rutaHijoParamsSchema.safeParse(req.params);
    const queryParse = tutor_validations_1.consultaCalificacionesSchema.safeParse(req.query);
    if (!paramsParse.success || !queryParse.success) {
        const errores = {
            ...(paramsParse.success ? {} : paramsParse.error.flatten()),
            ...(queryParse.success ? {} : queryParse.error.flatten())
        };
        return res.status(400).json({ mensaje: 'Datos inválidos', errores });
    }
    req.params = paramsParse.data;
    req.query = queryParse.data;
    next();
}, tutor_controller_1.TutorController.obtenerCalificaciones);
router.get('/hijos/:estudianteId/asistencias', (req, res, next) => {
    const paramsParse = tutor_validations_1.rutaHijoParamsSchema.safeParse(req.params);
    const queryParse = tutor_validations_1.consultaAsistenciasSchema.safeParse(req.query);
    if (!paramsParse.success || !queryParse.success) {
        const errores = {
            ...(paramsParse.success ? {} : paramsParse.error.flatten()),
            ...(queryParse.success ? {} : queryParse.error.flatten())
        };
        return res.status(400).json({ mensaje: 'Datos inválidos', errores });
    }
    req.params = paramsParse.data;
    req.query = queryParse.data;
    next();
}, tutor_controller_1.TutorController.obtenerAsistencias);
router.get('/comunicaciones', tutor_controller_1.TutorController.obtenerComunicaciones);
exports.rutasTutor = router;
//# sourceMappingURL=tutor.routes.js.map