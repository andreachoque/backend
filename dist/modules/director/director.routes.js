"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rutasDirector = void 0;
const express_1 = require("express");
const director_controller_1 = require("./director.controller");
const auth_1 = require("../../core/auth");
const client_1 = require("@prisma/client");
const prisma_1 = require("../../core/prisma");
const director_validations_1 = require("./director.validations");
const router = (0, express_1.Router)();
router.use(auth_1.middlewareAutenticacion);
router.use((0, auth_1.requerirRol)(client_1.RolUsuario.DIRECTOR));
router.get('/dashboard', director_controller_1.DirectorController.obtenerDashboard);
router.get('/cursos', (req, res, next) => {
    try {
        const parsed = director_validations_1.queryParamsSchema.safeParse(req.query);
        if (!parsed.success) {
            return res.status(400).json({
                mensaje: 'Parámetros de consulta inválidos',
                errores: parsed.error.flatten(),
            });
        }
        res.locals.page = parsed.data.page;
        res.locals.limit = parsed.data.limit;
        res.locals.search = parsed.data.search;
        next();
    }
    catch (error) {
        res.status(400).json({
            mensaje: 'Parámetros de consulta inválidos',
            errores: error
        });
    }
}, director_controller_1.DirectorController.obtenerCursos);
router.post('/cursos', (req, res, next) => {
    try {
        director_validations_1.crearCursoSchema.parse(req.body);
        next();
    }
    catch (error) {
        res.status(400).json({
            mensaje: 'Datos de entrada inválidos',
            errores: error
        });
    }
}, director_controller_1.DirectorController.crearCurso);
router.get('/materias', director_controller_1.DirectorController.obtenerMaterias);
router.post('/materias', (req, res, next) => {
    try {
        director_validations_1.crearMateriaSchema.parse(req.body);
        next();
    }
    catch (error) {
        res.status(400).json({
            mensaje: 'Datos de entrada inválidos',
            errores: error
        });
    }
}, director_controller_1.DirectorController.crearMateria);
router.post('/asignar-docente', (req, res, next) => {
    try {
        director_validations_1.asignarDocenteSchema.parse(req.body);
        next();
    }
    catch (error) {
        res.status(400).json({
            mensaje: 'Datos de entrada inválidos',
            errores: error
        });
    }
}, director_controller_1.DirectorController.asignarDocenteMateria);
router.post('/asignar-estudiante-curso', (req, res, next) => {
    try {
        director_validations_1.asignarEstudianteCursoSchema.parse(req.body);
        next();
    }
    catch (error) {
        res.status(400).json({
            mensaje: 'Datos de entrada inválidos',
            errores: error
        });
    }
}, director_controller_1.DirectorController.asignarEstudianteCurso);
router.get('/calificaciones', director_controller_1.DirectorController.obtenerCalificaciones);
router.get('/asistencias', director_controller_1.DirectorController.obtenerAsistencias);
router.get('/anos-academicos', async (req, res) => {
    try {
        const anosAcademicos = await prisma_1.prisma.anoAcademico.findMany({
            orderBy: { fechaInicio: 'desc' },
            include: {
                cursos: {
                    include: {
                        estudiantes: true,
                        materias: true
                    }
                }
            }
        });
        res.json({
            mensaje: 'Años académicos obtenidos exitosamente',
            anosAcademicos
        });
    }
    catch (error) {
        console.error('💥 Error en obtener años académicos:', error);
        res.status(500).json({
            mensaje: 'Error al obtener años académicos',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
router.post('/anos-academicos', (req, res, next) => {
    try {
        director_validations_1.crearAnoAcademicoSchema.parse(req.body);
        next();
    }
    catch (error) {
        res.status(400).json({
            mensaje: 'Datos de entrada inválidos',
            errores: error
        });
    }
}, async (req, res) => {
    try {
        if (!req.usuario) {
            return res.status(401).json({ mensaje: 'Usuario no autenticado' });
        }
        const { nombre, fechaInicio, fechaFin } = req.body;
        await prisma_1.prisma.anoAcademico.updateMany({
            where: { activo: true },
            data: { activo: false }
        });
        const anoAcademico = await prisma_1.prisma.anoAcademico.create({
            data: {
                nombre,
                fechaInicio: new Date(fechaInicio),
                fechaFin: new Date(fechaFin),
                activo: true
            }
        });
        await prisma_1.prisma.registroAuditoria.create({
            data: {
                accion: 'CREAR_ANO_ACADEMICO',
                detalles: `Año académico creado: ${nombre}`,
                usuarioId: req.usuario.sub,
                ipAddress: req.ip
            }
        });
        res.status(201).json({
            mensaje: 'Año académico creado exitosamente',
            anoAcademico
        });
    }
    catch (error) {
        console.error('💥 Error en crear año académico:', error);
        res.status(500).json({
            mensaje: 'Error al crear año académico',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
router.post('/eventos', (req, res, next) => {
    try {
        director_validations_1.crearEventoSchema.parse(req.body);
        next();
    }
    catch (error) {
        res.status(400).json({
            mensaje: 'Datos de entrada inválidos',
            errores: error
        });
    }
}, async (req, res) => {
    try {
        if (!req.usuario) {
            return res.status(401).json({ mensaje: 'Usuario no autenticado' });
        }
        const { titulo, fecha, descripcion, cursoId } = req.body;
        const evento = await prisma_1.prisma.evento.create({
            data: {
                titulo,
                fecha: new Date(fecha),
                descripcion,
                cursoId: cursoId || null
            },
            include: {
                curso: true
            }
        });
        await prisma_1.prisma.registroAuditoria.create({
            data: {
                accion: 'CREAR_EVENTO',
                detalles: `Evento creado: ${titulo}`,
                usuarioId: req.usuario.sub,
                ipAddress: req.ip
            }
        });
        res.status(201).json({
            mensaje: 'Evento creado exitosamente',
            evento
        });
    }
    catch (error) {
        console.error('💥 Error en crear evento:', error);
        res.status(500).json({
            mensaje: 'Error al crear evento',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
exports.rutasDirector = router;
//# sourceMappingURL=director.routes.js.map