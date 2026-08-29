import { connectDB } from '@/db/dbConnection';
import PagoCuota from '@/models/pagoCuota';
import Financiamiento from '@/models/financiamiento';
import Usuario from '@/models/Usuario';
import { NextResponse, NextRequest } from 'next/server';
import {
  getUserIdFromToken,
  parseLocalDate,
  requireAdminAuth,
} from '@/lib/server-utils';

// Forzar registro de modelos para populate (evita MissingSchemaError)
void Usuario;

interface CuotaFuturaResumen {
  numeroCuota: number;
  valorCuota: number;
}

interface FinanciamientoResumen {
  cuotas: number;
  cuotasExtras?: number;
  valorCuota: number;
  montoTotal: number;
  cuotasFuturas?: CuotaFuturaResumen[];
}

// Devuelve el valor esperado de una cuota (usa cuotasFuturas si existe,
// de lo contrario el valorCuota general). Soporta cuotas extras con montos distintos.
function obtenerValorCuotaEsperado(
  financiamiento: FinanciamientoResumen,
  numeroCuota: number
): number {
  const cuotaFutura = financiamiento.cuotasFuturas?.find(
    cf => cf.numeroCuota === numeroCuota
  );
  return cuotaFutura ? cuotaFutura.valorCuota : financiamiento.valorCuota;
}

// Recalcula los indicadores del financiamiento a partir de los pagos
// confirmados registrados (monto pagado, cuotas pagadas, saldo y estado).
async function recalcularEstadoFinanciamiento(
  financiamientoId: string,
  userId: string
) {
  const financiamiento = await Financiamiento.findById(financiamientoId);
  if (!financiamiento) return;

  const todosLosPagos = await PagoCuota.find({
    financiamiento: financiamientoId,
    estadoPago: 'confirmado',
  });

  const montoPagado = todosLosPagos.reduce(
    (sum, pago) => sum + pago.montoPago,
    0
  );

  // Sumar lo pagado por cada cuota normal
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

  // Total de cuotas incluyendo extras
  const cuotasTotales =
    financiamiento.cuotas + (financiamiento.cuotasExtras || 0);

  // Contar cuántas cuotas están completamente pagadas (incluyendo extras,
  // usando el monto correcto de cada cuota desde cuotasFuturas)
  let cuotasPagadas = 0;
  for (let i = 1; i <= cuotasTotales; i++) {
    const totalPagadoCuota = pagosPorCuota[i] || 0;
    if (totalPagadoCuota >= obtenerValorCuotaEsperado(financiamiento, i)) {
      cuotasPagadas++;
    }
  }

  const cuotasPendientes = Math.max(0, cuotasTotales - cuotasPagadas);
  const saldoPendiente = Math.max(0, financiamiento.montoTotal - montoPagado);

  // Si deja de estar finalizado, vuelve a activo
  let estadoFinanciamiento =
    financiamiento.estadoFinanciamiento === 'finalizado'
      ? 'activo'
      : financiamiento.estadoFinanciamiento;
  if (
    cuotasPagadas >= cuotasTotales ||
    montoPagado >= financiamiento.montoTotal
  ) {
    estadoFinanciamiento = 'finalizado';
  }

  await Financiamiento.findByIdAndUpdate(financiamientoId, {
    cuotasPagadas,
    montoPagado,
    cuotasPendientes,
    saldoPendiente,
    estadoFinanciamiento,
    usuarioModificacion: userId,
  });
}

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

    // Permitir múltiples pagos de la misma cuota (pagos parciales),
    // pero nunca sobrepagar una cuota ya pagada ni el financiamiento.
    const pagosExistentes = await PagoCuota.find({
      financiamiento: body.financiamiento,
      estadoPago: 'confirmado',
    });

    const montoPagadoExistente = pagosExistentes.reduce(
      (sum, pago) => sum + pago.montoPago,
      0
    );

    if (body.numeroCuota && Number(body.numeroCuota) > 0) {
      const numeroCuota = Number(body.numeroCuota);
      const valorCuotaEsperado = obtenerValorCuotaEsperado(
        financiamiento,
        numeroCuota
      );
      const totalPagadoCuota = pagosExistentes
        .filter(pago => pago.numeroCuota === numeroCuota)
        .reduce((sum, pago) => sum + pago.montoPago, 0);
      const saldoCuota = valorCuotaEsperado - totalPagadoCuota;

      if (saldoCuota <= 0) {
        return NextResponse.json(
          {
            error: `La cuota #${numeroCuota} ya está completamente pagada`,
          },
          { status: 400 }
        );
      }

      if (Number(body.montoPago) > saldoCuota) {
        return NextResponse.json(
          {
            error: `El monto del pago (${body.montoPago}) excede el saldo pendiente de la cuota #${numeroCuota} (${saldoCuota})`,
          },
          { status: 400 }
        );
      }
    }

    const saldoTotalExistente =
      financiamiento.montoTotal - montoPagadoExistente;
    if (saldoTotalExistente <= 0) {
      return NextResponse.json(
        {
          error: 'El financiamiento ya está completamente pagado',
        },
        { status: 400 }
      );
    }

    if (Number(body.montoPago) > saldoTotalExistente) {
      return NextResponse.json(
        {
          error: `El monto del pago (${body.montoPago}) excede el saldo pendiente del financiamiento (${saldoTotalExistente})`,
        },
        { status: 400 }
      );
    }

    // Crear nuevo pago (usando parseLocalDate para evitar desfase de timezone)
    const nuevoPago = new PagoCuota({
      ...body,
      fechaPago: parseLocalDate(body.fechaPago), // Convertir fecha correctamente
      // Para pagos extra, guardamos el número de cuota si se proporciona (cuotasTotal + numeroCuotaExtra)
      // Para pagos normales, guardamos el número de cuota normalmente
      numeroCuota:
        body.esExtra && body.numeroCuota
          ? body.numeroCuota
          : body.esExtra
            ? undefined
            : body.numeroCuota,
      esExtra: !!body.esExtra,
      estadoPago: 'confirmado',
      usuarioRegistro: userId, // Registrar el usuario que cobró la cuota
    });

    const pagoGuardado = await nuevoPago.save();

    // Recalcular el estado del financiamiento con el nuevo pago
    await recalcularEstadoFinanciamiento(body.financiamiento, userId);

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

export async function PUT(request: NextRequest) {
  try {
    const auth = requireAdminAuth(request);
    if (!auth.authorized) {
      return auth.response;
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID del pago es requerido' },
        { status: 400 }
      );
    }

    const pago = await PagoCuota.findById(id);
    if (!pago) {
      return NextResponse.json(
        { error: 'Pago no encontrado' },
        { status: 404 }
      );
    }

    const userId = auth.user.id;
    const body = await request.json();

    // Validar datos requeridos
    const requiredFields = [
      'numeroCuota',
      'montoPago',
      'fechaPago',
      'metodoPago',
    ];
    for (const field of requiredFields) {
      if (
        body[field] === undefined ||
        body[field] === null ||
        body[field] === ''
      ) {
        return NextResponse.json(
          { error: `El campo ${field} es obligatorio` },
          { status: 400 }
        );
      }
    }

    const numeroCuota = Number(body.numeroCuota);
    const montoPago = Number(body.montoPago);
    if (!Number.isFinite(numeroCuota) || numeroCuota < 1) {
      return NextResponse.json(
        { error: 'Número de cuota inválido' },
        { status: 400 }
      );
    }
    if (!Number.isFinite(montoPago) || montoPago <= 0) {
      return NextResponse.json(
        { error: 'El monto del pago debe ser mayor a 0' },
        { status: 400 }
      );
    }

    const financiamiento = await Financiamiento.findById(pago.financiamiento);
    if (!financiamiento) {
      return NextResponse.json(
        { error: 'Financiamiento no encontrado' },
        { status: 404 }
      );
    }

    // Pagos confirmados EXCLUYENDO el pago que se está editando
    const otrosPagos = await PagoCuota.find({
      financiamiento: pago.financiamiento,
      estadoPago: 'confirmado',
      _id: { $ne: pago._id },
    });

    const montoPagadoExistente = otrosPagos.reduce(
      (sum, p) => sum + p.montoPago,
      0
    );

    // No permitir dejar la cuota seleccionada sobrepagada después del cambio
    const valorCuotaEsperado = obtenerValorCuotaEsperado(
      financiamiento,
      numeroCuota
    );
    const totalPagadoCuota = otrosPagos
      .filter(p => p.numeroCuota === numeroCuota)
      .reduce((sum, p) => sum + p.montoPago, 0);
    const saldoCuota = valorCuotaEsperado - totalPagadoCuota;

    if (saldoCuota <= 0) {
      return NextResponse.json(
        {
          error: `La cuota #${numeroCuota} ya está completamente pagada`,
        },
        { status: 400 }
      );
    }
    if (montoPago > saldoCuota) {
      return NextResponse.json(
        {
          error: `El monto del pago (${montoPago}) excede el saldo pendiente de la cuota #${numeroCuota} (${saldoCuota})`,
        },
        { status: 400 }
      );
    }

    const saldoTotalExistente =
      financiamiento.montoTotal - montoPagadoExistente;
    if (saldoTotalExistente <= 0) {
      return NextResponse.json(
        {
          error: 'El financiamiento ya está completamente pagado',
        },
        { status: 400 }
      );
    }
    if (montoPago > saldoTotalExistente) {
      return NextResponse.json(
        {
          error: `El monto del pago (${montoPago}) excede el saldo pendiente del financiamiento (${saldoTotalExistente})`,
        },
        { status: 400 }
      );
    }

    // Actualizar el pago (usando parseLocalDate para evitar desfase de timezone)
    const pagoActualizado = await PagoCuota.findByIdAndUpdate(
      id,
      {
        numeroCuota,
        montoPago,
        fechaPago: parseLocalDate(body.fechaPago),
        metodoPago: body.metodoPago,
        esExtra: !!body.esExtra,
        numeroComprobante: body.numeroComprobante ?? '',
        banco: body.banco ?? '',
        observaciones: body.observaciones ?? '',
        estadoPago: 'confirmado',
      },
      { new: true, runValidators: true }
    ).populate('usuarioRegistro', 'nombre usuario');

    // Recalcular el estado del financiamiento con los datos corregidos
    await recalcularEstadoFinanciamiento(String(pago.financiamiento), userId);

    return NextResponse.json(pagoActualizado);
  } catch (error: unknown) {
    console.error('Error actualizando pago:', error);
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
    const id = searchParams.get('id');

    const userId = auth.user.id;

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
    await recalcularEstadoFinanciamiento(String(pago.financiamiento), userId);

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
