import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testPreview() {
  console.log('=== TESTING PUBLIC COURSE PREVIEW DATA ===\n');

  // Fetch all courses
  const courses = await prisma.course.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      previewVideoUrl: true
    }
  });

  console.log(`Found ${courses.length} courses in database:`);
  courses.forEach(c => {
    console.log(`- [${c.slug}] "${c.title}"`);
    console.log(`  previewVideoUrl: ${c.previewVideoUrl}`);
  });

  // Test single course preview query
  const testSlug = 'cybersecurity-ethical-hacking';
  const preview = await prisma.course.findFirst({
    where: { OR: [{ slug: testSlug }, { id: testSlug }] },
    select: {
      id: true,
      slug: true,
      title: true,
      shortDescription: true,
      previewVideoUrl: true,
      thumbnail: true
    }
  });

  console.log(`\nTesting preview endpoint data for "${testSlug}":`);
  console.log(JSON.stringify(preview, null, 2));

  console.log('\n=== PUBLIC PREVIEW VERIFICATION COMPLETE ===');
}

testPreview()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
