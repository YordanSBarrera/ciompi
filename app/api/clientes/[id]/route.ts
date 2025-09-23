import { connectDB } from '@/db/dbConnection';
import { RouteParams } from '@/lib/types';
import Cliente from '@/models/cliente';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    connectDB();
    const clienteEncontrado = await Cliente.findById(params.id);

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

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  connectDB();
  try {
    const clienteBorrado = await Cliente.findByIdAndDelete(params.id);

    if (!clienteBorrado)
      return NextResponse.json(
        {
          message: 'Client not found',
        },
        {
          status: 404,
        }
      );

    return NextResponse.json(clienteBorrado);
  } catch (error: any) {
    return NextResponse.json(error.message, {
      status: 400,
    });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const data = await request.json();
    const clienteUpdated = await Cliente.findByIdAndUpdate(params.id, data, {
      new: true,
    });
    return NextResponse.json(clienteUpdated);
  } catch (error: any) {
    return NextResponse.json(error.message, { status: 404 });
  }
}
