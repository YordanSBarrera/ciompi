import { connectDB } from '@/db/dbConnection';
import { RouteParams } from '@/lib/types';
import Financiamiento from '@/models/financiamiento';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const financiamiento = await Financiamiento.findById(id)
      .populate('cliente', 'NOMBRE CODCLI TELEFONO cedula correo DIRECCION')
      .populate('vehiculo', 'Marca Modelo Matricula Año Color Descripcion')
      .populate('usuarioRegistro', 'nombre usuario email');

    if (!financiamiento) {
      return NextResponse.json(
        { message: 'Financiamiento no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(financiamiento);
  } catch (error: any) {
    console.error('Error obteniendo financiamiento:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    // Buscar el financiamiento existente
    const financiamientoExistente = await Financiamiento.findById(id);

    if (!financiamientoExistente) {
      return NextResponse.json(
        { error: 'Financiamiento no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar solo los campos permitidos
    const camposPermitidos = [
      'estadoFinanciamiento',
      'observaciones',
      'cuotasPagadas',
      'montoPagado',
      'saldoPendiente',
      'cuotasPendientes',
    ];

    const datosActualizados: any = {};
    for (const campo of camposPermitidos) {
      if (body[campo] !== undefined) {
        datosActualizados[campo] = body[campo];
      }
    }

    // Si se actualiza cuotasPagadas o montoPagado, recalcular otros campos
    if (
      datosActualizados.cuotasPagadas !== undefined ||
      datosActualizados.montoPagado !== undefined
    ) {
      const cuotasPagadas =
        datosActualizados.cuotasPagadas ??
        financiamientoExistente.cuotasPagadas;
      const montoPagado =
        datosActualizados.montoPagado ?? financiamientoExistente.montoPagado;

      datosActualizados.cuotasPendientes =
        financiamientoExistente.cuotas - cuotasPagadas;
      datosActualizados.saldoPendiente =
        financiamientoExistente.montoTotal - montoPagado;

      // Verificar si está finalizado
      if (
        cuotasPagadas >= financiamientoExistente.cuotas ||
        montoPagado >= financiamientoExistente.montoTotal
      ) {
        datosActualizados.estadoFinanciamiento = 'finalizado';
        datosActualizados.cuotasPendientes = 0;
        datosActualizados.saldoPendiente = 0;
      }
    }

    const financiamientoActualizado = await Financiamiento.findByIdAndUpdate(
      id,
      datosActualizados,
      { new: true, runValidators: true }
    )
      .populate('cliente', 'NOMBRE CODCLI TELEFONO cedula')
      .populate('vehiculo', 'Marca Modelo Matricula Año Color')
      .populate('usuarioRegistro', 'nombre usuario');

    return NextResponse.json(financiamientoActualizado);
  } catch (error: any) {
    console.error('Error actualizando financiamiento:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const financiamientoEliminado = await Financiamiento.findByIdAndDelete(id);

    if (!financiamientoEliminado) {
      return NextResponse.json(
        { error: 'Financiamiento no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Financiamiento eliminado correctamente',
    });
  } catch (error: any) {
    console.error('Error eliminando financiamiento:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
