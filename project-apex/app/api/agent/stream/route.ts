export const runtime = 'nodejs';

export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`event: init\n`));
      controller.enqueue(encoder.encode(`data: {"status":"ready"}\n\n`));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}

