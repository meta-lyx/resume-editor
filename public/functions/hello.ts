// Simple test function
export async function onRequest(context: any) {
  return new Response(JSON.stringify({
    message: 'Hello from Cloudflare Pages Functions!',
    timestamp: new Date().toISOString(),
    env: {
      hasDB: !!context.env.DB,
      hasR2: !!context.env.RESUME_BUCKET,
    }
  }), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

