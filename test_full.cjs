const http = require('http');
const fs = require('fs');

function req(m, p, b, h) {
  return new Promise((r) => {
    const o = {
      hostname: '127.0.0.1', port: 8787, path: p, method: m,
      headers: Object.assign({ 'Content-Type': 'application/json' }, h || {})
    };
    const q = http.request(o, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { r({ s: res.statusCode, b: JSON.parse(d) }); } catch { r({ s: res.statusCode, b: d }); } });
    });
    q.on('error', e => { r({ s: 0, b: e.message }); });
    if (b) q.write(JSON.stringify(b));
    q.end();
  });
}

async function main() {
  const email = 'u' + Date.now() + '@x.com';
  console.log('1. REGISTER');
  let r = await req('POST', '/api/auth/register', { email, password: 'test123', name: 'Dev User' });
  console.log('   Status:', r.s);
  console.log('   Body:', JSON.stringify(r.b, null, 2).substring(0, 500));
  if (r.s !== 200) return;

  const token = r.b.session.token;

  console.log('\n2. LOGIN');
  r = await req('POST', '/api/auth/login', { email, password: 'test123' });
  console.log('   Status:', r.s);
  console.log('   Body:', JSON.stringify(r.b, null, 2).substring(0, 500));
  if (r.s !== 200) return;

  console.log('\n3. SESSION');
  r = await req('GET', '/api/auth/session', null, { Authorization: 'Bearer ' + token });
  console.log('   Status:', r.s);
  console.log('   Body:', JSON.stringify(r.b, null, 2).substring(0, 500));

  console.log('\n4. AI OPTIMIZE');
  const testData = JSON.parse(fs.readFileSync('test-ai.json', 'utf-8'));
  r = await req('POST', '/api/ai/optimize', {
    resumeText: testData.resume_text,
    jobDescription: testData.job_description,
    model: 'deepseek-chat'
  }, { Authorization: 'Bearer ' + token });
  console.log('   Status:', r.s);
  if (r.s === 200) {
    const result = r.b.result || '';
    console.log('   Result length:', result.length, 'chars');
    console.log('   Preview:', result.substring(0, 800));
    // Save full result
    fs.writeFileSync('test-result.txt', result, 'utf-8');
    console.log('\nFull result saved to test-result.txt');
  } else {
    console.log('   Error:', JSON.stringify(r.b, null, 2).substring(0, 800));
  }
}

main().catch(e => console.error('FATAL:', e));
