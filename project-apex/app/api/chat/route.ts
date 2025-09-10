export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return Response.json({ status: 'ok', message: 'chat stub', echo: body ?? null });
}

