const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const postCount = await prisma.post.count();
    console.log('Total posts in database:', postCount);
    
    if (postCount > 0) {
      const posts = await prisma.post.findMany({
        take: 1,
        orderBy: { createdAt: 'desc' }
      });
      console.log('--- FIRST POST KEYS ---');
      console.log(Object.keys(posts[0]));
      console.log('--- FULL FIRST POST DATA ---');
      console.log(JSON.stringify(posts[0], null, 2));
    }
  } catch (e) {
    console.error('Error connecting to database:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
