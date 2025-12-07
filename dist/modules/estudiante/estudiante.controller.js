"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstudianteController = void 0;
const prisma_1 = require("../../core/prisma");
const estudiante_validations_1 = require("./estudiante.validations");
class EstudianteController {
    static async obtenerPerfilEstudiante(usuarioId) {
        return prisma_1.prisma.perfilEstudiante.findUnique({
            where: { usuarioId },
            include: {
                usuario: {
                    select: {
                        id: true,
                        email: true,
                        nombre: true,
                        apellido: true,
                        fotoUrl: true
                    }
                },
                tutores: {
                    include: {
                        usuario: {
                            select: {
                                id: true,
                                nombre: true,
                                apellido: true,
                                email: true,
                                telefono: true
                            }
                        }
                    }
                },
                curso: {
                    include: {
                        nivel: true,
                        anoAcademico: true,
                        materias: {
                            include: {
                                materia: true,
                                docente: {
                                    include: {
                                        usuario: {
                                            select: {
                                                nombre: true,
                                                apellido: true,
                                                email: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
    }
    static async obtenerPerfil(req, res) {
        try {
            const perfil = await EstudianteController.obtenerPerfilEstudiante(req.usuario.sub);
            if (!perfil) {
                return res.status(404).json({ mensaje: 'Perfil de estudiante no encontrado' });
            }
            return res.json({
                mensaje: 'Perfil de estudiante obtenido',
                perfil: {
                    id: perfil.id,
                    usuario: perfil.usuario,
                    fechaNacimiento: perfil.fechaNacimiento,
                    curso: perfil.curso,
                    tutores: perfil.tutores.map(tutor => ({
                        id: tutor.id,
                        usuario: tutor.usuario,
                        telegramChatId: tutor.telegramChatId
                    }))
                }
            });
        }
        catch (error) {
            console.error('💥 Error en obtenerPerfil:', error);
            return res.status(500).json({ mensaje: 'Error al obtener perfil', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
        }
    }
    static async obtenerCalificaciones(req, res) {
        try {
            const queryParse = estudiante_validations_1.filtrosCalificacionesSchema.safeParse(req.query);
            if (!queryParse.success) {
                return res.status(400).json({ mensaje: 'Filtros inválidos', errores: queryParse.error.flatten() });
            }
            const perfil = await prisma_1.prisma.perfilEstudiante.findUnique({ where: { usuarioId: req.usuario.sub } });
            if (!perfil) {
                return res.status(404).json({ mensaje: 'Perfil de estudiante no encontrado' });
            }
            const { cursoMateriaId, planEvaluacionId, limit } = queryParse.data;
            const calificaciones = await prisma_1.prisma.calificacion.findMany({
                where: {
                    estudianteId: perfil.id,
                    planEvaluacionId,
                    planEvaluacion: cursoMateriaId ? { cursoMateriaId } : undefined
                },
                include: {
                    planEvaluacion: {
                        include: {
                            cursoMateria: {
                                include: {
                                    materia: true,
                                    curso: true,
                                    docente: {
                                        include: {
                                            usuario: {
                                                select: {
                                                    nombre: true,
                                                    apellido: true,
                                                    email: true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                orderBy: { planEvaluacion: { fecha: 'desc' } },
                take: limit
            });
            return res.json({
                mensaje: 'Calificaciones obtenidas',
                total: calificaciones.length,
                calificaciones
            });
        }
        catch (error) {
            console.error('💥 Error en obtenerCalificaciones:', error);
            return res.status(500).json({ mensaje: 'Error al obtener calificaciones', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
        }
    }
    static async obtenerAsistencias(req, res) {
        try {
            const queryParse = estudiante_validations_1.filtrosAsistenciasSchema.safeParse(req.query);
            if (!queryParse.success) {
                return res.status(400).json({ mensaje: 'Filtros inválidos', errores: queryParse.error.flatten() });
            }
            const perfil = await prisma_1.prisma.perfilEstudiante.findUnique({ where: { usuarioId: req.usuario.sub } });
            if (!perfil) {
                return res.status(404).json({ mensaje: 'Perfil de estudiante no encontrado' });
            }
            const { estado, desde, hasta, limit } = queryParse.data;
            const asistencias = await prisma_1.prisma.asistencia.findMany({
                where: {
                    estudianteId: perfil.id,
                    estado,
                    fecha: {
                        gte: desde,
                        lte: hasta
                    }
                },
                include: {
                    cursoMateria: {
                        include: {
                            materia: true,
                            curso: true
                        }
                    }
                },
                orderBy: { fecha: 'desc' },
                take: limit
            });
            return res.json({
                mensaje: 'Asistencias obtenidas',
                total: asistencias.length,
                asistencias
            });
        }
        catch (error) {
            console.error('💥 Error en obtenerAsistencias:', error);
            return res.status(500).json({ mensaje: 'Error al obtener asistencias', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
        }
    }
    static async obtenerAgenda(req, res) {
        try {
            const queryParse = estudiante_validations_1.filtrosAgendaSchema.safeParse(req.query);
            if (!queryParse.success) {
                return res.status(400).json({ mensaje: 'Filtros inválidos', errores: queryParse.error.flatten() });
            }
            const perfil = await EstudianteController.obtenerPerfilEstudiante(req.usuario.sub);
            if (!perfil) {
                return res.status(404).json({ mensaje: 'Perfil de estudiante no encontrado' });
            }
            if (!perfil.cursoId) {
                return res.status(400).json({ mensaje: 'El estudiante aún no tiene un curso asignado' });
            }
            const { desde, hasta, limitEventos, limitEvaluaciones } = queryParse.data;
            const fechaMin = desde ?? new Date();
            const curso = perfil.curso;
            const eventos = await prisma_1.prisma.evento.findMany({
                where: {
                    fecha: {
                        gte: fechaMin,
                        lte: hasta
                    },
                    OR: [
                        { cursoId: null },
                        { cursoId: perfil.cursoId }
                    ]
                },
                orderBy: { fecha: 'asc' },
                take: limitEventos
            });
            const evaluaciones = await prisma_1.prisma.planEvaluacion.findMany({
                where: {
                    fecha: {
                        gte: fechaMin,
                        lte: hasta
                    },
                    cursoMateria: { cursoId: perfil.cursoId }
                },
                include: {
                    cursoMateria: {
                        include: {
                            materia: true
                        }
                    }
                },
                orderBy: { fecha: 'asc' },
                take: limitEvaluaciones
            });
            return res.json({
                mensaje: 'Agenda obtenida',
                curso: {
                    id: curso.id,
                    nombre: curso.nombre,
                    nivel: curso.nivel,
                    anoAcademico: curso.anoAcademico
                },
                eventos,
                evaluaciones
            });
        }
        catch (error) {
            console.error('💥 Error en obtenerAgenda:', error);
            return res.status(500).json({ mensaje: 'Error al obtener agenda', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
        }
    }
    static async obtenerMensajesCurso(req, res) {
        try {
            const queryParse = estudiante_validations_1.filtrosMensajesSchema.safeParse(req.query);
            if (!queryParse.success) {
                return res.status(400).json({ mensaje: 'Filtros inválidos', errores: queryParse.error.flatten() });
            }
            const perfil = await prisma_1.prisma.perfilEstudiante.findUnique({ where: { usuarioId: req.usuario.sub }, include: { curso: true } });
            if (!perfil) {
                return res.status(404).json({ mensaje: 'Perfil de estudiante no encontrado' });
            }
            if (!perfil.cursoId) {
                return res.status(400).json({ mensaje: 'El estudiante aún no tiene un curso asignado' });
            }
            const { tipo, limit } = queryParse.data;
            const mensajes = await prisma_1.prisma.mensajeCurso.findMany({
                where: {
                    cursoId: perfil.cursoId,
                    tipo
                },
                include: {
                    docente: {
                        include: {
                            usuario: {
                                select: {
                                    nombre: true,
                                    apellido: true,
                                    email: true
                                }
                            }
                        }
                    }
                },
                orderBy: { fechaEnvio: 'desc' },
                take: limit
            });
            return res.json({
                mensaje: 'Mensajes del curso obtenidos',
                total: mensajes.length,
                curso: perfil.curso,
                mensajes
            });
        }
        catch (error) {
            console.error('💥 Error en obtenerMensajesCurso:', error);
            return res.status(500).json({ mensaje: 'Error al obtener mensajes', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
        }
    }
}
exports.EstudianteController = EstudianteController;
//# sourceMappingURL=estudiante.controller.js.map