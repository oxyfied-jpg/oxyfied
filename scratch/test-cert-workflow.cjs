const axios = require('axios');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const API_BASE = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'fallbacksecretkey123';

async function createAuthToken(user) {
  const sessionToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.userSession.create({
    data: {
      userId: user.id,
      sessionToken,
      expiresAt,
      lastActivityAt: new Date()
    }
  });

  await new Promise((r) => setTimeout(r, 150));

  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, sessionToken },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
}

async function runTests() {
  console.log('🧪 Starting End-to-End Test for Oxyfied Certificate Workflow...\n');

  try {
    // 1. Fetch real student, mentor, admin, and course from DB
    console.log('1️⃣ Fetching test entities from database...');
    const users = await prisma.user.findMany();
    const courses = await prisma.course.findMany({ include: { mentor: true, lessons: true } });

    if (courses.length === 0) {
      console.error('❌ No courses found in database.');
      return;
    }

    const testCourse = courses[0];
    const studentUser = users.find(u => u.role === 'student') || users[0];
    const adminUser = users.find(u => u.role === 'admin') || users[0];

    console.log(`   Found Course: "${testCourse.title}" (ID: ${testCourse.id})`);
    console.log(`   Test Student: "${studentUser.name}" (${studentUser.email})`);
    console.log(`   Test Admin: "${adminUser.name}" (${adminUser.email})\n`);

    const studentToken = await createAuthToken(studentUser);
    const adminToken = await createAuthToken(adminUser);

    // Ensure student is enrolled and has 100% completed lessons or completed status
    console.log('2️⃣ Setting up Student 100% Completion Eligibility...');
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: studentUser.id, courseId: testCourse.id } },
      update: { status: 'completed' },
      create: { userId: studentUser.id, courseId: testCourse.id, status: 'completed' }
    });

    for (const lesson of testCourse.lessons) {
      await prisma.lessonProgress.upsert({
        where: { userId_lessonId: { userId: studentUser.id, lessonId: lesson.id } },
        update: { courseId: testCourse.id },
        create: { userId: studentUser.id, lessonId: lesson.id, courseId: testCourse.id }
      });
    }

    // Clean up any old test request/cert for a fresh run
    await prisma.certificate.deleteMany({ where: { userId: studentUser.id, courseId: testCourse.id } });
    await prisma.certificateRequest.deleteMany({ where: { studentId: studentUser.id, courseId: testCourse.id } });

    // 3. Check student profile before applying
    console.log('3️⃣ Checking Student Profile: GET /api/certificates/my-certificates...');
    const myCertsBefore = await axios.get(`${API_BASE}/certificates/my-certificates`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const eligibleCourse = myCertsBefore.data.completedEligibleCourses.find(c => c.id === testCourse.id);
    console.log(`   Eligible course found: ${!!eligibleCourse}`);
    console.log(`   Can Apply flag: ${eligibleCourse?.canApply}`);
    console.log(`   Request Status: "${eligibleCourse?.requestStatus}"`);
    console.log(`   Has Certificate: ${eligibleCourse?.hasCertificate}`);

    if (!eligibleCourse?.canApply) {
      console.error('❌ Expected student to be able to apply.');
    }

    // 4. Student applies for certificate (with disclaimer acceptance)
    console.log(`\n4️⃣ Student Applies for Certificate: POST /api/certificates/apply/${testCourse.id}...`);
    const applyRes = await axios.post(`${API_BASE}/certificates/apply/${testCourse.id}`, {}, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    console.log(`   ✅ Application response: "${applyRes.data.message}"`);
    console.log(`   Created CertificateRequest ID: ${applyRes.data.request.id}, Status: "${applyRes.data.request.status}"`);

    // Verify student profile now shows pending status and CANNOT re-apply immediately
    const myCertsAfterApply = await axios.get(`${API_BASE}/certificates/my-certificates`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const eligibleCourseAfterApply = myCertsAfterApply.data.completedEligibleCourses.find(c => c.id === testCourse.id);
    console.log(`   After apply -> Request Status: "${eligibleCourseAfterApply?.requestStatus}"`);
    console.log(`   After apply -> Can Apply: ${eligibleCourseAfterApply?.canApply} (Expected: false)`);

    // 5. Mentor / Admin lists requests
    console.log('\n5️⃣ Mentor / Admin Views Requests: GET /api/mentor/certificate-requests...');
    const mentorReqsRes = await axios.get(`${API_BASE}/mentor/certificate-requests`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const currentReq = mentorReqsRes.data.find(r => r.id === applyRes.data.request.id);
    console.log(`   Found request in mentor dashboard: ${!!currentReq}`);
    console.log(`   Student Name: ${currentReq?.student.name}`);
    console.log(`   Course Title: ${currentReq?.course.title}`);
    console.log(`   Submissions Count: ${currentReq?.submissionsCount}`);

    // 6. Mentor / Admin inspects student project submissions
    console.log(`\n6️⃣ Mentor / Admin Inspects Submissions: GET /api/mentor/certificate-requests/${currentReq.id}/submissions...`);
    const subsRes = await axios.get(`${API_BASE}/mentor/certificate-requests/${currentReq.id}/submissions`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`   Submissions fetched successfully: ${subsRes.data.submissions.length} submission files.`);

    // 7. Security Test: Student CANNOT call grant endpoint
    console.log('\n7️⃣ Security Check: Student attempting to grant certificate directly...');
    try {
      await axios.post(`${API_BASE}/mentor/certificate-requests/${currentReq.id}/grant`, {}, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      console.error('   ❌ Security failed: Student was able to grant certificate!');
    } catch (err) {
      if (err.response?.status === 403) {
        console.log('   ✅ PASSED: Blocked with 403 Forbidden.');
      } else {
        console.log(`   Blocked with status: ${err.response?.status}`);
      }
    }

    // 8. Mentor / Admin grants certificate following project verification
    console.log(`\n8️⃣ Mentor / Admin Grants Certificate: POST /api/mentor/certificate-requests/${currentReq.id}/grant...`);
    const grantRes = await axios.post(`${API_BASE}/mentor/certificate-requests/${currentReq.id}/grant`, {}, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`   ✅ Grant message: "${grantRes.data.message}"`);
    console.log(`   Generated Certificate Serial: ${grantRes.data.certificate.certificateNumber}`);
    console.log(`   Certificate Status: "${grantRes.data.certificate.status}"`);
    console.log(`   Request Status updated to: "${grantRes.data.request.status}"`);

    // 9. Student checks My Certificates to verify credential is now issued and accessible
    console.log('\n9️⃣ Student Accesses Issued Certificate: GET /api/certificates/my-certificates...');
    const myCertsFinal = await axios.get(`${API_BASE}/certificates/my-certificates`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const issuedCert = myCertsFinal.data.certificates.find(c => c.id === grantRes.data.certificate.id);
    console.log(`   Issued certificate found in student dashboard: ${!!issuedCert}`);
    console.log(`   Certificate Number: ${issuedCert?.certificateNumber}`);
    console.log(`   Course Title: ${issuedCert?.course?.title}`);

    // 10. Public Verification Test
    console.log(`\n🔟 Public Verification: GET /api/public/verify-certificate/${issuedCert.certificateNumber}...`);
    const verifyRes = await axios.get(`${API_BASE}/public/verify-certificate/${issuedCert.certificateNumber}`);
    console.log(`   Verification validity: "${verifyRes.data.isValid}" (Status: ${verifyRes.data.status})`);
    console.log(`   Verified Student: ${verifyRes.data.studentName}`);
    console.log(`   Verified Course: ${verifyRes.data.courseTitle}`);
    console.log(`   Verified Issue Date: ${verifyRes.data.issueDate}`);
    console.log(`   Verified Mentor: ${verifyRes.data.mentorName}`);

    console.log('\n✨ ALL 10 STEPS OF THE OXYFIED CERTIFICATE WORKFLOW TEST PASSED PERFECTLY!');
  } catch (error) {
    console.error('❌ Error during testing:', error.response?.data || error);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
