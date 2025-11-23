(async () => {
  const base = 'http://localhost:3001';
  const fetchOpts = (method, token, body) => ({
    method,
    headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { Authorization: `Bearer ${token}` } : {}),
    body: body ? JSON.stringify(body) : undefined,
  });

  try {
    console.log('Logging in as user1@example.com');
    const loginRes = await fetch(base + '/api/auth/login', fetchOpts('POST', null, { email: 'user1@example.com', password: 'Password123!' }));
    const loginBody = await loginRes.json().catch(() => null);
    console.log('login status', loginRes.status);
    console.log('login body', loginBody);
    const token = loginBody?.token;
    if (!token) {
      console.error('No token received — aborting');
      process.exit(2);
    }

    console.log('\nUsing token to create request');
    const createRes = await fetch(base + '/api/requests', fetchOpts('POST', token, { title: 'Repro Request', description: 'Repro by test-create-request', category: 'General', department: 'Electricity' }));
    const createBody = await createRes.text().catch(() => null);
    console.log('create status', createRes.status);
    console.log('create body', createBody);

    process.exit(0);
  } catch (err) {
    console.error('Error running repro:', err.message || err);
    process.exit(1);
  }
})();
