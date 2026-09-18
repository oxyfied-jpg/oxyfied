import axios from 'axios';

async function test() {
  try {
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@oxyfied.com',
      password: 'adminpassword123'
    });

    console.log('Login successful:', loginRes.data.user.email, 'Role:', loginRes.data.user.role);
    const token = loginRes.data.token;

    const headers = { Authorization: `Bearer ${token}` };

    const actRes = await axios.get('http://localhost:5000/api/admin/login-activity', { headers });
    console.log('Activities count:', actRes.data.activities.length, 'Total:', actRes.data.total);

    const statsRes = await axios.get('http://localhost:5000/api/admin/login-activity/stats', { headers });
    console.log('Stats:', statsRes.data);

    const userOverviewRes = await axios.get(`http://localhost:5000/api/admin/login-activity/user/${loginRes.data.user.id}`, { headers });
    console.log('User Overview for Admin:', {
      totalLogins: userOverviewRes.data.totalLogins,
      successful: userOverviewRes.data.successfulLogins,
      activeSessions: userOverviewRes.data.activeSessions.length
    });
  } catch (err) {
    console.error('API Test error:', err.response?.data || err.message);
  }
}

test();
