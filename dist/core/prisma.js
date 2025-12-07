"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.verificarConexionBD = verificarConexionBD;
exports.cerrarConexionBD = cerrarConexionBD;
const client_1 = require("@prisma/client");
exports.prisma = new client_1.PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});
async function verificarConexionBD() {
    try {
        await exports.prisma.$connect();
        console.log('✅ Conectado a la base de datos PostgreSQL');
        return true;
    }
    catch (error) {
        console.error('❌ Error conectando a la base de datos:', error);
        return false;
    }
}
async function cerrarConexionBD() {
    await exports.prisma.$disconnect();
    console.log('🔌 Conexión a BD cerrada');
}
//# sourceMappingURL=prisma.js.map