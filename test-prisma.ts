import prisma from './src/lib/db';

async function testPrisma() {
  try {
    console.log('Testing Prisma Client...');
    const models = Object.keys(prisma);
    console.log('Available models:', models.filter(m => !m.startsWith('_') && !m.startsWith('$')));
    
    // Test if businessProfile exists
    if ((prisma as any).businessProfile) {
      console.log('businessProfile model found in client');
    } else {
      console.log('businessProfile model NOT found in client');
    }
  } catch (err) {
    console.error('Error testing Prisma:', err);
  } finally {
    await (prisma as any).$disconnect();
  }
}

testPrisma();
