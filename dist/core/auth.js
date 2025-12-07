"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generarToken = generarToken;
exports.middlewareAutenticacion = middlewareAutenticacion;
exports.requerirRol = requerirRol;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const CLAVE_JWT = process.env.JWT_SECRET || 'clave_secreta_por_defecto';
function generarToken(payload) {
    return jsonwebtoken_1.default.sign(payload, CLAVE_JWT, { expiresIn: '8h' });
}
function middlewareAutenticacion(req, res, next) {
    const header = req.headers.authorization;
    if (!header) {
        return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }
    const [tipo, token] = header.split(' ');
    if (tipo !== 'Bearer' || !token) {
        return res.status(401).json({ mensaje: 'Formato de token inválido' });
    }
    try {
        const decodificado = jsonwebtoken_1.default.verify(token, CLAVE_JWT);
        req.usuario = decodificado;
        next();
    }
    catch (error) {
        return res.status(401).json({ mensaje: 'Token inválido o expirado' });
    }
}
function requerirRol(...rolesPermitidos) {
    return (req, res, next) => {
        if (!req.usuario) {
            return res.status(401).json({ mensaje: 'No autenticado' });
        }
        if (!rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({
                mensaje: 'No autorizado: rol insuficiente',
                rolActual: req.usuario.rol,
                rolesRequeridos: rolesPermitidos
            });
        }
        next();
    };
}
//# sourceMappingURL=auth.js.map