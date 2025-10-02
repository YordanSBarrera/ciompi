import { connectDB } from '@/db/dbConnection';
import { RouteParams } from '@/lib/types';
import Cliente from '@/models/cliente';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    connectDB();
    const { id } = await params;
    const clienteEncontrado = await Cliente.findById(id);

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  connectDB();
  try {
    const { id } = await params;
    const clienteBorrado = await Cliente.findByIdAndDelete(id);

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

// export async function PUT(request: NextRequest, { params }: RouteParams) {
//   try {
//     const data = await request.json();
//     const clienteUpdated = await Cliente.findByIdAndUpdate(params.id, data, {
//       new: true,
//     });
//     return NextResponse.json(clienteUpdated);
//   } catch (error: any) {
//     return NextResponse.json(error.message, { status: 404 });
//   }
// }

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const data = await request.json();

    const { id } = await params;
    const clienteUpdated = await Cliente.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!clienteUpdated) {
      return NextResponse.json(
        { message: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(clienteUpdated);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
