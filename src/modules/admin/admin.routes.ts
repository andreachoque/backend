import { Router } from 'express';
import { RolUsuario } from '@prisma/client';
import { middlewareAutenticacion, requerirRol } from '../../core/auth';
import { AdminController } from './admin.controller';

const router = Router();

router.use(middlewareAutenticacion);
router.use(requerirRol(RolUsuario.ADMINISTRADOR));

router.get('/usuarios', AdminController.listarUsuarios);
router.post('/usuarios', AdminController.crearUsuario);
router.patch('/usuarios/:id', AdminController.actualizarUsuario);

router.get('/auditoria', AdminController.obtenerAuditoria);

export const rutasAdmin = router;