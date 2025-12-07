"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const prisma_1 = require("./core/prisma");
const PUERTO = process.env.PORT || 3000;
async function iniciarServidor() {
    try {
        console.log('🚀 Iniciando servidor API Académica...');
        const conexionExitosa = await (0, prisma_1.verificarConexionBD)();
        if (!conexionExitosa) {
            throw new Error('No se pudo conectar a la base de datos');
        }
        const servidor = app_1.default.listen(PUERTO, () => {
            console.log('=================================');
            console.log('🎓 SISTEMA ACADÉMICO API');
            console.log('=================================');
            console.log(`✅ Servidor ejecutándose en: http://localhost:${PUERTO}`);
            console.log(`🔍 Health check: http://localhost:${PUERTO}/api/health`);
            console.log(`🔐 Auth: http://localhost:${PUERTO}/api/auth`);
            console.log('=================================');
            console.log('👤 Usuarios de prueba:');
            console.log('   ADMIN: admin@colegio.com / password123');
            console.log('   DIRECTOR: director@colegio.com / password123');
            console.log('   DOCENTE: docente@colegio.com / password123');
            console.log('   TUTOR: tutor@familia.com / password123');
            console.log('   ESTUDIANTE: estudiante@colegio.com / password123');
            console.log('=================================');
        });
        process.on('SIGINT', async () => {
            console.log('\n🔻 Recibida señal SIGINT, cerrando servidor...');
            servidor.close();
            await (0, prisma_1.cerrarConexionBD)();
            process.exit(0);
        });
        process.on('SIGTERM', async () => {
            console.log('🔻 Recibida señal SIGTERM, cerrando servidor...');
            servidor.close();
            await (0, prisma_1.cerrarConexionBD)();
            process.exit(0);
        });
    }
    catch (error) {
        console.error('💥 Error al iniciar el servidor:', error);
        process.exit(1);
    }
}
iniciarServidor();
//# sourceMappingURL=server.js.map