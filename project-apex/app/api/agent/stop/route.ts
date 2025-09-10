export const runtime = 'nodejs';

export async function POST(req: Request) {
  // Stub: terminate an agent session (to be implemented)
  return Response.json({ status: 'ok', message: 'agent stop stub' });
}

