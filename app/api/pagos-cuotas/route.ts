import { connectDB } from '@/db/dbConnection';
import PagoCuota from '@/models/pagoCuota';
import Financiamiento from '@/models/financiamiento';
import { NextResponse, NextRequest } from 'next/server';
import { getUserIdFromToken } from '@/lib/server-utils';

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

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Obtener el usuario logueado
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

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

    // Verificar que el número de cuota es válido (permitir cuotas adicionales)
    if (!body.esExtra && body.numeroCuota < 1) {
      return NextResponse.json(
        { error: 'Número de cuota inválido' },
        { status: 400 }
      );
    }

    // Permitir múltiples pagos de la misma cuota (pagos parciales)
    // No verificamos duplicados, ya que una cuota puede pagarse en múltiples pagos

    // Crear nuevo pago
    const nuevoPago = new PagoCuota({
      ...body,
      // Para pagos extra, guardamos el número de cuota si se proporciona (cuotasTotal + numeroCuotaExtra)
      // Para pagos normales, guardamos el número de cuota normalmente
      numeroCuota: body.esExtra && body.numeroCuota ? body.numeroCuota : (body.esExtra ? undefined : body.numeroCuota),
      esExtra: !!body.esExtra,
      estadoPago: 'confirmado',
      usuarioRegistro: userId, // Registrar el usuario que cobró la cuota
    });

    const pagoGuardado = await nuevoPago.save();

    // Calcular el total pagado sumando todos los pagos confirmados
    const todosLosPagos = await PagoCuota.find({
      financiamiento: body.financiamiento,
      estadoPago: 'confirmado',
    });
    
    const montoPagado = todosLosPagos.reduce(
      (sum, pago) => sum + pago.montoPago,
      0
    );

    // Calcular cuotas completamente pagadas
    // Para cada cuota normal, sumar todos sus pagos y verificar si >= valorCuota
    const pagosPorCuota: { [key: number]: number } = {};
    todosLosPagos
      .filter(pago => !pago.esExtra && pago.numeroCuota)
      .forEach(pago => {
        const numCuota = pago.numeroCuota!;
        if (!pagosPorCuota[numCuota]) {
          pagosPorCuota[numCuota] = 0;
        }
        pagosPorCuota[numCuota] += pago.montoPago;
      });

    // Contar cuántas cuotas están completamente pagadas
    let cuotasPagadas = 0;
    for (let i = 1; i <= financiamiento.cuotas; i++) {
      const totalPagadoCuota = pagosPorCuota[i] || 0;
      if (totalPagadoCuota >= financiamiento.valorCuota) {
        cuotasPagadas++;
      }
    }

    const cuotasPendientes = financiamiento.cuotas - cuotasPagadas;
    const saldoPendiente = financiamiento.montoTotal - montoPagado;

    let estadoFinanciamiento = financiamiento.estadoFinanciamiento;
    if (
      cuotasPagadas >= financiamiento.cuotas ||
      montoPagado >= financiamiento.montoTotal
    ) {
      estadoFinanciamiento = 'finalizado';
    }

    // Actualizar el financiamiento con el nuevo pago y el usuario que lo modificó
    await Financiamiento.findByIdAndUpdate(body.financiamiento, {
      cuotasPagadas,
      montoPagado,
      cuotasPendientes,
      saldoPendiente,
      estadoFinanciamiento,
      usuarioModificacion: userId, // Registrar el usuario que modificó el financiamiento
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

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // Obtener el usuario logueado
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

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

    // Recalcular el financiamiento después de eliminar el pago
    const financiamiento = await Financiamiento.findById(pago.financiamiento);
    if (financiamiento) {
      // Calcular el total pagado sumando todos los pagos confirmados restantes
      const todosLosPagos = await PagoCuota.find({
        financiamiento: pago.financiamiento,
        estadoPago: 'confirmado',
      });
      
      const montoPagado = todosLosPagos.reduce(
        (sum, p) => sum + p.montoPago,
        0
      );

      // Calcular cuotas completamente pagadas
      const pagosPorCuota: { [key: number]: number } = {};
      todosLosPagos
        .filter(p => !p.esExtra && p.numeroCuota)
        .forEach(p => {
          const numCuota = p.numeroCuota!;
          if (!pagosPorCuota[numCuota]) {
            pagosPorCuota[numCuota] = 0;
          }
          pagosPorCuota[numCuota] += p.montoPago;
        });

      // Contar cuántas cuotas están completamente pagadas
      let cuotasPagadas = 0;
      for (let i = 1; i <= financiamiento.cuotas; i++) {
        const totalPagadoCuota = pagosPorCuota[i] || 0;
        if (totalPagadoCuota >= financiamiento.valorCuota) {
          cuotasPagadas++;
        }
      }

      const cuotasPendientes = financiamiento.cuotas - cuotasPagadas;
      const saldoPendiente = financiamiento.montoTotal - montoPagado;

      let estadoFinanciamiento = 'activo';
      if (
        cuotasPagadas >= financiamiento.cuotas ||
        montoPagado >= financiamiento.montoTotal
      ) {
        estadoFinanciamiento = 'finalizado';
      }

      // Actualizar el financiamiento y registrando el usuario que lo modificó
      await Financiamiento.findByIdAndUpdate(pago.financiamiento, {
        cuotasPagadas,
        montoPagado,
        cuotasPendientes,
        saldoPendiente,
        estadoFinanciamiento,
        usuarioModificacion: userId, // Registrar el usuario que modificó el financiamiento
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
