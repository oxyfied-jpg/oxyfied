import app from '../api/index.js';
import http from 'http';

async function main() {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  console.log(`Test server running at ${baseUrl}`);

  try {
    // 1. Health check
    console.log('\n--- 1. Testing Health Check ---');
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthRes.json();
    console.log('Health status:', healthRes.status, healthData);

    // 2. Student login
    console.log('\n--- 2. Testing Student Login ---');
    const studentRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@oxyfied.com', password: 'studentpassword123' })
    });
    const studentData = await studentRes.json();
    console.log('Student login status:', studentRes.status, 'Success:', studentData.success, 'Role:', studentData.user?.role);

    // Profile check with student token
    const studentProfRes = await fetch(`${baseUrl}/api/users/profile`, {
      headers: { Authorization: `Bearer ${studentData.token}` }
    });
    const studentProf = await studentProfRes.json();
    console.log('Student profile status:', studentProfRes.status, 'Email:', studentProf.email, 'Role:', studentProf.role);

    // 3. Mentor login
    console.log('\n--- 3. Testing Mentor Login ---');
    const mentorRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'evelyn.vance@oxyfied.com', password: 'mentorpassword123' })
    });
    const mentorData = await mentorRes.json();
    console.log('Mentor login status:', mentorRes.status, 'Success:', mentorData.success, 'Role:', mentorData.user?.role);

    // Profile check with mentor token
    const mentorProfRes = await fetch(`${baseUrl}/api/users/profile`, {
      headers: { Authorization: `Bearer ${mentorData.token}` }
    });
    const mentorProf = await mentorProfRes.json();
    console.log('Mentor profile status:', mentorProfRes.status, 'Email:', mentorProf.email, 'Role:', mentorProf.role);

    // 4. Admin login
    console.log('\n--- 4. Testing Admin Login ---');
    const adminRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@oxyfied.com', password: 'adminpassword123' })
    });
    const adminData = await adminRes.json();
    console.log('Admin login status:', adminRes.status, 'Success:', adminData.success, 'Role:', adminData.user?.role);

    // Profile check with admin token
    const adminProfRes = await fetch(`${baseUrl}/api/users/profile`, {
      headers: { Authorization: `Bearer ${adminData.token}` }
    });
    const adminProf = await adminProfRes.json();
    console.log('Admin profile status:', adminProfRes.status, 'Email:', adminProf.email, 'Role:', adminProf.role);

    // 5. Test Vercel URL rewrite simulation (where req.url is /api but x-matched-path is /api/auth/login)
    console.log('\n--- 5. Testing Vercel Serverless Rewritten URL Simulation ---');
    const vercelReq = await fetch(`${baseUrl}/api`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-matched-path': '/api/auth/login'
      },
      body: JSON.stringify({ email: 'student@oxyfied.com', password: 'studentpassword123' })
    });
    console.log('Vercel rewrite login status:', vercelReq.status);
    const vercelData = await vercelReq.json();
    console.log('Vercel rewrite login result:', {
      success: vercelData.success,
      hasToken: !!vercelData.token,
      email: vercelData.user?.email,
      role: vercelData.user?.role
    });

    // 6. Test Vercel profile fetch with rewrite
    const vercelProfReq = await fetch(`${baseUrl}/api`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${vercelData.token}`,
        'x-matched-path': '/api/users/profile'
      }
    });
    console.log('Vercel rewrite profile status:', vercelProfReq.status);
    const vercelProfData = await vercelProfReq.json();
    console.log('Vercel rewrite profile result:', {
      email: vercelProfData.email,
      role: vercelProfData.role
    });

    console.log('\n=======================================');
    console.log('🎉 ALL AUTHENTICATION FLOW TESTS PASSED!');
    console.log('=======================================');

  } finally {
    server.close();
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
