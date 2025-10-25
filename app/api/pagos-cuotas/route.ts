import { connectDB } from '@/db/dbConnection';
import PagoCuota from '@/models/pagoCuota';
import Financiamiento from '@/models/financiamiento';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();

    // Obtener todos los pagos con información del financiamiento y usuario
    const pagos = await PagoCuota.find()
      .populate(
        'financiamiento',
        'cliente vehiculo costoVehiculo cuotas valorCuota'
      )
      .populate('usuarioRegistro', 'nombre usuario')
      .sort({ fechaPago: -1 });

    return NextResponse.json(pagos);
  } catch (error) {
    console.error('Error obteniendo pagos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    // Validar datos requeridos
    const requiredFields = [
      'financiamiento',
      'numeroCuota',
      'montoPago',
      'fechaPago',
      'metodoPago',
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `El campo ${field} es obligatorio` },
          { status: 400 }
        );
      }
    }

    // Verificar que el financiamiento existe
    const financiamiento = await Financiamiento.findById(body.financiamiento);
    if (!financiamiento) {
      return NextResponse.json(
        { error: 'Financiamiento no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el número de cuota es válido
    if (body.numeroCuota < 1 || body.numeroCuota > financiamiento.cuotas) {
      return NextResponse.json(
        { error: 'Número de cuota inválido' },
        { status: 400 }
      );
    }

    // Verificar que la cuota no esté ya pagada
    const pagoExistente = await PagoCuota.findOne({
      financiamiento: body.financiamiento,
      numeroCuota: body.numeroCuota,
    });

    if (pagoExistente) {
      return NextResponse.json(
        { error: `La cuota ${body.numeroCuota} ya está pagada` },
        { status: 400 }
      );
    }

    // Crear nuevo pago
    const nuevoPago = new PagoCuota({
      ...body,
      estadoPago: 'confirmado',
    });

    const pagoGuardado = await nuevoPago.save();

    // Actualizar el financiamiento con el nuevo pago
    const cuotasPagadas = financiamiento.cuotasPagadas + 1;
    const montoPagado = financiamiento.montoPagado + body.montoPago;
    const cuotasPendientes = financiamiento.cuotas - cuotasPagadas;
    const saldoPendiente = financiamiento.montoTotal - montoPagado;

    let estadoFinanciamiento = financiamiento.estadoFinanciamiento;
    if (
      cuotasPagadas >= financiamiento.cuotas ||
      montoPagado >= financiamiento.montoTotal
    ) {
      estadoFinanciamiento = 'finalizado';
    }

    await Financiamiento.findByIdAndUpdate(body.financiamiento, {
      cuotasPagadas,
      montoPagado,
      cuotasPendientes,
      saldoPendiente,
      estadoFinanciamiento,
    });

    // Devolver el pago con información poblada
    const pagoCompleto = await PagoCuota.findById(pagoGuardado._id)
      .populate(
        'financiamiento',
        'cliente vehiculo costoVehiculo cuotas valorCuota'
      )
      .populate('usuarioRegistro', 'nombre usuario');

    return NextResponse.json(pagoCompleto, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creando pago:', error);
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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID del pago es requerido' },
        { status: 400 }
      );
    }

    // Buscar el pago para obtener información del financiamiento
    const pago = await PagoCuota.findById(id);
    if (!pago) {
      return NextResponse.json(
        { error: 'Pago no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar el pago
    await PagoCuota.findByIdAndDelete(id);

    // Actualizar el financiamiento restando este pago
    const financiamiento = await Financiamiento.findById(pago.financiamiento);
    if (financiamiento) {
      const cuotasPagadas = Math.max(0, financiamiento.cuotasPagadas - 1);
      const montoPagado = Math.max(
        0,
        financiamiento.montoPagado - pago.montoPago
      );
      const cuotasPendientes = financiamiento.cuotas - cuotasPagadas;
      const saldoPendiente = financiamiento.montoTotal - montoPagado;

      let estadoFinanciamiento = 'activo';
      if (
        cuotasPagadas >= financiamiento.cuotas ||
        montoPagado >= financiamiento.montoTotal
      ) {
        estadoFinanciamiento = 'finalizado';
      }

      await Financiamiento.findByIdAndUpdate(pago.financiamiento, {
        cuotasPagadas,
        montoPagado,
        cuotasPendientes,
        saldoPendiente,
        estadoFinanciamiento,
      });
    }

    return NextResponse.json({
      message: 'Pago eliminado correctamente',
    });
  } catch (error) {
    console.error('Error eliminando pago:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
