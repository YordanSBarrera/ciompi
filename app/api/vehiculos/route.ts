import { connectDB } from '@/db/dbConnection';
import { getUserIdFromToken, requireAdminAuth } from '@/lib/server-utils';
import Vehiculo from '@/models/vehiculo';
import Financiamiento from '@/models/financiamiento';
import Cliente from '@/models/cliente';
import Usuario from '@/models/Usuario';
import { NextRequest, NextResponse } from 'next/server';

// Forzar registro de modelos para populate
void Financiamiento;
void Cliente;
void Usuario;

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const incluirEliminados = searchParams.get('incluirEliminados') === 'true';
    
    // Por defecto, filtrar vehículos eliminados
    const query = incluirEliminados ? {} : { eliminado: { $ne: true } };
    
    const vehiculos = await Vehiculo.find(query)
      .populate('usuarioCreacion', 'nombre usuario email')
      .populate('usuarioModificacion', 'nombre usuario email')
      .sort({ createdAt: -1 });

    // Calcular financiamientos activos por vehículo (disponibilidad derivada)
    const vehiculoIds = vehiculos.map(v => v._id);
    const financiamientosActivos = vehiculoIds.length
      ? await Financiamiento.find({
          vehiculo: { $in: vehiculoIds },
          estadoFinanciamiento: { $in: ['activo', 'en_mora'] },
        })
          .select('_id estadoFinanciamiento cliente vehiculo')
          .populate('cliente', 'NOMBRE')
          .lean()
      : [];

    const activosPorVehiculo = new Map<string, any>();
    for (const f of financiamientosActivos) {
      const vehiculoKey = (f.vehiculo as any)?.toString();
      if (vehiculoKey && !activosPorVehiculo.has(vehiculoKey)) {
        activosPorVehiculo.set(vehiculoKey, f);
      }
    }

    const resultado = vehiculos.map(v => {
      const doc = v.toObject();
      const fa = activosPorVehiculo.get(v._id.toString());
      return {
        ...doc,
        financiamientoActivo: fa
          ? {
              _id: fa._id,
              estadoFinanciamiento: fa.estadoFinanciamiento,
              clienteNombre:
                typeof fa.cliente === 'object' &&
                fa.cliente !== null &&
                'NOMBRE' in fa.cliente
                  ? (fa.cliente as { NOMBRE?: string }).NOMBRE
                  : undefined,
            }
          : null,
      };
    });

    return NextResponse.json(resultado);
  } catch (error: unknown) {
    console.error('Error obteniendo vehículos:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json(
        { error: 'Error interno del servidor' },
        { status: 500 }
      );
    }
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    // Obtener ID del usuario desde el token con fallback
    const userId = getUserIdFromToken(request) || '68f83df25d5fc999682c6dfb';

    const body = await request.json();
    const newVehiculo = new Vehiculo({
      ...body,
      disponible: body.disponible !== undefined ? body.disponible : true, // Por defecto disponible
      usuarioCreacion: userId,
      usuarioModificacion: userId,
    });
    const savedVehiculo = await newVehiculo.save();

    await savedVehiculo.populate('usuarioCreacion', 'nombre usuario email');
    await savedVehiculo.populate('usuarioModificacion', 'nombre usuario email');

    return NextResponse.json(savedVehiculo);
  } catch (error: unknown) {
    console.error('Error creando vehículo:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    } else {
      return NextResponse.json(
        { error: 'Error interno del servidor' },
        { status: 500 }
      );
    }
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = requireAdminAuth(request);
    if (!auth.authorized) {
      return auth.response;
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const vehiculoId = searchParams.get('id');

    if (!vehiculoId) {
      return NextResponse.json(
        { error: 'ID del vehículo es requerido' },
        { status: 400 }
      );
    }

    // Verificar que el vehículo existe
    const vehiculo = await Vehiculo.findById(vehiculoId);
    if (!vehiculo) {
      return NextResponse.json(
        { error: 'Vehículo no encontrado' },
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
      vehiculo: vehiculoId,
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
      vehiculoId,
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
  } catch (error: unknown) {
    console.error('Error eliminando vehículo:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json(
        { error: 'Error interno del servidor' },
        { status: 500 }
      );
    }
  }
}
