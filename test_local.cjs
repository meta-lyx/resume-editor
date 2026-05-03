// Test script that creates a user record directly with the local D1
// and then tests the AI optimization endpoint
const http = require('http');

const BASE = 'http://127.0.0.1:8787';

async function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: '127.0.0.1',
      port: 8787,
      path,
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  // 1. Try register
  console.log('1. Registering user...');
  const reg = await request('POST', '/api/auth/register', {
    email: 'test@test.com',
    password: 'test123',
    name: 'Test User'
  });
  console.log(`   Status: ${reg.status}`, reg.body);

  if (reg.status !== 200) {
    console.log('\nRegister failed. Trying to find the issue...');
    
    // 2. Test health endpoint
    const health = await request('GET', '/api/ai/health');
    console.log('   /api/ai/health:', health.status, JSON.stringify(health.body));
    
    // 3. Test root
    const root = await request('GET', '/');
    console.log('   GET /:', root.status);
  }
}

main().catch(console.error);
