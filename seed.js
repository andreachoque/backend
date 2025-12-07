const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// NOTA: Contraseña simple para pruebas. En producción, usa bcrypt.
const PASSWORD_TEST = 'password123'; 

async function main() {
  console.log('Iniciando el proceso de siembra de datos...');

  // --- 1. ESTRUCTURA ACADÉMICA BASE ---
  const anoAcademico = await prisma.anoAcademico.create({
    data: {
      nombre: 'Gestión 2025 (Activo)',
      fechaInicio: new Date('2025-02-01T00:00:00Z'),
      fechaFin: new Date('2025-11-30T00:00:00Z'),
      activo: true,
    },
  });

  const nivelSecundaria = await prisma.nivel.create({
    data: { nombre: 'Secundaria' },
  });

  const cursoPrimeroA = await prisma.curso.create({
    data: {
      nombre: '1ro A',
      nivelId: nivelSecundaria.id,
      anoAcademicoId: anoAcademico.id,
    },
  });
  
  const materiaMatematicas = await prisma.materia.create({
    data: { nombre: 'Matemáticas' },
  });
  
  // NUEVA MATERIA
  const materiaFisica = await prisma.materia.create({
    data: { nombre: 'Física' },
  });

  console.log('Estructura académica base creada.');

  // --- 2. CREACIÓN DE USUARIOS BASE ---

  // 2.1. ADMINISTRADOR
  const userAdmin = await prisma.usuario.create({
    data: {
      email: 'admin@colegio.com',
      password: PASSWORD_TEST, 
      rol: 'ADMINISTRADOR',
      nombre: 'Juan',
      apellido: 'Pérez (ADMIN)',
    },
  });
  console.log(`Usuario ADMIN creado: ${userAdmin.email}`);

  // 2.2. DIRECTOR
  const userDirector = await prisma.usuario.create({
    data: {
      email: 'director@colegio.com',
      password: PASSWORD_TEST,
      rol: 'DIRECTOR',
      nombre: 'Carla',
      apellido: 'Gonzales (DIRECTOR)',
      perfilDirector: { create: {} }, // Crea el perfil 1:1
    },
  });
  console.log(`Usuario DIRECTOR creado: ${userDirector.email}`);

  // 2.3. DOCENTE 1 (Matemáticas)
  const userDocente = await prisma.usuario.create({
    data: {
      email: 'docente@colegio.com',
      password: PASSWORD_TEST,
      rol: 'DOCENTE',
      nombre: 'Andrés',
      apellido: 'Mamani (DOCENTE MAT)',
      perfilDocente: { create: {} }, // Crea el perfil 1:1
    },
    include: { perfilDocente: true }, // Incluye el perfil para usar su ID abajo
  });
  console.log(`Usuario DOCENTE 1 creado: ${userDocente.email}`);

  // 2.3. DOCENTE 2 (Física)
  const userDocente2 = await prisma.usuario.create({
    data: {
      email: 'docente2@colegio.com',
      password: PASSWORD_TEST,
      rol: 'DOCENTE',
      nombre: 'Lucía',
      apellido: 'Méndez (DOCENTE FIS)',
      perfilDocente: { create: {} }, // Crea el perfil 1:1
    },
    include: { perfilDocente: true },
  });
  console.log(`Usuario DOCENTE 2 creado: ${userDocente2.email}`);


  // 2.4. TUTOR
  const userTutor = await prisma.usuario.create({
    data: {
      email: 'tutor@familia.com',
      password: PASSWORD_TEST,
      rol: 'TUTOR',
      nombre: 'María',
      apellido: 'López (TUTOR)',
      perfilTutor: { create: { telegramChatId: '123456789' } },
    },
    include: { perfilTutor: true }, // Incluye el perfil para usar su ID en el estudiante
  });
  console.log(`Usuario TUTOR creado: ${userTutor.email}`);

  // 2.5. ESTUDIANTE 1 (Hijo del Tutor)
  const userEstudiante = await prisma.usuario.create({
    data: {
      email: 'estudiante@colegio.com',
      password: PASSWORD_TEST,
      rol: 'ESTUDIANTE',
      nombre: 'Sofía',
      apellido: 'López (ESTUDIANTE 1)',
      perfilEstudiante: {
        create: {
          fechaNacimiento: new Date('2010-05-15T00:00:00Z'),
          cursoId: cursoPrimeroA.id, // Asigna al 1ro A
          // Conecta con el Tutor
          tutores: { connect: { id: userTutor.perfilTutor.id } },
        },
      },
    },
    include: { perfilEstudiante: true }, 
  });
  console.log(`Usuario ESTUDIANTE 1 creado: ${userEstudiante.email}`);

  // 2.6. ESTUDIANTE 2 (Mismo curso, sin tutor asignado)
  const userEstudiante2 = await prisma.usuario.create({
    data: {
      email: 'estudiante2@colegio.com',
      password: PASSWORD_TEST,
      rol: 'ESTUDIANTE',
      nombre: 'Pedro',
      apellido: 'Rodríguez (ESTUDIANTE 2)',
      perfilEstudiante: {
        create: {
          fechaNacimiento: new Date('2010-08-20T00:00:00Z'),
          cursoId: cursoPrimeroA.id, // Asigna al 1ro A
        },
      },
    },
    include: { perfilEstudiante: true }, 
  });
  console.log(`Usuario ESTUDIANTE 2 creado: ${userEstudiante2.email}`);


  // --- 3. ASIGNACIONES CLAVE (DOCENTE + CURSO + MATERIA) ---

  // 3.1. Asignación Matemáticas (Docente 1)
  const asignacionMatematicas = await prisma.cursoMateria.create({
    data: {
      cursoId: cursoPrimeroA.id,
      materiaId: materiaMatematicas.id,
      docenteId: userDocente.perfilDocente.id, // Docente 1 (Mamani)
    },
  });
  console.log(`Docente 1 (Mamani) asignado a Matemáticas en 1ro A.`);
  
  // 3.2. Asignación Física (Docente 2)
  const asignacionFisica = await prisma.cursoMateria.create({
    data: {
      cursoId: cursoPrimeroA.id,
      materiaId: materiaFisica.id,
      docenteId: userDocente2.perfilDocente.id, // Docente 2 (Méndez)
    },
  });
  console.log(`Docente 2 (Méndez) asignado a Física en 1ro A.`);

  // --- 4. DATA ACADÉMICA DE PRUEBA (CALIFICACIÓN Y ASISTENCIA) ---

  // 4.1. Plan de Evaluación (Matemáticas)
  const planEvaluacionMat = await prisma.planEvaluacion.create({
    data: {
      titulo: 'Examen de Álgebra y Funciones',
      porcentaje: 40.0,
      fecha: new Date('2025-05-20T00:00:00Z'),
      cursoMateriaId: asignacionMatematicas.id,
    },
  });
  
  // 4.2. Plan de Evaluación (Física)
  const planEvaluacionFis = await prisma.planEvaluacion.create({
    data: {
      titulo: 'Informe Práctico de Vectores',
      porcentaje: 30.0,
      fecha: new Date('2025-04-10T00:00:00Z'),
      cursoMateriaId: asignacionFisica.id,
    },
  });

  // 4.3. Calificaciones
  // Estudiante 1 en Matemáticas (Mat: 85.5)
  await prisma.calificacion.create({
    data: {
      puntaje: 85.5,
      retroalimentacion: 'Buen manejo de álgebra.',
      estudianteId: userEstudiante.perfilEstudiante.id, 
      planEvaluacionId: planEvaluacionMat.id,
    },
  });
  
  // Estudiante 2 en Matemáticas (Mat: 62.0)
  await prisma.calificacion.create({
    data: {
      puntaje: 62.0,
      retroalimentacion: 'Necesita repasar funciones.',
      estudianteId: userEstudiante2.perfilEstudiante.id, 
      planEvaluacionId: planEvaluacionMat.id,
    },
  });
  
  // Estudiante 1 en Física (Fis: 95.0)
  await prisma.calificacion.create({
    data: {
      puntaje: 95.0,
      retroalimentacion: 'Excelente presentación del informe.',
      estudianteId: userEstudiante.perfilEstudiante.id, 
      planEvaluacionId: planEvaluacionFis.id,
    },
  });


  // 4.4. Asistencia
  // Estudiante 1 (Presente)
  await prisma.asistencia.create({
    data: {
      estado: 'PRESENTE',
      fecha: new Date('2025-03-01T08:00:00Z'),
      estudianteId: userEstudiante.perfilEstudiante.id,
      cursoMateriaId: asignacionMatematicas.id,
    },
  });
  // Estudiante 2 (Ausente)
  await prisma.asistencia.create({
    data: {
      estado: 'AUSENTE',
      fecha: new Date('2025-03-01T08:00:00Z'),
      estudianteId: userEstudiante2.perfilEstudiante.id,
      cursoMateriaId: asignacionMatematicas.id,
    },
  });

  // --- 5. DATA PARA DIRECTOR / COMUNICACIONES ---
  
  // 5.1. Evento del Colegio (creado por el Director)
  await prisma.evento.create({
    data: {
      titulo: 'Reunión de Padres de Familia',
      fecha: new Date('2025-06-15T18:00:00Z'),
      descripcion: 'El Director convoca a todos los tutores para discutir el avance académico del semestre.',
      cursoId: null, // Evento global
    },
  });
  console.log('Evento global creado.');

  // 5.2. Mensaje a Curso (creado por Docente 1)
  await prisma.mensajeCurso.create({
    data: {
      titulo: 'Tarea de la semana',
      contenido: 'Resolver los ejercicios 15 al 20 del libro de álgebra.',
      tipo: 'TAREA',
      docenteId: userDocente.perfilDocente.id,
      cursoId: cursoPrimeroA.id,
    },
  });
  console.log('Mensaje de tarea enviado al curso 1ro A.');


  console.log('\n======================================================');
  console.log('¡Siembra completada con datos de prueba extendidos!');
  console.log('======================================================');
  console.log('Usuarios de Prueba:');
  console.log('- ADMIN: admin@colegio.com');
  console.log('- DIRECTOR: director@colegio.com (Puede ver eventos globales)');
  console.log('- DOCENTE 1: docente@colegio.com (Asignado a Matemáticas)');
  console.log('- DOCENTE 2: docente2@colegio.com (Asignado a Física)');
  console.log('- TUTOR: tutor@familia.com (Padre de Estudiante 1)');
  console.log('- ESTUDIANTE 1: estudiante@colegio.com (con notas en ambas materias)');
  console.log('- ESTUDIANTE 2: estudiante2@colegio.com (con notas y una ausencia)');
  console.log('======================================================');
}

main()
  .catch((e) => {
    console.error('\nAn error occurred while running the seed command:');
    console.error(e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });