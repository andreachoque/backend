// src/modules/director/director.types.ts

// Tipos para las requests y responses del módulo director
export interface CrearCursoData {
  nombre: string;
  nivelId: string;
  anoAcademicoId: string;
}

export interface CrearMateriaData {
  nombre: string;
}

export interface AsignarDocenteData {
  cursoMateriaId: string;
  docenteId: string;
}

export interface AsignarEstudianteCursoData {
  estudianteId: string;
  cursoId: string;
}

export interface CrearEventoData {
  titulo: string;
  fecha: Date;
  descripcion?: string;
  cursoId?: string; // Si es null, es evento global
}

// Interfaces para responses
export interface CursoConDetalles {
  id: string;
  nombre: string;
  nivel: {
    id: string;
    nombre: string;
  };
  anoAcademico: {
    id: string;
    nombre: string;
    activo: boolean;
  };
  estudiantes: Array<{
    id: string;
    usuario: {
      nombre: string;
      apellido: string;
      email: string;
    };
  }>;
  materias: Array<{
    id: string;
    materia: {
      id: string;
      nombre: string;
    };
    docente?: {
      id: string;
      usuario: {
        nombre: string;
        apellido: string;
      };
    };
  }>;
}

export interface EstadisticasDashboard {
  totalEstudiantes: number;
  totalDocentes: number;
  totalCursos: number;
  asistenciaPromedio: number;
  rendimientoPromedio: number;
}