// Simple test endpoint to verify upload route is working
export async function onRequest(context: any) {
  return new Response(JSON.stringify({
    message: 'Upload route is working!',
    path: '/api/upload/test',
  }), {
    status: 200,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

