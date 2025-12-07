-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ADMINISTRADOR', 'DIRECTOR', 'DOCENTE', 'TUTOR', 'ESTUDIANTE');

-- CreateEnum
CREATE TYPE "EstadoAsistencia" AS ENUM ('PRESENTE', 'AUSENTE', 'ATRASO', 'LICENCIA');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "telefono" TEXT,
    "direccion" TEXT,
    "fotoUrl" TEXT,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerfilDirector" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "PerfilDirector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerfilDocente" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "PerfilDocente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerfilTutor" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "telegramChatId" TEXT,

    CONSTRAINT "PerfilTutor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerfilEstudiante" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "fechaNacimiento" TIMESTAMP(3) NOT NULL,
    "cursoId" TEXT,

    CONSTRAINT "PerfilEstudiante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnoAcademico" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AnoAcademico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nivel" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Nivel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Curso" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "nivelId" TEXT NOT NULL,
    "anoAcademicoId" TEXT NOT NULL,

    CONSTRAINT "Curso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Materia" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Materia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CursoMateria" (
    "id" TEXT NOT NULL,
    "cursoId" TEXT NOT NULL,
    "materiaId" TEXT NOT NULL,
    "docenteId" TEXT,

    CONSTRAINT "CursoMateria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanEvaluacion" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "porcentaje" DOUBLE PRECISION NOT NULL,
    "fecha" TIMESTAMP(3),
    "cursoMateriaId" TEXT NOT NULL,

    CONSTRAINT "PlanEvaluacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Calificacion" (
    "id" TEXT NOT NULL,
    "puntaje" DOUBLE PRECISION NOT NULL,
    "retroalimentacion" TEXT,
    "estudianteId" TEXT NOT NULL,
    "planEvaluacionId" TEXT NOT NULL,

    CONSTRAINT "Calificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asistencia" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoAsistencia" NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "cursoMateriaId" TEXT,

    CONSTRAINT "Asistencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comunicacion" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "fechaEnvio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "urgente" BOOLEAN NOT NULL DEFAULT false,
    "emisorId" TEXT NOT NULL,
    "receptorId" TEXT,
    "cursoDestinoId" TEXT,

    CONSTRAINT "Comunicacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MensajeCurso" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "fechaEnvio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo" TEXT NOT NULL,
    "docenteId" TEXT NOT NULL,
    "cursoId" TEXT NOT NULL,

    CONSTRAINT "MensajeCurso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "descripcion" TEXT,
    "cursoId" TEXT,

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroAuditoria" (
    "id" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "detalles" TEXT,
    "fechaHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "RegistroAuditoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PerfilEstudianteToPerfilTutor" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PerfilEstudianteToPerfilTutor_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_email_rol_idx" ON "Usuario"("email", "rol");

-- CreateIndex
CREATE INDEX "Usuario_activo_idx" ON "Usuario"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "PerfilDirector_usuarioId_key" ON "PerfilDirector"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "PerfilDocente_usuarioId_key" ON "PerfilDocente"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "PerfilTutor_usuarioId_key" ON "PerfilTutor"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "PerfilEstudiante_usuarioId_key" ON "PerfilEstudiante"("usuarioId");

-- CreateIndex
CREATE INDEX "AnoAcademico_activo_idx" ON "AnoAcademico"("activo");

-- CreateIndex
CREATE INDEX "Curso_nivelId_anoAcademicoId_idx" ON "Curso"("nivelId", "anoAcademicoId");

-- CreateIndex
CREATE INDEX "CursoMateria_cursoId_materiaId_idx" ON "CursoMateria"("cursoId", "materiaId");

-- CreateIndex
CREATE INDEX "CursoMateria_docenteId_idx" ON "CursoMateria"("docenteId");

-- CreateIndex
CREATE INDEX "PlanEvaluacion_cursoMateriaId_idx" ON "PlanEvaluacion"("cursoMateriaId");

-- CreateIndex
CREATE INDEX "Calificacion_estudianteId_planEvaluacionId_idx" ON "Calificacion"("estudianteId", "planEvaluacionId");

-- CreateIndex
CREATE INDEX "Calificacion_planEvaluacionId_idx" ON "Calificacion"("planEvaluacionId");

-- CreateIndex
CREATE INDEX "Asistencia_estudianteId_fecha_idx" ON "Asistencia"("estudianteId", "fecha");

-- CreateIndex
CREATE INDEX "Asistencia_fecha_estado_idx" ON "Asistencia"("fecha", "estado");

-- CreateIndex
CREATE INDEX "Comunicacion_fechaEnvio_urgente_idx" ON "Comunicacion"("fechaEnvio", "urgente");

-- CreateIndex
CREATE INDEX "MensajeCurso_cursoId_fechaEnvio_idx" ON "MensajeCurso"("cursoId", "fechaEnvio");

-- CreateIndex
CREATE INDEX "Evento_fecha_idx" ON "Evento"("fecha");

-- CreateIndex
CREATE INDEX "RegistroAuditoria_fechaHora_idx" ON "RegistroAuditoria"("fechaHora");

-- CreateIndex
CREATE INDEX "RegistroAuditoria_usuarioId_fechaHora_idx" ON "RegistroAuditoria"("usuarioId", "fechaHora");

-- CreateIndex
CREATE INDEX "_PerfilEstudianteToPerfilTutor_B_index" ON "_PerfilEstudianteToPerfilTutor"("B");

-- AddForeignKey
ALTER TABLE "PerfilDirector" ADD CONSTRAINT "PerfilDirector_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerfilDocente" ADD CONSTRAINT "PerfilDocente_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerfilTutor" ADD CONSTRAINT "PerfilTutor_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerfilEstudiante" ADD CONSTRAINT "PerfilEstudiante_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerfilEstudiante" ADD CONSTRAINT "PerfilEstudiante_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Curso" ADD CONSTRAINT "Curso_nivelId_fkey" FOREIGN KEY ("nivelId") REFERENCES "Nivel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Curso" ADD CONSTRAINT "Curso_anoAcademicoId_fkey" FOREIGN KEY ("anoAcademicoId") REFERENCES "AnoAcademico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CursoMateria" ADD CONSTRAINT "CursoMateria_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CursoMateria" ADD CONSTRAINT "CursoMateria_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CursoMateria" ADD CONSTRAINT "CursoMateria_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "PerfilDocente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanEvaluacion" ADD CONSTRAINT "PlanEvaluacion_cursoMateriaId_fkey" FOREIGN KEY ("cursoMateriaId") REFERENCES "CursoMateria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calificacion" ADD CONSTRAINT "Calificacion_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "PerfilEstudiante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calificacion" ADD CONSTRAINT "Calificacion_planEvaluacionId_fkey" FOREIGN KEY ("planEvaluacionId") REFERENCES "PlanEvaluacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asistencia" ADD CONSTRAINT "Asistencia_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "PerfilEstudiante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asistencia" ADD CONSTRAINT "Asistencia_cursoMateriaId_fkey" FOREIGN KEY ("cursoMateriaId") REFERENCES "CursoMateria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comunicacion" ADD CONSTRAINT "Comunicacion_emisorId_fkey" FOREIGN KEY ("emisorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comunicacion" ADD CONSTRAINT "Comunicacion_receptorId_fkey" FOREIGN KEY ("receptorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MensajeCurso" ADD CONSTRAINT "MensajeCurso_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "PerfilDocente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MensajeCurso" ADD CONSTRAINT "MensajeCurso_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroAuditoria" ADD CONSTRAINT "RegistroAuditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PerfilEstudianteToPerfilTutor" ADD CONSTRAINT "_PerfilEstudianteToPerfilTutor_A_fkey" FOREIGN KEY ("A") REFERENCES "PerfilEstudiante"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PerfilEstudianteToPerfilTutor" ADD CONSTRAINT "_PerfilEstudianteToPerfilTutor_B_fkey" FOREIGN KEY ("B") REFERENCES "PerfilTutor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
