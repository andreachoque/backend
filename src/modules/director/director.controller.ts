// src/modules/director/director.controller.ts
import { Response } from 'express';
import { prisma } from '../../core/prisma';
import { RequestConUsuario } from '../../core/auth';
import {
  CrearCursoData,
  CrearMateriaData,
  AsignarDocenteData,
  AsignarEstudianteCursoData,
  CrearEventoData,
  CursoConDetalles
} from './types/director.types';
import { crearComunicacionSchema } from './director.validations';

/**
 * Controlador para el módulo del Director
 * Contiene toda la lógica de negocio para gestionar la estructura académica
 */

export class DirectorController {
  /**
   * Obtener dashboard del director con estadísticas
   */
  static async obtenerDashboard(req: RequestConUsuario, res: Response) {
    try {
      console.log('📊 Solicitando dashboard del director:', req.usuario?.sub);

      // Obtener estadísticas generales
      const [totalEstudiantes, totalDocentes, totalCursos, anosAcademicos] = await Promise.all([
        prisma.perfilEstudiante.count(),
        prisma.perfilDocente.count(),
        prisma.curso.count(),
        prisma.anoAcademico.findMany({
          where: { activo: true },
          include: {
            cursos: {
              include: {
                estudiantes: true,

              }
            }
          }
        })
      ]);

      // Calcular asistencia promedio (ejemplo simplificado)
      const totalAsistencias = await prisma.asistencia.count({
        where: {
          fecha: {
            gte: new Date(new Date().getFullYear(), 0, 1) // Desde inicio del año
          }
        }
      });

      const asistenciasPresente = await prisma.asistencia.count({
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

    } catch (error) {
      console.error('💥 Error en obtenerDashboard:', error);
      res.status(500).json({
        mensaje: 'Error al obtener el dashboard',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener todos los cursos con detalles
   */
  static async obtenerCursos(req: RequestConUsuario, res: Response) {
    try {
      const page = Number(res.locals.page) || 1;
      const limit = Number(res.locals.limit) || 10;
      const search = res.locals.search;
      const skip = (page - 1) * limit;

      const where = search ? {
        OR: [
          { nombre: { contains: String(search), mode: 'insensitive' as const } },
          { nivel: { nombre: { contains: String(search), mode: 'insensitive' as const } } }
        ]
      } : {};

      const [cursos, total] = await Promise.all([
        prisma.curso.findMany({
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
        prisma.curso.count({ where })
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

    } catch (error) {
      console.error('💥 Error en obtenerCursos:', error);
      res.status(500).json({
        mensaje: 'Error al obtener cursos',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Crear un nuevo curso
   */
  static async crearCurso(req: RequestConUsuario, res: Response) {
    try {
      const data: CrearCursoData = req.body;
      
      // Verificar que el nivel y año académico existan
      const [nivel, anoAcademico] = await Promise.all([
        prisma.nivel.findUnique({ where: { id: data.nivelId } }),
        prisma.anoAcademico.findUnique({ where: { id: data.anoAcademicoId } })
      ]);

      if (!nivel) {
        return res.status(404).json({ mensaje: 'Nivel no encontrado' });
      }

      if (!anoAcademico) {
        return res.status(404).json({ mensaje: 'Año académico no encontrado' });
      }

      const curso = await prisma.curso.create({
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

      
      // Registrar en auditoría
      await prisma.registroAuditoria.create({
        data: {
          accion: 'CREAR_CURSO',
          detalles: `Curso creado: ${data.nombre}`,
          usuarioId: req.usuario!.sub,
          ipAddress: req.ip
        }
      });

      res.status(201).json({
        mensaje: 'Curso creado exitosamente',
        curso
      });

    } catch (error) {
      console.error('💥 Error en crearCurso:', error);
      res.status(500).json({
        mensaje: 'Error al crear curso',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Crear un evento (global o por curso)
   */
  static async crearEvento(req: RequestConUsuario, res: Response) {
    try {
      if (!req.usuario) {
        return res.status(401).json({ mensaje: 'Usuario no autenticado' });
      }

      const data: CrearEventoData = req.body;

      const evento = await prisma.evento.create({
        data: {
          titulo: data.titulo,
          fecha: new Date(data.fecha),
          descripcion: data.descripcion,
          cursoId: data.cursoId ?? null
        },
        include: {
          curso: true
        }
      });

      await prisma.registroAuditoria.create({
        data: {
          accion: 'CREAR_EVENTO',
          detalles: `Evento creado: ${data.titulo}`,
          usuarioId: req.usuario.sub,
          ipAddress: req.ip
        }
      });

      res.status(201).json({
        mensaje: 'Evento creado exitosamente',
        evento
      });
    } catch (error) {
      console.error('💥 Error en crearEvento:', error);
      res.status(500).json({
        mensaje: 'Error al crear evento',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }

  /**
   * Obtener todas las materias
   */
  static async obtenerMaterias(req: RequestConUsuario, res: Response) {
    try {
      const materias = await prisma.materia.findMany({
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
                
      // Registrar en auditoría
      await prisma.registroAuditoria.create({
        data: {
          accion: 'CREAR_MATERIA',
          detalles: `Materia creada: ${data.nombre}`,
          usuarioId: req.usuario!.sub,
          ipAddress: req.ip
        }
      });

      res.status(201).json({
        mensaje: 'Materia creada exitosamente',
        materia
      });

    } catch (error) {
      console.error('💥 Error en crearMateria:', error);
      res.status(500).json({
        mensaje: 'Error al crear materia',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Asignar docente a una materia en un curso
   */
  static async asignarDocenteMateria(req: RequestConUsuario, res: Response) {
    try {
      const data: AsignarDocenteData = req.body;

      // Verificar que el curso-materia y docente existan
      const [cursoMateria, docente] = await Promise.all([
        prisma.cursoMateria.findUnique({ 
          where: { id: data.cursoMateriaId },
          include: { curso: true, materia: true }
        }),
        prisma.perfilDocente.findUnique({ 
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

      const cursoMateriaActualizado = await prisma.cursoMateria.update({
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

      // Registrar en auditoría
      await prisma.registroAuditoria.create({
        data: {
          accion: 'ASIGNAR_DOCENTE',
          detalles: `Docente ${docente.usuario.nombre} asignado a ${cursoMateria.materia.nombre} en ${cursoMateria.curso.nombre}`,
          usuarioId: req.usuario!.sub,
          ipAddress: req.ip
        }
      });

      res.json({
        mensaje: 'Docente asignado exitosamente',
        cursoMateria: cursoMateriaActualizado
      });

    } catch (error) {
      console.error('💥 Error en asignarDocenteMateria:', error);
      res.status(500).json({
        mensaje: 'Error al asignar docente',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Asignar estudiante a un curso
   */
  static async asignarEstudianteCurso(req: RequestConUsuario, res: Response) {
    try {
      const data: AsignarEstudianteCursoData = req.body;

      // Verificar que el estudiante y curso existan
      const [estudiante, curso] = await Promise.all([
        prisma.perfilEstudiante.findUnique({
          where: { id: data.estudianteId },
          include: { usuario: true }
        }),
        prisma.curso.findUnique({
          where: { id: data.cursoId }
        })
      ]);

      if (!estudiante) {
        return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
      }

      if (!curso) {
        return res.status(404).json({ mensaje: 'Curso no encontrado' });
      }

      const estudianteActualizado = await prisma.perfilEstudiante.update({
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

     // Registrar en auditoría
      await prisma.registroAuditoria.create({
        data: {
          accion: 'ASIGNAR_ESTUDIANTE_CURSO',
          detalles: `Estudiante ${estudiante.usuario.nombre} asignado al curso ${curso.nombre}`,
          usuarioId: req.usuario!.sub,
          ipAddress: req.ip
        }
      });

      res.json({
        mensaje: 'Estudiante asignado al curso exitosamente',
        estudiante: estudianteActualizado
      });

    } catch (error) {
      console.error('💥 Error en asignarEstudianteCurso:', error);
      res.status(500).json({
        mensaje: 'Error al asignar estudiante al curso',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Enviar comunicaciones institucionales (director)
   */
  static async enviarComunicacion(req: RequestConUsuario, res: Response) {
    try {
      const parsed = crearComunicacionSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({ mensaje: 'Datos inválidos', errores: parsed.error.flatten() });
      }

      const data = parsed.data;

      // Validar destinatarios referenciales
      if (data.receptorId) {
        const receptor = await prisma.usuario.findUnique({ where: { id: data.receptorId } });
        if (!receptor) {
          return res.status(404).json({ mensaje: 'El receptor indicado no existe' });
        }
      }

      if (data.cursoDestinoId) {
        const curso = await prisma.curso.findUnique({ where: { id: data.cursoDestinoId } });
        if (!curso) {
          return res.status(404).json({ mensaje: 'El curso destino no existe' });
        }
      }

      const comunicacion = await prisma.comunicacion.create({
        data: {
          titulo: data.titulo,
          contenido: data.contenido,
          urgente: data.urgente,
          emisorId: req.usuario!.sub,
          receptorId: data.receptorId ?? null,
          cursoDestinoId: data.cursoDestinoId ?? null,
        },
      });

      await prisma.registroAuditoria.create({
        data: {
          accion: 'ENVIAR_COMUNICACION',
          detalles: `Comunicacion: ${data.titulo}`,
          usuarioId: req.usuario!.sub,
          ipAddress: req.ip,
        },
      });

      return res.status(201).json({ mensaje: 'Comunicación enviada', comunicacion });
    } catch (error) {
      console.error('💥 Error en enviarComunicacion:', error);
      return res.status(500).json({ mensaje: 'Error al enviar comunicación', error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined });
    }
  }

  /**
   * Obtener calificaciones (solo lectura - supervisión)
   */
  static async obtenerCalificaciones(req: RequestConUsuario, res: Response) {
    try {
      const { cursoId, materiaId } = req.query;

      const where: any = {};

      if (cursoId) {
        where.planEvaluacion = {
          cursoMateria: {
            cursoId: cursoId as string
          }
        };
      }

      if (materiaId) {
        where.planEvaluacion = {
          ...where.planEvaluacion,
          cursoMateria: {
            ...where.planEvaluacion?.cursoMateria,
            materiaId: materiaId as string
          }
        };

        }
        }
      }
    }

