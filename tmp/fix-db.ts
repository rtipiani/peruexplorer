
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando parche manual de BD ---');
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "AdCampaign" ADD COLUMN IF NOT EXISTS "targetId" TEXT;`);
    console.log('Columna targetId verificada/creada.');
    await prisma.$executeRawUnsafe(`ALTER TABLE "AdCampaign" ADD COLUMN IF NOT EXISTS "targetType" TEXT;`);
    console.log('Columna targetType verificada/creada.');
    console.log('--- Parche aplicado con éxito ---');
  } catch (err) {
    console.error('Error aplicando parche:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
