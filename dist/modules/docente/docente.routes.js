"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rutasDocente = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../../core/auth");
const docente_controller_1 = require("./docente.controller");
const docente_validations_1 = require("./docente.validations");
const router = (0, express_1.Router)();
router.use(auth_1.middlewareAutenticacion);
router.use((0, auth_1.requerirRol)(client_1.RolUsuario.DOCENTE));
router.get('/carga-academica', docente_controller_1.DocenteController.obtenerCargaAcademica);
router.get('/carga-academica/:cursoMateriaId/estudiantes', docente_controller_1.DocenteController.obtenerEstudiantesDelCurso);
router.get('/planes', (req, res, next) => {
    const parsed = docente_validations_1.consultaPlanSchema.safeParse(req.query);
    if (!parsed.success) {
        return res.status(400).json({ mensaje: 'Parámetros inválidos', errores: parsed.error.flatten() });
    }
    req.query = parsed.data;
    next();
}, docente_controller_1.DocenteController.obtenerPlanes);
router.post('/planes', (req, res, next) => {
    const parsed = docente_validations_1.crearPlanEvaluacionSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ mensaje: 'Datos inválidos', errores: parsed.error.flatten() });
    }
    req.body = parsed.data;
    next();
}, docente_controller_1.DocenteController.crearPlanEvaluacion);
router.post('/calificaciones', (req, res, next) => {
    const parsed = docente_validations_1.registrarCalificacionSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ mensaje: 'Datos inválidos', errores: parsed.error.flatten() });
    }
    req.body = parsed.data;
    next();
}, docente_controller_1.DocenteController.registrarCalificacion);
router.post('/asistencias', (req, res, next) => {
    const parsed = docente_validations_1.registrarAsistenciasSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ mensaje: 'Datos inválidos', errores: parsed.error.flatten() });
    }
    req.body = parsed.data;
    next();
}, docente_controller_1.DocenteController.registrarAsistencias);
router.get('/asistencias', (req, res, next) => {
    const parsed = docente_validations_1.consultaAsistenciaSchema.safeParse(req.query);
    if (!parsed.success) {
        return res.status(400).json({ mensaje: 'Parámetros inválidos', errores: parsed.error.flatten() });
    }
    req.query = parsed.data;
    next();
}, docente_controller_1.DocenteController.obtenerAsistencias);
exports.rutasDocente = router;
//# sourceMappingURL=docente.routes.js.map