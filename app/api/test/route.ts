import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({
      message: 'POST funcionando correctamente',
      received: body,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Error procesando POST',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 400 }
    );
  }
}
