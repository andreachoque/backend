"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectorController = void 0;
const prisma_1 = require("../../core/prisma");
class DirectorController {
    static async obtenerDashboard(req, res) {
        try {
            console.log('📊 Solicitando dashboard del director:', req.usuario?.sub);
            const [totalEstudiantes, totalDocentes, totalCursos, anosAcademicos] = await Promise.all([
                prisma_1.prisma.perfilEstudiante.count(),
                prisma_1.prisma.perfilDocente.count(),
                prisma_1.prisma.curso.count(),
                prisma_1.prisma.anoAcademico.findMany({
                    where: { activo: true },
                    include: {
                        cursos: {
                            include: {
                                estudiantes: true,
                                materias: true
                            }
                        }
                    }
                })
            ]);
            const totalAsistencias = await prisma_1.prisma.asistencia.count({
                where: {
                    fecha: {
                        gte: new Date(new Date().getFullYear(), 0, 1)
                    }
                }
            });
            const asistenciasPresente = await prisma_1.prisma.asistencia.count({
                where: {
                    estado: 'PRESENTE',
                    fecha: {
                        gte: new Date(new Date().getFullYear(), 0, 1)
                    }
                }
            });
            const asistenciaPromedio = totalAsistencias > 0
                ? (asistenciasPresente / totalAsistencias) * 100
                : 0;
            res.json({
                mensaje: 'Dashboard del director obtenido',
                estadisticas: {
                    totalEstudiantes,
                    totalDocentes,
                    totalCursos,
                    asistenciaPromedio: Math.round(asistenciaPromedio),
                    anosAcademicosActivos: anosAcademicos.length
                },
                anosAcademicos: anosAcademicos.map(ano => ({
                    id: ano.id,
                    nombre: ano.nombre,
                    fechaInicio: ano.fechaInicio,
                    fechaFin: ano.fechaFin,
                    totalCursos: ano.cursos.length,
                    totalEstudiantes: ano.cursos.reduce((sum, curso) => sum + curso.estudiantes.length, 0)
                }))
            });
        }
        catch (error) {
            console.error('💥 Error en obtenerDashboard:', error);
            res.status(500).json({
                mensaje: 'Error al obtener el dashboard',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
    static async obtenerCursos(req, res) {
        try {
            const page = Number(res.locals.page) || 1;
            const limit = Number(res.locals.limit) || 10;
            const search = res.locals.search;
            const skip = (page - 1) * limit;
            const where = search ? {
                OR: [
                    { nombre: { contains: String(search), mode: 'insensitive' } },
                    { nivel: { nombre: { contains: String(search), mode: 'insensitive' } } }
                ]
            } : {};
            const [cursos, total] = await Promise.all([
                prisma_1.prisma.curso.findMany({
                    where,
                    include: {
                        nivel: true,
                        anoAcademico: true,
                        estudiantes: {
                            include: {
                                usuario: {
                                    select: {
                                        nombre: true,
                                        apellido: true,
                                        email: true
                                    }
                                }
                            }
                        },
                        materias: {
                            include: {
                                materia: true,
                                docente: {
                                    include: {
                                        usuario: {
                                            select: {
                                                nombre: true,
                                                apellido: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    skip,
                    take: Number(limit),
                    orderBy: { nombre: 'asc' }
                }),
                prisma_1.prisma.curso.count({ where })
            ]);
            res.json({
                mensaje: 'Cursos obtenidos exitosamente',
                cursos,
                paginacion: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit))
                }
            });
        }
        catch (error) {
            console.error('💥 Error en obtenerCursos:', error);
            res.status(500).json({
                mensaje: 'Error al obtener cursos',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
    static async crearCurso(req, res) {
        try {
            const data = req.body;
            const [nivel, anoAcademico] = await Promise.all([
                prisma_1.prisma.nivel.findUnique({ where: { id: data.nivelId } }),
                prisma_1.prisma.anoAcademico.findUnique({ where: { id: data.anoAcademicoId } })
            ]);
            if (!nivel) {
                return res.status(404).json({ mensaje: 'Nivel no encontrado' });
            }
            if (!anoAcademico) {
                return res.status(404).json({ mensaje: 'Año académico no encontrado' });
            }
            const curso = await prisma_1.prisma.curso.create({
                data: {
                    nombre: data.nombre,
                    nivelId: data.nivelId,
                    anoAcademicoId: data.anoAcademicoId
                },
                include: {
                    nivel: true,
                    anoAcademico: true
                }
            });
            await prisma_1.prisma.registroAuditoria.create({
                data: {
                    accion: 'CREAR_CURSO',
                    detalles: `Curso creado: ${data.nombre}`,
                    usuarioId: req.usuario.sub,
                    ipAddress: req.ip
                }
            });
            res.status(201).json({
                mensaje: 'Curso creado exitosamente',
                curso
            });
        }
        catch (error) {
            console.error('💥 Error en crearCurso:', error);
            res.status(500).json({
                mensaje: 'Error al crear curso',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
    static async obtenerMaterias(req, res) {
        try {
            const materias = await prisma_1.prisma.materia.findMany({
                orderBy: { nombre: 'asc' },
                include: {
                    cursos: {
                        include: {
                            curso: {
                                include: {
                                    nivel: true,
                                    anoAcademico: true
                                }
                            },
                            docente: {
                                include: {
                                    usuario: {
                                        select: {
                                            nombre: true,
                                            apellido: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            res.json({
                mensaje: 'Materias obtenidas exitosamente',
                materias
            });
        }
        catch (error) {
            console.error('💥 Error en obtenerMaterias:', error);
            res.status(500).json({
                mensaje: 'Error al obtener materias',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
    static async crearMateria(req, res) {
        try {
            const data = req.body;
            const materia = await prisma_1.prisma.materia.create({
                data: {
                    nombre: data.nombre
                }
            });
            await prisma_1.prisma.registroAuditoria.create({
                data: {
                    accion: 'CREAR_MATERIA',
                    detalles: `Materia creada: ${data.nombre}`,
                    usuarioId: req.usuario.sub,
                    ipAddress: req.ip
                }
            });
            res.status(201).json({
                mensaje: 'Materia creada exitosamente',
                materia
            });
        }
        catch (error) {
            console.error('💥 Error en crearMateria:', error);
            res.status(500).json({
                mensaje: 'Error al crear materia',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
    static async asignarDocenteMateria(req, res) {
        try {
            const data = req.body;
            const [cursoMateria, docente] = await Promise.all([
                prisma_1.prisma.cursoMateria.findUnique({
                    where: { id: data.cursoMateriaId },
                    include: { curso: true, materia: true }
                }),
                prisma_1.prisma.perfilDocente.findUnique({
                    where: { id: data.docenteId },
                    include: { usuario: true }
                })
            ]);
            if (!cursoMateria) {
                return res.status(404).json({ mensaje: 'Curso-materia no encontrado' });
            }
            if (!docente) {
                return res.status(404).json({ mensaje: 'Docente no encontrado' });
            }
            const cursoMateriaActualizado = await prisma_1.prisma.cursoMateria.update({
                where: { id: data.cursoMateriaId },
                data: {
                    docenteId: data.docenteId
                },
                include: {
                    curso: true,
                    materia: true,
                    docente: {
                        include: {
                            usuario: {
                                select: {
                                    nombre: true,
                                    apellido: true
                                }
                            }
                        }
                    }
                }
            });
            await prisma_1.prisma.registroAuditoria.create({
                data: {
                    accion: 'ASIGNAR_DOCENTE',
                    detalles: `Docente ${docente.usuario.nombre} asignado a ${cursoMateria.materia.nombre} en ${cursoMateria.curso.nombre}`,
                    usuarioId: req.usuario.sub,
                    ipAddress: req.ip
                }
            });
            res.json({
                mensaje: 'Docente asignado exitosamente',
                cursoMateria: cursoMateriaActualizado
            });
        }
        catch (error) {
            console.error('💥 Error en asignarDocenteMateria:', error);
            res.status(500).json({
                mensaje: 'Error al asignar docente',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
    static async asignarEstudianteCurso(req, res) {
        try {
            const data = req.body;
            const [estudiante, curso] = await Promise.all([
                prisma_1.prisma.perfilEstudiante.findUnique({
                    where: { id: data.estudianteId },
                    include: { usuario: true }
                }),
                prisma_1.prisma.curso.findUnique({
                    where: { id: data.cursoId }
                })
            ]);
            if (!estudiante) {
                return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
            }
            if (!curso) {
                return res.status(404).json({ mensaje: 'Curso no encontrado' });
            }
            const estudianteActualizado = await prisma_1.prisma.perfilEstudiante.update({
                where: { id: data.estudianteId },
                data: {
                    cursoId: data.cursoId
                },
                include: {
                    usuario: {
                        select: {
                            nombre: true,
                            apellido: true,
                            email: true
                        }
                    },
                    curso: {
                        include: {
                            nivel: true,
                            anoAcademico: true
                        }
                    }
                }
            });
            await prisma_1.prisma.registroAuditoria.create({
                data: {
                    accion: 'ASIGNAR_ESTUDIANTE_CURSO',
                    detalles: `Estudiante ${estudiante.usuario.nombre} asignado al curso ${curso.nombre}`,
                    usuarioId: req.usuario.sub,
                    ipAddress: req.ip
                }
            });
            res.json({
                mensaje: 'Estudiante asignado al curso exitosamente',
                estudiante: estudianteActualizado
            });
        }
        catch (error) {
            console.error('💥 Error en asignarEstudianteCurso:', error);
            res.status(500).json({
                mensaje: 'Error al asignar estudiante al curso',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
    static async obtenerCalificaciones(req, res) {
        try {
            const { cursoId, materiaId } = req.query;
            const where = {};
            if (cursoId) {
                where.planEvaluacion = {
                    cursoMateria: {
                        cursoId: cursoId
                    }
                };
            }
            if (materiaId) {
                where.planEvaluacion = {
                    ...where.planEvaluacion,
                    cursoMateria: {
                        ...where.planEvaluacion?.cursoMateria,
                        materiaId: materiaId
                    }
                };
            }
            const calificaciones = await prisma_1.prisma.calificacion.findMany({
                where,
                include: {
                    estudiante: {
                        include: {
                            usuario: {
                                select: {
                                    nombre: true,
                                    apellido: true
                                }
                            },
                            curso: true
                        }
                    },
                    planEvaluacion: {
                        include: {
                            cursoMateria: {
                                include: {
                                    curso: true,
                                    materia: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    estudiante: {
                        usuario: {
                            apellido: 'asc'
                        }
                    }
                }
            });
            res.json({
                mensaje: 'Calificaciones obtenidas (solo lectura)',
                calificaciones
            });
        }
        catch (error) {
            console.error('💥 Error en obtenerCalificaciones:', error);
            res.status(500).json({
                mensaje: 'Error al obtener calificaciones',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
    static async obtenerAsistencias(req, res) {
        try {
            const { fecha, cursoId, estudianteId } = req.query;
            const where = {};
            if (fecha) {
                const fechaObj = new Date(fecha);
                const fechaFin = new Date(fechaObj);
                fechaFin.setDate(fechaFin.getDate() + 1);
                where.fecha = {
                    gte: fechaObj,
                    lt: fechaFin
                };
            }
            if (cursoId) {
                where.estudiante = {
                    cursoId: cursoId
                };
            }
            if (estudianteId) {
                where.estudianteId = estudianteId;
            }
            const asistencias = await prisma_1.prisma.asistencia.findMany({
                where,
                include: {
                    estudiante: {
                        include: {
                            usuario: {
                                select: {
                                    nombre: true,
                                    apellido: true
                                }
                            },
                            curso: true
                        }
                    },
                    cursoMateria: {
                        include: {
                            materia: true,
                            curso: true
                        }
                    }
                },
                orderBy: {
                    fecha: 'desc'
                },
                take: 100
            });
            const totalAsistencias = await prisma_1.prisma.asistencia.count({ where });
            const asistenciasPresente = await prisma_1.prisma.asistencia.count({
                where: {
                    ...where,
                    estado: 'PRESENTE'
                }
            });
            const estadisticas = {
                total: totalAsistencias,
                presentes: asistenciasPresente,
                ausentes: totalAsistencias - asistenciasPresente,
                porcentajeAsistencia: totalAsistencias > 0 ? (asistenciasPresente / totalAsistencias) * 100 : 0
            };
            res.json({
                mensaje: 'Asistencias obtenidas (solo lectura)',
                asistencias,
                estadisticas
            });
        }
        catch (error) {
            console.error('💥 Error en obtenerAsistencias:', error);
            res.status(500).json({
                mensaje: 'Error al obtener asistencias',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}
exports.DirectorController = DirectorController;
//# sourceMappingURL=director.controller.js.map