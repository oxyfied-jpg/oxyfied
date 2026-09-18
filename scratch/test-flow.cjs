const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTests() {
  console.log('=== STEP 13 & 14: TESTING COURSE PREVIEW DATA FLOW ===\n');

  const videoA = 'https://www.youtube.com/watch?v=inWWhr5tnEA';
  const videoB = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  const videoC = 'https://www.youtube.com/watch?v=L_LUpnjgPso';

  // 1. Set Course A to videoA
  await prisma.course.update({
    where: { slug: 'cybersecurity-ethical-hacking' },
    data: { previewVideoUrl: videoA }
  });
  console.log('✔ Course A (cybersecurity-ethical-hacking) configured with preview:', videoA);

  // 2. Set Course B to videoB
  await prisma.course.update({
    where: { slug: 'soc-analyst-threat-intelligence' },
    data: { previewVideoUrl: videoB }
  });
  console.log('✔ Course B (soc-analyst-threat-intelligence) configured with preview:', videoB);

  // 3. Set Course C to null (empty)
  await prisma.course.update({
    where: { slug: 'cloud-security-devsecops' },
    data: { previewVideoUrl: null }
  });
  console.log('✔ Course C (cloud-security-devsecops) configured with preview: null (empty)');

  // Verify Course A
  const courseA = await prisma.course.findUnique({
    where: { slug: 'cybersecurity-ethical-hacking' },
    select: { id: true, slug: true, title: true, previewVideoUrl: true }
  });
  console.log('\n[Course A in DB]:', courseA);
  if (courseA.previewVideoUrl !== videoA) {
    throw new Error(`Course A preview video mismatch! Expected ${videoA}, got ${courseA.previewVideoUrl}`);
  }

  // Verify Course B
  const courseB = await prisma.course.findUnique({
    where: { slug: 'soc-analyst-threat-intelligence' },
    select: { id: true, slug: true, title: true, previewVideoUrl: true }
  });
  console.log('[Course B in DB]:', courseB);
  if (courseB.previewVideoUrl !== videoB) {
    throw new Error(`Course B preview video mismatch! Expected ${videoB}, got ${courseB.previewVideoUrl}`);
  }

  // Verify Course C
  const courseC = await prisma.course.findUnique({
    where: { slug: 'cloud-security-devsecops' },
    select: { id: true, slug: true, title: true, previewVideoUrl: true }
  });
  console.log('[Course C in DB (Empty Preview)]:', courseC);
  if (courseC.previewVideoUrl !== null) {
    throw new Error(`Course C preview video mismatch! Expected null, got ${courseC.previewVideoUrl}`);
  }

  // 4. Update Course A to Video C
  await prisma.course.update({
    where: { slug: 'cybersecurity-ethical-hacking' },
    data: { previewVideoUrl: videoC }
  });
  const updatedCourseA = await prisma.course.findUnique({
    where: { slug: 'cybersecurity-ethical-hacking' },
    select: { id: true, slug: true, title: true, previewVideoUrl: true }
  });
  console.log('\n✔ Course A updated to Video C:', updatedCourseA);
  if (updatedCourseA.previewVideoUrl !== videoC) {
    throw new Error(`Updated Course A preview video mismatch! Expected ${videoC}, got ${updatedCourseA.previewVideoUrl}`);
  }

  console.log('\n=== ALL PREVIEW DATA FLOW AND ISOLATION TESTS PASSED! ===');
}

runTests()
  .catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
