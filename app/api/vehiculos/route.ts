import { connectDB } from '@/db/dbConnection';
import { getUserIdFromToken } from '@/lib/server-utils';
import Vehiculo from '@/models/vehiculo';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();
    const vehiculos = await Vehiculo.find()
      .populate('usuarioCreacion', 'nombre usuario email')
      .populate('usuarioModificacion', 'nombre usuario email')
      .sort({ createdAt: -1 });
    return NextResponse.json(vehiculos);
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

export async function DELETE(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const vehiculoId = searchParams.get('id');

    if (!vehiculoId) {
      return NextResponse.json(
        { error: 'ID del vehículo es requerido' },
        { status: 400 }
      );
    }

    const vehiculoEliminado = await Vehiculo.findByIdAndDelete(vehiculoId);

    if (!vehiculoEliminado) {
      return NextResponse.json(
        { error: 'Vehículo no encontrado' },
        { status: 404 }
      );
    }

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
