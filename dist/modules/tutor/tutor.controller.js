"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TutorController = void 0;
const prisma_1 = require("../../core/prisma");
const tutor_validations_1 = require("./tutor.validations");
class TutorController {
    static async obtenerPerfilTutor(usuarioId) {
        return prisma_1.prisma.perfilTutor.findUnique({
            where: { usuarioId },
            include: { estudiantes: true }
        });
    }
    static async obtenerHijos(req, res) {
        try {
            const perfilTutor = await prisma_1.prisma.perfilTutor.findUnique({
                where: { usuarioId: req.usuario.sub },
                include: {
                    estudiantes: {
                        include: {
                            usuario: {
                                select: {
                                    id: true,
                                    nombre: true,
                                    apellido: true,
                                    email: true,
                                    fotoUrl: true
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
                    }
                }
            });
            if (!perfilTutor) {
                return res.status(404).json({ mensaje: 'Perfil de tutor no encontrado' });
            }
            return res.json({
                mensaje: 'Estudiantes vinculados obtenidos',
                total: perfilTutor.estudiantes.length,
                estudiantes: perfilTutor.estudiantes.map(est => ({
                    id: est.id,
                    usuario: est.usuario,
                    fechaNacimiento: est.fechaNacimiento,
                    curso: est.curso ? {
                        id: est.curso.id,
                        nombre: est.curso.nombre,
                        nivel: est.curso.nivel,
                        anoAcademico: est.curso.anoAcademico,
                        materias: est.curso.materias.map(m => ({
                            id: m.id,
                            materia: m.materia,
                            docente: m.docente ? {
                                id: m.docente.id,
                                usuario: m.docente.usuario
                            } : null
                        }))
                    } : null
                }))
            });
        }
        catch (error) {
            console.error('💥 Error en obtenerHijos:', error);
            return res.status(500).json({ mensaje: 'Error al obtener estudiantes', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
        }
    }
    static async obtenerCalificaciones(req, res) {
        try {
            const paramsParse = tutor_validations_1.rutaHijoParamsSchema.safeParse(req.params);
            if (!paramsParse.success) {
                return res.status(400).json({ mensaje: 'Parámetros inválidos', errores: paramsParse.error.flatten() });
            }
            const queryParse = tutor_validations_1.consultaCalificacionesSchema.safeParse(req.query);
            if (!queryParse.success) {
                return res.status(400).json({ mensaje: 'Filtros inválidos', errores: queryParse.error.flatten() });
            }
            const { estudianteId } = paramsParse.data;
            const { cursoMateriaId, planEvaluacionId, limit } = queryParse.data;
            const tutor = await prisma_1.prisma.perfilTutor.findFirst({
                where: {
                    usuarioId: req.usuario.sub,
                    estudiantes: { some: { id: estudianteId } }
                }
            });
            if (!tutor) {
                return res.status(403).json({ mensaje: 'No tienes acceso a este estudiante' });
            }
            const calificaciones = await prisma_1.prisma.calificacion.findMany({
                where: {
                    estudianteId,
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
            const paramsParse = tutor_validations_1.rutaHijoParamsSchema.safeParse(req.params);
            if (!paramsParse.success) {
                return res.status(400).json({ mensaje: 'Parámetros inválidos', errores: paramsParse.error.flatten() });
            }
            const queryParse = tutor_validations_1.consultaAsistenciasSchema.safeParse(req.query);
            if (!queryParse.success) {
                return res.status(400).json({ mensaje: 'Filtros inválidos', errores: queryParse.error.flatten() });
            }
            const { estudianteId } = paramsParse.data;
            const { estado, desde, hasta, limit } = queryParse.data;
            const tutor = await prisma_1.prisma.perfilTutor.findFirst({
                where: { usuarioId: req.usuario.sub, estudiantes: { some: { id: estudianteId } } }
            });
            if (!tutor) {
                return res.status(403).json({ mensaje: 'No tienes acceso a este estudiante' });
            }
            const asistencias = await prisma_1.prisma.asistencia.findMany({
                where: {
                    estudianteId,
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
            return res.json({ mensaje: 'Asistencias obtenidas', total: asistencias.length, asistencias });
        }
        catch (error) {
            console.error('💥 Error en obtenerAsistencias:', error);
            return res.status(500).json({ mensaje: 'Error al obtener asistencias', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
        }
    }
    static async obtenerComunicaciones(req, res) {
        try {
            const perfilTutor = await this.obtenerPerfilTutor(req.usuario.sub);
            if (!perfilTutor) {
                return res.status(404).json({ mensaje: 'Perfil de tutor no encontrado' });
            }
            const cursosIds = perfilTutor.estudiantes
                .map(est => est.cursoId)
                .filter((id) => Boolean(id));
            const [comunicaciones, mensajesCurso] = await Promise.all([
                prisma_1.prisma.comunicacion.findMany({
                    where: {
                        OR: [
                            { receptorId: req.usuario.sub },
                            cursosIds.length ? { cursoDestinoId: { in: cursosIds } } : undefined
                        ].filter(Boolean),
                    },
                    orderBy: { fechaEnvio: 'desc' },
                    take: 50
                }),
                cursosIds.length ? prisma_1.prisma.mensajeCurso.findMany({
                    where: { cursoId: { in: cursosIds } },
                    include: {
                        docente: {
                            include: {
                                usuario: {
                                    select: { nombre: true, apellido: true, email: true }
                                }
                            }
                        },
                        curso: true
                    },
                    orderBy: { fechaEnvio: 'desc' },
                    take: 50
                }) : []
            ]);
            return res.json({
                mensaje: 'Comunicaciones obtenidas',
                comunicaciones,
                mensajesCurso
            });
        }
        catch (error) {
            console.error('💥 Error en obtenerComunicaciones:', error);
            return res.status(500).json({ mensaje: 'Error al obtener comunicaciones', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
        }
    }
}
exports.TutorController = TutorController;
//# sourceMappingURL=tutor.controller.js.map