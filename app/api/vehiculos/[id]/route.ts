import { connectDB } from '@/db/dbConnection';
import { requireAdminAuth, requireAuth } from '@/lib/server-utils';
import Vehiculo from '@/models/vehiculo';
import Financiamiento from '@/models/financiamiento';
import Cliente from '@/models/cliente';
import Usuario from '@/models/Usuario';
import { NextRequest, NextResponse } from 'next/server';

// Forzar registro de modelos para populate
void Financiamiento;
void Cliente;
void Usuario;

interface FinanciamientoActivoResumen {
  _id: string;
  estadoFinanciamiento: string;
  clienteNombre?: string;
}

// Resultado tipado de .lean() para evitar la inferencia incorrecta de mongoose
type FinanciamientoActivoLean = {
  _id: unknown;
  estadoFinanciamiento: string;
  cliente: unknown;
};

async function obtenerFinanciamientoActivo(
  vehiculoId: string
): Promise<FinanciamientoActivoResumen | null> {
  const financiamiento = (await Financiamiento.findOne({
    vehiculo: vehiculoId,
    estadoFinanciamiento: { $in: ['activo', 'en_mora'] },
  })
    .select('_id estadoFinanciamiento cliente')
    .populate('cliente', 'NOMBRE')
    .lean()) as unknown as FinanciamientoActivoLean | null;

  if (!financiamiento) return null;

  return {
    _id: String(financiamiento._id),
    estadoFinanciamiento: String(financiamiento.estadoFinanciamiento),
    clienteNombre:
      typeof financiamiento.cliente === 'object' &&
      financiamiento.cliente !== null &&
      'NOMBRE' in financiamiento.cliente
        ? (financiamiento.cliente as { NOMBRE?: string }).NOMBRE
        : undefined,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const vehiculoEncontrado = await Vehiculo.findById(id)
      .populate('usuarioCreacion', 'nombre usuario email')
      .populate('usuarioModificacion', 'nombre usuario email');

    if (!vehiculoEncontrado) {
      return NextResponse.json(
        { message: 'Vehículo no encontrado' },
        { status: 404 }
      );
    }

    const financiamientoActivo = await obtenerFinanciamientoActivo(id);

    const vehiculoData = vehiculoEncontrado.toObject();
    return NextResponse.json({
      ...vehiculoData,
      financiamientoActivo,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request);
    if (!auth.authorized) {
      return auth.response;
    }

    await connectDB();

    const userId = auth.user.id;

    const data = await request.json();

    const { id } = await params;

    const financiamientoActivo = await obtenerFinanciamientoActivo(id);

    if (financiamientoActivo) {
      if (data.disponible === true) {
        return NextResponse.json(
          {
            error:
              'No se puede marcar como disponible: el vehículo está asociado a un financiamiento activo',
            financiamientoId: financiamientoActivo._id,
          },
          { status: 409 }
        );
      }
      data.disponible = false;
    }

    const vehiculoUpdated = await Vehiculo.findByIdAndUpdate(
      id,
      { ...data, usuarioModificacion: userId },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!vehiculoUpdated) {
      return NextResponse.json(
        { message: 'Vehículo no encontrado' },
        { status: 404 }
      );
    }

    await vehiculoUpdated.populate('usuarioCreacion', 'nombre usuario email');
    await vehiculoUpdated.populate(
      'usuarioModificacion',
      'nombre usuario email'
    );

    return NextResponse.json({
      ...vehiculoUpdated.toObject(),
      financiamientoActivo,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
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

    // Verificar que el vehículo existe
    const vehiculo = await Vehiculo.findById(id);
    if (!vehiculo) {
      return NextResponse.json(
        { message: 'Vehículo no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si ya está eliminado
    if (vehiculo.eliminado) {
      return NextResponse.json(
        { error: 'El vehículo ya fue eliminado anteriormente' },
        { status: 400 }
      );
    }

    // Regla de negocio: un vehículo asociado a cualquier financiamiento
    // (sin importar su estado) no se puede eliminar de la BD
    const financiamientoAsociado = await Financiamiento.findOne({
      vehiculo: id,
    });

    if (financiamientoAsociado) {
      return NextResponse.json(
        {
          error:
            'No se puede eliminar el vehículo porque está asociado a un financiamiento',
          financiamientoId: financiamientoAsociado._id,
        },
        { status: 409 } // Conflict
      );
    }

    // Obtener ID del usuario para auditoría
    const userId = auth.user.id;

    // Soft delete: marcar como eliminado en lugar de borrar
    const vehiculoEliminado = await Vehiculo.findByIdAndUpdate(
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
      message: 'Vehículo eliminado exitosamente',
      vehiculo: vehiculoEliminado,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
