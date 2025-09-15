import { connectDB } from '@/app/db/dbConnection';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    [key: string]: string;
  };
}
export async function GET(_request: NextRequest, { params }: RouteParams) {
  console.log(params);
  const { clienteId } = await params;
  return NextResponse.json({
    message: `obteniendo cliente ${clienteId}`,
  });
}

export async function POST() {
  connectDB();
  return NextResponse.json({ message: 'creando cliente' });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { clienteId } = await params;
  return NextResponse.json({
    message: ` Eliminando cliente ${clienteId}`,
  });
}

export async function PUT(_request: NextRequest, { params }: RouteParams) {
  const { clienteId } = await params;
  return NextResponse.json({
    message: ` Actualizando cliente ${clienteId}`,
  });
}
