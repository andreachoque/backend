"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rutasAuth = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../../core/prisma");
const auth_1 = require("../../core/auth");
const router = (0, express_1.Router)();
const esquemaLogin = zod_1.z.object({
    email: zod_1.z.string().email('El email debe ser válido'),
    password: zod_1.z.string().min(4, 'La contraseña debe tener al menos 4 caracteres'),
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
        const usuario = await prisma_1.prisma.usuario.findUnique({
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
        const token = (0, auth_1.generarToken)({
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
    }
    catch (error) {
        console.error('💥 Error en /auth/login:', error);
        return res.status(500).json({
            mensaje: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
router.get('/me', auth_1.middlewareAutenticacion, async (req, res) => {
    try {
        console.log('👤 Solicitando datos del usuario:', req.usuario?.sub);
        const usuario = await prisma_1.prisma.usuario.findUnique({
            where: { id: req.usuario.sub },
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
    }
    catch (error) {
        console.error('💥 Error en /auth/me:', error);
        return res.status(500).json({
            mensaje: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
router.get('/verificar-token', auth_1.middlewareAutenticacion, (req, res) => {
    res.json({
        mensaje: 'Token válido',
        valido: true,
        usuario: req.usuario
    });
});
exports.rutasAuth = router;
//# sourceMappingURL=auth.routes.js.map