const base = 'http://localhost:3001';

async function test() {
  try {
    // 1. Health check
    console.log('Testing health...');
    let res = await fetch(`${base}/health`);
    console.log('Health:', res.status, await res.text());

    // 2. Seed
    console.log('\nSeeding...');
    res = await fetch(`${base}/api/auth/seed-defaults?force=true`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('Seed:', res.status);
    const seedData = await res.json();
    console.log('Seed body:', JSON.stringify(seedData, null, 2));

    // 3. Login as user
    console.log('\nLogging in as user...');
    res = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user1@example.com', password: 'Password123!' })
    });
    console.log('User login:', res.status);
    const userLoginData = await res.json();
    const userToken = userLoginData.token;
    console.log('User token:', userToken);

    // 4. Create request
    console.log('\nCreating request...');
    res = await fetch(`${base}/api/requests`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        title: 'Test Request',
        description: 'Test',
        category: 'General',
        department: 'Electricity',
        priority: 'medium'
      })
    });
    console.log('Create:', res.status);
    const createData = await res.json();
    const requestId = createData.id || createData._id;
    console.log('Request ID:', requestId);

    // 5. Login as admin
    console.log('\nLogging in as admin...');
    res = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin1@example.com', password: 'Password123!' })
    });
    console.log('Admin login:', res.status);
    const adminLoginData = await res.json();
    const adminToken = adminLoginData.token;
    console.log('Admin token:', adminToken);

    // 6. Update status to in_progress
    console.log('\nUpdating status to in_progress...');
    res = await fetch(`${base}/api/requests/${requestId}/status`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'in_progress', message: 'Starting work' })
    });
    console.log('Status update (in_progress):', res.status);
    const statusText = await res.text();
    console.log('Response body:', statusText);

    // 7. Update status to completed
    console.log('\nUpdating status to completed...');
    res = await fetch(`${base}/api/requests/${requestId}/status`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'completed', message: 'Work completed' })
    });
    console.log('Status update (completed):', res.status);
    const completedText = await res.text();
    console.log('Response body:', completedText);

    process.exit(0);
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
}

test();
