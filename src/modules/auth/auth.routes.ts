import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../core/prisma';
import { RequestConUsuario, middlewareAutenticacion, generarToken } from '../../core/auth';

const router = Router();

const esquemaLogin = z.object({
  email: z.string().email('El email debe ser válido'),
  password: z.string().min(4, 'La contraseña debe tener al menos 4 caracteres'),
});

router.post('/login', async (req, res) => {
  try {
    console.log('🔐 Intento de login para:', req.body.email);
    
    const resultadoValidacion = esquemaLogin.safeParse(req.body);
    
    if (!resultadoValidacion.success) {
      return res.status(400).json({
        mensaje: 'Datos de entrada inválidos',
        errores: resultadoValidacion.error.flatten(),
      });
    }

    const { email, password } = resultadoValidacion.data;

    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: {
        perfilDirector: true,
        perfilDocente: true,
        perfilTutor: true,
        perfilEstudiante: true
      }
    });

    if (!usuario) {
      console.log('❌ Usuario no encontrado:', email);
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }
    
    if (!usuario.activo) {
      console.log('❌ Usuario inactivo:', email);
      return res.status(401).json({ mensaje: 'Usuario desactivado' });
    }

    if (usuario.password !== password) {
      console.log('❌ Contraseña incorrecta para:', email);
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    const token = generarToken({ 
      sub: usuario.id, 
      rol: usuario.rol 
    });

    console.log('✅ Login exitoso para:', usuario.email, 'rol:', usuario.rol);
    
    return res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.rol,
        activo: usuario.activo,
        perfiles: {
          director: usuario.perfilDirector,
          docente: usuario.perfilDocente,
          tutor: usuario.perfilTutor,
          estudiante: usuario.perfilEstudiante
        }
      },
    });
  } catch (error) {
    console.error('💥 Error en /auth/login:', error);
    return res.status(500).json({ 
      mensaje: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/me', middlewareAutenticacion, async (req: RequestConUsuario, res) => {
  try {
    console.log('👤 Solicitando datos del usuario:', req.usuario?.sub);
    
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario!.sub },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        rol: true,
        activo: true,
        telefono: true,
        direccion: true,
        fotoUrl: true,
        fechaCreacion: true,
        perfilDirector: true,
        perfilDocente: true,
        perfilTutor: true,
        perfilEstudiante: true,
      },
    });

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    console.log('✅ Datos de usuario enviados para:', usuario.email);
    
    return res.json({ 
      mensaje: 'Datos de usuario obtenidos',
      usuario 
    });
  } catch (error) {
    console.error('💥 Error en /auth/me:', error);
    return res.status(500).json({ 
      mensaje: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/verificar-token', middlewareAutenticacion, (req: RequestConUsuario, res) => {
  res.json({ 
    mensaje: 'Token válido',
    valido: true,
    usuario: req.usuario 
  });
});

export const rutasAuth = router;