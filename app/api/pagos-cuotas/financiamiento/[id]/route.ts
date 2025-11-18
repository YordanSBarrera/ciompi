import { connectDB } from '@/db/dbConnection';
import PagoCuota from '@/models/pagoCuota';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Obtener todos los pagos de un financiamiento específico
    // Ordenar: primero cuotas normales por número, luego extras por número (si tienen) o fecha
    const pagos = await PagoCuota.find({ financiamiento: id })
      .populate('usuarioRegistro', 'nombre usuario')
      .sort({ esExtra: 1, numeroCuota: 1, fechaPago: 1 });

    return NextResponse.json(pagos);
  } catch (error: any) {
    console.error('Error obteniendo pagos del financiamiento:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
