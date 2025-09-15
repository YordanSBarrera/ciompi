import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    [key: string]: string;
  };
}
export async function GET(request: NextRequest, { params }: RouteParams) {
  console.log(request, params);
  return NextResponse.json({
    message: `obteniendo cliente ${params.clienteId}`,
  });
}

export async function POST() {
  return NextResponse.json({ message: 'creando cliente' });
}

export async function DELETE() {
  return NextResponse.json({ message: 'Eliminando cliente' });
}

export async function PUT() {
  return NextResponse.json({ message: 'Actualizando cliente' });
}
