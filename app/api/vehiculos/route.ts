import { connectDB } from '@/db/dbConnection';
import Vehiculo from '@/models/vehiculo';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();
    const vehiculos = await Vehiculo.find().sort({ createdAt: -1 });
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
    const body = await request.json();
    const newVehiculo = new Vehiculo(body);
    const savedVehiculo = await newVehiculo.save();
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
