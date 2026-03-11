const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const postCount = await prisma.post.count();
    console.log('Total posts in database:', postCount);
    
    if (postCount > 0) {
      const posts = await prisma.post.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
      });
      console.log('Recent post titles/contents:');
      posts.forEach(p => console.log(`- [${p.id.substring(0,8)}] ${p.content?.substring(0,30)}... by ${p.userName}`));
    }
  } catch (e) {
    console.error('Error connecting to database:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
