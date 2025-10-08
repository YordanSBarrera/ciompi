import { connectDB } from '@/db/dbConnection';
import Vehiculo from '@/models/vehiculo';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const vehiculoEncontrado = await Vehiculo.findById(id);

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
    const data = await request.json();

    const { id } = await params;
    const vehiculoUpdated = await Vehiculo.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!vehiculoUpdated) {
      return NextResponse.json(
        { message: 'Vehículo no encontrado' },
        { status: 404 }
      );
    }

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
