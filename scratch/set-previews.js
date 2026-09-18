import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.course.updateMany({
    where: {
      previewVideoUrl: null
    },
    data: {
      previewVideoUrl: 'https://www.youtube.com/watch?v=inWWhr5tnEA'
    }
  });
  console.log(`Updated ${result.count} courses with sample preview video.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
