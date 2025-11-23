(async () => {
  const base = 'http://localhost:3001';
  const log = (title, obj) => console.log('\n=== ' + title + ' ===\n', typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2));
  try {
    const h = await (await fetch(base + '/health')).text();
    log('health', h);

    const seedRes = await fetch(base + '/api/auth/seed-defaults', { method: 'POST' });
    const seedBody = await seedRes.json().catch(() => null);
    log('seed-defaults status', { status: seedRes.status, body: seedBody });

    // Login as user1
    const userLogin = await fetch(base + '/api/auth/login', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ email: 'user1@example.com', password: 'Password123!' }) });
    const userBody = await userLogin.json();
    log('user1 login', { status: userLogin.status, body: userBody });
    const userToken = userBody.token;

    // Create a request as user1
    const createReq = await fetch(base + '/api/requests', { method: 'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${userToken}` }, body: JSON.stringify({ title: 'Test issue', description: 'This is a test issue created by smoke script', department: 'Electricity', priority: 'medium' }) });
    const createBody = await createReq.json();
    log('create request', { status: createReq.status, body: createBody });
    const requestId = createBody.id || (createBody.data && createBody.data.id) || createBody._id || (createBody.data && createBody.data._id);

    // Login as admin1
    const adminLogin = await fetch(base + '/api/auth/login', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ email: 'admin1@example.com', password: 'Password123!' }) });
    const adminBody = await adminLogin.json();
    log('admin1 login', { status: adminLogin.status, body: adminBody });
    const adminToken = adminBody.token;

    if (!requestId) {
      log('skip','No request id returned, cannot continue admin actions');
      return;
    }

    // Admin set status to in_progress
    const status1 = await fetch(base + `/api/requests/${requestId}/status`, { method: 'PUT', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${adminToken}` }, body: JSON.stringify({ status: 'in_progress', message: 'Starting work' }) });
    log('admin set in_progress', await status1.json().catch(()=>null));

    // Admin set status to completed
    const status2 = await fetch(base + `/api/requests/${requestId}/status`, { method: 'PUT', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${adminToken}` }, body: JSON.stringify({ status: 'completed', message: 'Work completed' }) });
    log('admin set completed', await status2.json().catch(()=>null));

    // User rate the request
    const rate = await fetch(base + `/api/requests/${requestId}/rate`, { method: 'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${userToken}` }, body: JSON.stringify({ rating: 'excellent', comments: 'Great work!' }) });
    log('user rate', await rate.json().catch(()=>null));

    // User request change
    const change = await fetch(base + `/api/requests/${requestId}/request-change`, { method: 'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${userToken}` }, body: JSON.stringify({ message: 'Please update the description to include extra details.' }) });
    const changeBody = await change.json();
    log('user request change', { status: change.status, body: changeBody });
    const changeId = changeBody.data && changeBody.data.id ? changeBody.data.id : changeBody.id;

    // Admin approve change
    if (changeId) {
      const approve = await fetch(base + `/api/requests/${requestId}/change/${changeId}/approve`, { method: 'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${adminToken}` }, body: JSON.stringify({ approve: true, adminResponse: 'Approved. You can edit now.' }) });
      log('admin approve change', await approve.json().catch(()=>null));
    } else {
      log('skip','no changeId');
    }

    log('done','Smoke tests complete');
  } catch (err) {
    console.error('Smoke script error', err);
  }
})();
