// Simple test endpoint to verify D1 is working
export async function onRequest(context: any) {
  try {
    const { env } = context;
    
    // Test 1: Check if D1 exists
    if (!env.DB) {
      return new Response(JSON.stringify({ error: 'DB binding not found' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Test 2: Try to query D1
    const result = await env.DB.prepare('SELECT name FROM sqlite_master WHERE type="table" LIMIT 5').all();
    
    // Test 3: Try to insert and query a user
    const userId = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);
    
    await env.DB.prepare(
      'INSERT INTO users (id, email, name, email_verified, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(userId, 'test@example.com', 'Test', 0, now, now).run();
    
    const users = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).all();
    
    return new Response(JSON.stringify({
      success: true,
      tables: result.results,
      testUser: users.results[0],
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({
      error: error.message,
      stack: error.stack,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

