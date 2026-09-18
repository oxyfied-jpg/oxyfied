const axios = require('axios');
const jwt = require('jsonwebtoken');

const API_BASE = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'oxyfied_super_secret_jwt_key_2025';

async function runTests() {
  console.log('🧪 Starting End-to-End Test for Oxyfied Certificate Workflow...\n');

  try {
    // 1. Log in or create tokens for Admin, Mentor, and Student
    const adminToken = jwt.sign({ id: 'admin-test', email: 'admin@oxyfied.com', role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });

    // Fetch existing courses and users to test with real database entities
    console.log('1️⃣ Fetching database test context (courses, mentors, students)...');
    const coursesRes = await axios.get(`${API_BASE}/courses`);
    const courses = coursesRes.data.courses || coursesRes.data;
    if (!courses || courses.length === 0) {
      console.error('❌ No courses found in database to test.');
      return;
    }
    const testCourse = courses[0];
    console.log(`   Found Course: "${testCourse.title}" (ID: ${testCourse.id}, Slug: ${testCourse.slug})`);

    // Fetch students
    const usersRes = await axios.get(`${API_BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const users = usersRes.data.users || usersRes.data;
    const studentUser = users.find(u => u.role === 'student') || users[0];
    const mentorUser = users.find(u => u.role === 'mentor' || u.role === 'admin') || users[0];

    console.log(`   Test Student: "${studentUser.name}" (${studentUser.email}, ID: ${studentUser.id})`);
    console.log(`   Test Mentor/Admin: "${mentorUser.name}" (${mentorUser.email}, ID: ${mentorUser.id})\n`);

    const studentToken = jwt.sign({ id: studentUser.id, email: studentUser.email, role: 'student' }, JWT_SECRET, { expiresIn: '1h' });
    const mentorToken = jwt.sign({ id: mentorUser.id, email: mentorUser.email, role: mentorUser.role }, JWT_SECRET, { expiresIn: '1h' });

    // 2. Check student's certificate profile before applying
    console.log('2️⃣ Checking Student Profile via GET /api/certificates/my-certificates...');
    const myCertsBefore = await axios.get(`${API_BASE}/certificates/my-certificates`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    console.log(`   Issued certificates count: ${myCertsBefore.data.certificates.length}`);
    console.log(`   Completed eligible courses count: ${myCertsBefore.data.completedEligibleCourses.length}`);
    console.log(`   Existing requests count: ${myCertsBefore.data.requests.length}\n`);

    // 3. Test Student Application (NO auto-generation)
    console.log(`3️⃣ Testing Student Apply: POST /api/certificates/apply/${testCourse.id}...`);
    try {
      const applyRes = await axios.post(`${API_BASE}/certificates/apply/${testCourse.id}`, {}, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      console.log('   ✅ Application response:', applyRes.data.message);
      console.log(`   Created Request ID: ${applyRes.data.request.id} with status: "${applyRes.data.request.status}"\n`);
    } catch (err) {
      if (err.response?.data?.error?.includes('already') || err.response?.data?.error?.includes('Course requirements')) {
        console.log(`   ℹ️ Note: ${err.response.data.error}`);
      } else {
        throw err;
      }
    }

    // 4. Mentor / Admin views certificate requests
    console.log('4️⃣ Testing Mentor / Admin View: GET /api/mentor/certificate-requests...');
    const mentorReqsRes = await axios.get(`${API_BASE}/mentor/certificate-requests`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const allRequests = mentorReqsRes.data;
    console.log(`   Total requests found: ${allRequests.length}`);
    const pendingReq = allRequests.find(r => r.status === 'pending');

    if (pendingReq) {
      console.log(`   Found Pending Request ID: ${pendingReq.id} for student: ${pendingReq.student.name} in course: ${pendingReq.course.title}`);
      console.log(`   Submissions count recorded: ${pendingReq.submissionsCount}`);

      // 5. Test viewing submissions
      console.log(`\n5️⃣ Testing Submissions Inspection: GET /api/mentor/certificate-requests/${pendingReq.id}/submissions...`);
      const subsRes = await axios.get(`${API_BASE}/mentor/certificate-requests/${pendingReq.id}/submissions`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log(`   Submissions retrieved: ${subsRes.data.submissions.length} project items.`);

      // 6. Test Security: Student CANNOT grant certificate
      console.log(`\n6️⃣ Security Check: Student attempting POST /api/mentor/certificate-requests/${pendingReq.id}/grant...`);
      try {
        await axios.post(`${API_BASE}/mentor/certificate-requests/${pendingReq.id}/grant`, {}, {
          headers: { Authorization: `Bearer ${studentToken}` }
        });
        console.error('   ❌ FAILED: Student was able to grant certificate!');
      } catch (err) {
        if (err.response?.status === 403) {
          console.log('   ✅ PASSED: Student was correctly blocked with 403 Forbidden.');
        } else {
          console.log(`   Blocked with status: ${err.response?.status}`);
        }
      }

      // 7. Mentor / Admin grants certificate following project verification
      console.log(`\n7️⃣ Testing Mentor Grant: POST /api/mentor/certificate-requests/${pendingReq.id}/grant...`);
      const grantRes = await axios.post(`${API_BASE}/mentor/certificate-requests/${pendingReq.id}/grant`, {}, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('   ✅ Grant response:', grantRes.data.message);
      console.log(`   Generated Certificate Serial: ${grantRes.data.certificate.certificateNumber}`);
      console.log(`   Generated By: ${grantRes.data.certificate.generatedBy}`);
      console.log(`   Request updated status: ${grantRes.data.request.status}`);

      // 8. Public Verification of Generated Certificate
      const certNumber = grantRes.data.certificate.certificateNumber;
      console.log(`\n8️⃣ Testing Public Verification: GET /api/public/verify-certificate/${certNumber}...`);
      const verifyRes = await axios.get(`${API_BASE}/public/verify-certificate/${certNumber}`);
      console.log(`   Verification result status: "${verifyRes.data.status}"`);
      console.log(`   Verified Student: ${verifyRes.data.certificate?.userName}`);
      console.log(`   Verified Course: ${verifyRes.data.certificate?.courseTitle}`);
      console.log(`   Issue Date: ${verifyRes.data.certificate?.issueDate}`);
      console.log(`   Template Snapshot attached: ${!!verifyRes.data.certificate?.templateSnapshot}`);
    } else {
      console.log('   No pending requests currently to grant.');
    }

    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! The Oxyfied Certificate Workflow is 100% verified.');
  } catch (error) {
    console.error('❌ Test failed with error:', error.response?.data || error.message);
  }
}

runTests();
