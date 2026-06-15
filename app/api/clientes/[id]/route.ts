import { connectDB } from '@/db/dbConnection';
import { RouteParams } from '@/lib/types';
import { requireAdminAuth } from '@/lib/server-utils';
import Cliente from '@/models/cliente';
import Financiamiento from '@/models/financiamiento';
import { NextRequest, NextResponse } from 'next/server';

// Forzar registro de modelos para populate
void Financiamiento;

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
  try {
    const auth = requireAdminAuth(request);
    if (!auth.authorized) {
      return auth.response;
    }

    await connectDB();
    const { id } = await params;

    // Verificar que el cliente existe
    const cliente = await Cliente.findById(id);
    if (!cliente) {
      return NextResponse.json(
        { message: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si ya está eliminado
    if (cliente.eliminado) {
      return NextResponse.json(
        { error: 'El cliente ya fue eliminado anteriormente' },
        { status: 400 }
      );
    }

    // Verificar si está en algún financiamiento ACTIVO (como cliente o cliente2)
    const financiamientoActivo = await Financiamiento.findOne({
      $or: [
        { cliente: id },
        { cliente2: id }
      ],
      estadoFinanciamiento: { $in: ['activo', 'en_mora'] }
    });

    if (financiamientoActivo) {
      return NextResponse.json(
        { 
          error: 'No se puede eliminar el cliente porque está asociado a un financiamiento activo',
          financiamientoId: financiamientoActivo._id 
        },
        { status: 409 } // Conflict
      );
    }

    // Obtener ID del usuario para auditoría
    const userId = auth.user.id;

    // Soft delete: marcar como eliminado en lugar de borrar
    const clienteEliminado = await Cliente.findByIdAndUpdate(
      id,
      {
        eliminado: true,
        fechaEliminacion: new Date(),
        usuarioEliminacion: userId,
        usuarioModificacion: userId,
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Cliente eliminado exitosamente',
      cliente: clienteEliminado,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
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
    const auth = requireAdminAuth(request);
    if (!auth.authorized) {
      return auth.response;
    }

    await connectDB();
    const data = await request.json();
    const { id } = await params;

    const userId = auth.user.id;

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
