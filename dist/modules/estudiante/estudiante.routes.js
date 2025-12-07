"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rutasEstudiante = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../../core/auth");
const estudiante_controller_1 = require("./estudiante.controller");
const estudiante_validations_1 = require("./estudiante.validations");
const router = (0, express_1.Router)();
router.use(auth_1.middlewareAutenticacion);
router.use((0, auth_1.requerirRol)(client_1.RolUsuario.ESTUDIANTE));
router.get('/perfil', estudiante_controller_1.EstudianteController.obtenerPerfil);
router.get('/calificaciones', (req, res, next) => {
    const parsed = estudiante_validations_1.filtrosCalificacionesSchema.safeParse(req.query);
    if (!parsed.success) {
        return res.status(400).json({ mensaje: 'Filtros inválidos', errores: parsed.error.flatten() });
    }
    req.query = parsed.data;
    next();
}, estudiante_controller_1.EstudianteController.obtenerCalificaciones);
router.get('/asistencias', (req, res, next) => {
    const parsed = estudiante_validations_1.filtrosAsistenciasSchema.safeParse(req.query);
    if (!parsed.success) {
        return res.status(400).json({ mensaje: 'Filtros inválidos', errores: parsed.error.flatten() });
    }
    req.query = parsed.data;
    next();
}, estudiante_controller_1.EstudianteController.obtenerAsistencias);
router.get('/agenda', (req, res, next) => {
    const parsed = estudiante_validations_1.filtrosAgendaSchema.safeParse(req.query);
    if (!parsed.success) {
        return res.status(400).json({ mensaje: 'Filtros inválidos', errores: parsed.error.flatten() });
    }
    req.query = parsed.data;
    next();
}, estudiante_controller_1.EstudianteController.obtenerAgenda);
router.get('/mensajes', (req, res, next) => {
    const parsed = estudiante_validations_1.filtrosMensajesSchema.safeParse(req.query);
    if (!parsed.success) {
        return res.status(400).json({ mensaje: 'Filtros inválidos', errores: parsed.error.flatten() });
    }
    req.query = parsed.data;
    next();
}, estudiante_controller_1.EstudianteController.obtenerMensajesCurso);
exports.rutasEstudiante = router;
//# sourceMappingURL=estudiante.routes.js.map