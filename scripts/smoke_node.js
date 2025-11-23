const fs = require('fs');
const base = 'http://localhost:3001';
const outFile = 'c:\\Users\\piyu4\\OneDrive\\Desktop\\Epics\\scripts\\smoke_node_output.json';

async function safeFetch(method, url, body = null, token = null) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
    const text = await res.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null } catch (e) { json = text }
    return { ok: res.ok, status: res.status, body: json };
  } catch (err) {
    return { ok: false, status: 0, body: err.message };
  }
}

(async () => {
  const log = [];
  console.log('=== HEARTBEAT ===');
  const health = await safeFetch('GET', `${base}/health`);
  console.log('health', health.status);
  log.push({ step: 'health', result: health });

  console.log('=== SEED DEFAULTS (force=true) ===');
  const seed = await safeFetch('POST', `${base}/api/auth/seed-defaults?force=true`);
  console.log('seed', seed.status, seed.body);
  log.push({ step: 'seed-defaults', result: seed });

  console.log('=== LOGIN user1@example.com ===');
  const userLogin = await safeFetch('POST', `${base}/api/auth/login`, { email: 'user1@example.com', password: 'Password123!' });
  console.log('userLogin', userLogin.status, userLogin.body);
  log.push({ step: 'user-login', result: userLogin });
  let userToken = null;
  if (userLogin.ok && userLogin.body && userLogin.body.token) userToken = userLogin.body.token;

  console.log('=== CREATE REQUEST as user1 ===');
  const create = await safeFetch('POST', `${base}/api/requests`, { title: 'Smoke Test Request', description: 'Created by smoke script', category: 'General', department: 'Electricity', priority: 'medium' }, userToken);
  console.log('create', create.status, create.body);
  log.push({ step: 'create-request', result: create });
  let requestId = null;
  if (create.ok && create.body) {
    if (create.body.id) requestId = create.body.id;
    else if (create.body._id) requestId = create.body._id;
    else if (create.body.data && create.body.data.id) requestId = create.body.data.id;
  }

  console.log('=== LOGIN admin1@example.com ===');
  const adminLogin = await safeFetch('POST', `${base}/api/auth/login`, { email: 'admin1@example.com', password: 'Password123!' });
  console.log('adminLogin', adminLogin.status, adminLogin.body);
  log.push({ step: 'admin-login', result: adminLogin });
  let adminToken = null;
  if (adminLogin.ok && adminLogin.body && adminLogin.body.token) adminToken = adminLogin.body.token;

  if (!requestId) {
    console.log('No request id created, aborting further admin actions.');
  } else {
    console.log('=== ADMIN set status in_progress ===');
    const status1 = await safeFetch('PUT', `${base}/api/requests/${requestId}/status`, { status: 'in_progress', message: 'Starting work' }, adminToken);
    log.push({ step: 'admin-set-in_progress', result: status1 });
    console.log('status1', status1.status);

    console.log('=== ADMIN set status completed ===');
    const status2 = await safeFetch('PUT', `${base}/api/requests/${requestId}/status`, { status: 'completed', message: 'Work completed' }, adminToken);
    log.push({ step: 'admin-set-completed', result: status2 });
    console.log('status2', status2.status);

    console.log('=== USER rate request ===');
    const rate = await safeFetch('POST', `${base}/api/requests/${requestId}/rate`, { rating: 'excellent', comments: 'Great work' }, userToken);
    log.push({ step: 'user-rate', result: rate });
    console.log('rate', rate.status);

    console.log('=== USER request change ===');
    const change = await safeFetch('POST', `${base}/api/requests/${requestId}/request-change`, { message: 'Please update the details to include location specifics.' }, userToken);
    log.push({ step: 'user-request-change', result: change });
    console.log('change', change.status, change.body);

    let changeId = null;
    if (change.ok && change.body && change.body.data && change.body.data.id) changeId = change.body.data.id;
    else if (change.ok && change.body && change.body.id) changeId = change.body.id;

    if (changeId) {
      console.log('=== ADMIN approve change ===');
      const approve = await safeFetch('POST', `${base}/api/requests/${requestId}/change/${changeId}/approve`, { approve: true, adminResponse: 'Approved for edit' }, adminToken);
      log.push({ step: 'admin-approve-change', result: approve });
      console.log('approve', approve.status);
    } else {
      console.log('No changeId available, skipping approval step.');
    }
  }

  console.log('=== SMOKE COMPLETE ===');
  try { fs.writeFileSync(outFile, JSON.stringify(log, null, 2), 'utf8'); console.log('WROTE_LOG:', outFile); } catch (e) { console.error('FAILED_WRITE_LOG', e.message); }

})().catch(e => { console.error('SMOKE ERROR', e); process.exit(2); });
