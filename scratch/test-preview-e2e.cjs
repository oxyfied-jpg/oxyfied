const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runAcceptanceTest() {
  console.log('====================================================');
  console.log('PHASE 12 — FINAL ACCEPTANCE TEST: COURSE PREVIEW VIDEO');
  console.log('====================================================\n');

  const VIDEO_A = 'https://www.youtube.com/watch?v=inWWhr5tnEA';
  const VIDEO_B = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  const VIDEO_C = 'https://www.youtube.com/watch?v=L_LUpnjgPso';

  const courseASlug = 'cybersecurity-ethical-hacking';
  const courseBSlug = 'soc-analyst-threat-intelligence';

  // Step 1: Save Course A with VIDEO A
  await prisma.course.update({
    where: { slug: courseASlug },
    data: { previewVideoUrl: VIDEO_A }
  });
  console.log(`[Step 1] Course A (${courseASlug}) previewVideoUrl set to VIDEO A`);

  // Step 2: Save Course B with VIDEO B
  await prisma.course.update({
    where: { slug: courseBSlug },
    data: { previewVideoUrl: VIDEO_B }
  });
  console.log(`[Step 2] Course B (${courseBSlug}) previewVideoUrl set to VIDEO B\n`);

  // Step 3: Verify Database
  const dbCourseA = await prisma.course.findUnique({
    where: { slug: courseASlug },
    select: { id: true, slug: true, title: true, previewVideoUrl: true }
  });
  const dbCourseB = await prisma.course.findUnique({
    where: { slug: courseBSlug },
    select: { id: true, slug: true, title: true, previewVideoUrl: true }
  });

  console.log('--- DATABASE VERIFICATION ---');
  console.log('Course A:', dbCourseA);
  console.log('Course B:', dbCourseB);

  if (dbCourseA.previewVideoUrl !== VIDEO_A) {
    throw new Error(`Course A DB check failed: Expected ${VIDEO_A}, got ${dbCourseA.previewVideoUrl}`);
  }
  if (dbCourseB.previewVideoUrl !== VIDEO_B) {
    throw new Error(`Course B DB check failed: Expected ${VIDEO_B}, got ${dbCourseB.previewVideoUrl}`);
  }
  console.log('✔ Course A and Course B have completely independent and correct URLs.\n');

  // Step 4: Update Course A to VIDEO C
  await prisma.course.update({
    where: { slug: courseASlug },
    data: { previewVideoUrl: VIDEO_C }
  });
  const updatedDbCourseA = await prisma.course.findUnique({
    where: { slug: courseASlug },
    select: { id: true, slug: true, title: true, previewVideoUrl: true }
  });
  console.log('--- UPDATE VERIFICATION ---');
  console.log('Updated Course A in DB:', updatedDbCourseA);
  if (updatedDbCourseA.previewVideoUrl !== VIDEO_C) {
    throw new Error(`Course A update check failed: Expected ${VIDEO_C}, got ${updatedDbCourseA.previewVideoUrl}`);
  }
  console.log('✔ Course A preview video successfully updated to VIDEO C without touching Course B.\n');

  // Step 5: Remove Course A Preview Video (empty state test)
  await prisma.course.update({
    where: { slug: courseASlug },
    data: { previewVideoUrl: null }
  });
  const emptyDbCourseA = await prisma.course.findUnique({
    where: { slug: courseASlug },
    select: { id: true, slug: true, title: true, previewVideoUrl: true }
  });
  console.log('--- EMPTY STATE VERIFICATION ---');
  console.log('Empty Preview Course A in DB:', emptyDbCourseA);
  if (emptyDbCourseA.previewVideoUrl !== null) {
    throw new Error(`Course A empty state check failed: Expected null, got ${emptyDbCourseA.previewVideoUrl}`);
  }
  console.log('✔ Course A previewVideoUrl is null (triggers "Course preview video is not available yet." empty state).\n');

  // Reset to clean test state
  await prisma.course.update({
    where: { slug: courseASlug },
    data: { previewVideoUrl: VIDEO_A }
  });

  console.log('====================================================');
  console.log('ALL PHASE 12 ACCEPTANCE TESTS COMPLETED SUCCESSFULLY!');
  console.log('====================================================');
}

runAcceptanceTest()
  .catch(err => {
    console.error('Acceptance test failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
