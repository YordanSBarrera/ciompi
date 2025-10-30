import { connectDB } from '@/db/dbConnection';
import { getUserIdFromToken } from '@/lib/server-utils';
import Vehiculo from '@/models/vehiculo';
import { NextRequest, NextResponse } from 'next/server';

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

    return NextResponse.json(vehiculoEncontrado);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Obtener ID del usuario desde el token con fallback
    const userId = getUserIdFromToken(request) || '68f83df25d5fc999682c6dfb';

    const data = await request.json();

    const { id } = await params;
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

    return NextResponse.json(vehiculoUpdated);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const vehiculoEliminado = await Vehiculo.findByIdAndDelete(id);

    if (!vehiculoEliminado) {
      return NextResponse.json(
        { message: 'Vehículo no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Vehículo eliminado exitosamente',
      vehiculo: vehiculoEliminado,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
