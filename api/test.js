export default function handler(req) {
  return Response.json({ 
    message: 'OK!',
    timestamp: new Date().toISOString()
  });
}

export const dynamic = 'force-dynamic';