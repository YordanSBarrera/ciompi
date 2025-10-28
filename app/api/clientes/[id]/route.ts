import { connectDB } from '@/db/dbConnection';
import { RouteParams } from '@/lib/types';
import { getUserIdFromToken } from '@/lib/server-utils';
import Cliente from '@/models/cliente';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const clienteEncontrado = await Cliente.findById(id)
      .populate('usuarioCreacion', 'nombre usuario email')
      .populate('usuarioModificacion', 'nombre usuario email');

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

    // Obtener ID del usuario desde el token con fallback
    console.log('getUserIdFromToken', getUserIdFromToken(request));
    const userId = getUserIdFromToken(request);

    // Agregar usuario de modificación
    const updateData = {
      ...data,
      usuarioModificacion: userId, // ID del usuario que modifica el cliente
    };

    const clienteUpdated = await Cliente.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!clienteUpdated) {
      return NextResponse.json(
        { message: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    await clienteUpdated.populate('usuarioCreacion', 'nombre usuario email');
    await clienteUpdated.populate(
      'usuarioModificacion',
      'nombre usuario email'
    );

    return NextResponse.json(clienteUpdated);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
