// Simple health check endpoint
export async function onRequest(context: any) {
  return new Response(JSON.stringify({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: context.env?.NODE_ENV || 'production',
    platform: 'Cloudflare Pages Functions',
    bindings: {
      hasDB: !!context.env.DB,
      hasR2: !!context.env.RESUME_BUCKET,
    }
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

