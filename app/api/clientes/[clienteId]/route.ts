import { connectDB } from '@/app/db/dbConnection';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    [key: string]: string;
  };
}
export async function GET(_request: NextRequest, { params }: RouteParams) {
  console.log(params);
  return NextResponse.json({
    message: `obteniendo cliente ${params.clienteId}`,
  });
}

export async function POST() {
  connectDB();
  return NextResponse.json({ message: 'creando cliente' });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  return NextResponse.json({
    message: ` Eliminando cliente ${params.clienteId}`,
  });
}

export async function PUT(_request: NextRequest, { params }: RouteParams) {
  return NextResponse.json({
    message: ` Actualizando cliente ${params.clienteId}`,
  });
}
