import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

export async function verificarConexionBD() {
  try {
    await prisma.$connect();
    console.log('✅ Conectado a la base de datos PostgreSQL');
    return true;
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error);
    return false;
  }
}

export async function cerrarConexionBD() {
  await prisma.$disconnect();
  console.log('🔌 Conexión a BD cerrada');
}