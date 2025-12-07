"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const auth_routes_1 = require("./modules/auth/auth.routes");
const director_routes_1 = require("./modules/director/director.routes");
const docente_routes_1 = require("./modules/docente/docente.routes");
const tutor_routes_1 = require("./modules/tutor/tutor.routes");
const estudiante_routes_1 = require("./modules/estudiante/estudiante.routes");
const prisma_1 = require("./core/prisma");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
app.get('/api/health', async (_req, res) => {
    const conexionBD = await (0, prisma_1.verificarConexionBD)();
    res.json({
        estado: 'ok',
        mensaje: 'API Académica funcionando correctamente',
        timestamp: new Date().toISOString(),
        baseDeDatos: conexionBD ? 'conectada' : 'error'
    });
});
app.get('/api', (_req, res) => {
    res.json({
        mensaje: 'Bienvenido a la API del Sistema Académico',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            director: '/api/director',
            docente: '/api/docente',
            tutor: '/api/tutor',
            estudiante: '/api/estudiante',
            health: '/api/health'
        }
    });
});
app.use('/api/auth', auth_routes_1.rutasAuth);
app.use('/api/director', director_routes_1.rutasDirector);
app.use('/api/docente', docente_routes_1.rutasDocente);
app.use('/api/tutor', tutor_routes_1.rutasTutor);
app.use('/api/estudiante', estudiante_routes_1.rutasEstudiante);
app.use('*', (req, res) => {
    res.status(404).json({
        mensaje: 'Ruta no encontrada',
        ruta: req.originalUrl,
        metodo: req.method
    });
});
app.use((error, _req, res, _next) => {
    console.error('💥 Error no manejado:', error);
    res.status(500).json({
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map