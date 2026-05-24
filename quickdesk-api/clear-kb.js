const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.knowledgeChunk.deleteMany({});
  console.log('Deleted all chunks!');
}

main().finally(() => prisma.$disconnect());
