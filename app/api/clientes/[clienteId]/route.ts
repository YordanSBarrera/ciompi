import { connectDB } from '@/app/db/dbConnection';
import { RouteParams } from '@/app/lib/types';
import Cliente from '@/app/models/cliente';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    connectDB();
    const clienteEncontrado = await Cliente.findById(params.clienteId);

    if (!clienteEncontrado) {
      return NextResponse.json(
        { message: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(clienteEncontrado);
  } catch (error: any) {
    return NextResponse.json(error.message, { status: 404 });
  }
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

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const data = await request.json();
    const clienteUpdated = await Cliente.findByIdAndUpdate(
      params.clienteId,
      data,
      { new: true }
    );
    return NextResponse.json(clienteUpdated);
  } catch (error: any) {
    return NextResponse.json(error.message, { status: 404 });
  }
}
