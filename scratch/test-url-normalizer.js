function normalizeUrl(req) {
  let url = req.url || '/';
  const rawPath = url.split('?')[0];
  const query = url.includes('?') ? url.substring(url.indexOf('?')) : '';

  // If Vercel rewrote /api/(.*) or /uploads/(.*) to /api or /
  const matchedPath = req.headers['x-matched-path'] || 
                      req.headers['x-vercel-matched-path'] || 
                      req.headers['x-forwarded-uri'] || 
                      req.headers['x-real-url'];

  if (matchedPath && (rawPath === '/api' || rawPath === '/api/' || rawPath === '/' || rawPath === '/index' || rawPath === '/index.ts')) {
    const matchedQueryIndex = matchedPath.indexOf('?');
    const cleanMatchedPath = matchedQueryIndex !== -1 ? matchedPath.substring(0, matchedQueryIndex) : matchedPath;
    const finalQuery = query || (matchedQueryIndex !== -1 ? matchedPath.substring(matchedQueryIndex) : '');
    url = cleanMatchedPath + finalQuery;
  } else if ((rawPath === '/api' || rawPath === '/api/' || rawPath === '/') && req.headers['x-now-route-matches']) {
    try {
      const params = new URLSearchParams(req.headers['x-now-route-matches']);
      const subpath = params.get('1');
      if (subpath) {
        url = '/api/' + subpath.replace(/^\/+/, '') + query;
      }
    } catch {}
  }

  // Normalize duplicate /api/api
  if (url.startsWith('/api/api')) {
    url = url.replace(/^\/api\/api/, '/api');
  }

  // Ensure leading /api for all API routes (except uploads)
  if (!url.startsWith('/api') && !url.startsWith('/uploads')) {
    url = '/api' + (url.startsWith('/') ? url : '/' + url);
  }

  return url;
}

const testCases = [
  { name: 'Localhost standard', req: { url: '/api/auth/login', headers: {} }, expected: '/api/auth/login' },
  { name: 'Localhost without /api', req: { url: '/auth/login', headers: {} }, expected: '/api/auth/login' },
  { name: 'Vercel x-matched-path', req: { url: '/api', headers: { 'x-matched-path': '/api/auth/login' } }, expected: '/api/auth/login' },
  { name: 'Vercel x-matched-path with query', req: { url: '/api?role=student', headers: { 'x-matched-path': '/api/users' } }, expected: '/api/users?role=student' },
  { name: 'Vercel x-vercel-matched-path', req: { url: '/api', headers: { 'x-vercel-matched-path': '/api/auth/login' } }, expected: '/api/auth/login' },
  { name: 'Vercel x-now-route-matches', req: { url: '/api', headers: { 'x-now-route-matches': '1=auth%2Flogin' } }, expected: '/api/auth/login' },
  { name: 'Vercel double /api/api', req: { url: '/api/api/auth/login', headers: {} }, expected: '/api/auth/login' },
  { name: 'Uploads path', req: { url: '/uploads/cert-123.png', headers: {} }, expected: '/uploads/cert-123.png' },
  { name: 'Vercel rewritten uploads', req: { url: '/api', headers: { 'x-matched-path': '/uploads/cert-123.png' } }, expected: '/uploads/cert-123.png' },
  { name: 'Health check /api/health', req: { url: '/api/health', headers: {} }, expected: '/api/health' },
  { name: 'Health check /api', req: { url: '/api', headers: {} }, expected: '/api' },
];

let allPassed = true;
for (const tc of testCases) {
  const result = normalizeUrl(tc.req);
  const passed = result === tc.expected;
  console.log(`${passed ? '✅' : '❌'} ${tc.name}: got "${result}", expected "${tc.expected}"`);
  if (!passed) allPassed = false;
}

console.log(`\nResult: ${allPassed ? 'ALL TESTS PASSED!' : 'SOME TESTS FAILED!'}`);
