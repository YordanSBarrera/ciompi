import { connectDB } from '@/app/db/dbConnection';
import { RouteParams } from '@/app/lib/types';
import Cliente from '@/app/models/cliente';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    connectDB();
    const { clienteId } = params;
    const clienteEncontrado = await Cliente.findById(params.clienteId);
    console.log('ID ', clienteId, params);

    if (!clienteEncontrado) {
      return NextResponse.json(
        { message: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(clienteEncontrado);
  } catch (error) {}
}

export async function POST(request: Request) {
  const data = await request.json();
  const newClient = new Cliente(data);
  console.log(newClient);
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
