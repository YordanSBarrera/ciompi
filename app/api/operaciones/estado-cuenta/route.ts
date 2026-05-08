import { connectDB } from '@/db/dbConnection';
import Cliente from '@/models/cliente';
import Financiamiento from '@/models/financiamiento';
import PagoCuota from '@/models/pagoCuota';
import { NextRequest, NextResponse } from 'next/server';
import { normalizarMoneda } from '@/lib/moneda';
import { CuotaEstado, MonedaTipo } from '@/lib/const';

interface CuotaDetalle {
  numeroCuota: number;
  fechaVencimiento: Date;
  valorCuota: number;
  montoPagado: number;
  montoPendiente: number;
  pagada: boolean;
  esExtra: boolean;
  financiamientoId: string;
  financiamientoNumero?: string;
  vehiculo: any;
  empresa: any;
  estado: CuotaEstado;
  diasAtraso?: number;
  moneda: MonedaTipo;
}

interface ResumenFinanciamiento {
  financiamientoId: string;
  numeroFinanciamiento: string;
  vehiculo: any;
  empresa: any;
  estadoFinanciamiento: string;
  fechaVenta: Date;
  montoTotal: number;
  montoPagado: number;
  saldoPendiente: number;
  cuotasTotal: number;
  cuotasPagadas: number;
  cuotasPendientes: number;
  cuotasVencidas: number;
  progreso: number;
  moneda: MonedaTipo;
}

interface EstadoCuenta {
  cliente: any;
  financiamientos: ResumenFinanciamiento[];
  cuotas: CuotaDetalle[];
  resumen: {
    totalFinanciamientos: number;
    totalMontoFinanciado: number;
    totalMontoPagado: number;
    totalSaldoPendiente: number;
    totalCuotas: number;
    totalCuotasPagadas: number;
    totalCuotasPendientes: number;
    totalCuotasVencidas: number;
    montoVencido: number;
    montosPorMoneda: Record<
      MonedaTipo,
      {
        totalMontoFinanciado: number;
        totalMontoPagado: number;
        totalSaldoPendiente: number;
        montoVencido: number;
      }
    >;
  };
}

// Función para generar todas las cuotas de un financiamiento
function generarTodasLasCuotas(
  financiamiento: any,
  pagos: any[]
): Array<{
  numeroCuota: number;
  fechaVencimiento: Date;
  valorCuota: number;
  esExtra: boolean;
  montoPagado: number;
  pagada: boolean;
  montoPendiente: number;
}> {
  // Calcular el monto pagado por cada cuota
  const pagosPorCuota: { [key: number]: number } = {};
  pagos
    .filter(
      pago =>
        !pago.esExtra && pago.numeroCuota && pago.estadoPago === 'confirmado'
    )
    .forEach(pago => {
      const numCuota = pago.numeroCuota!;
      if (!pagosPorCuota[numCuota]) {
        pagosPorCuota[numCuota] = 0;
      }
      pagosPorCuota[numCuota] += pago.montoPago;
    });

  const todasLasCuotas: Array<{
    numeroCuota: number;
    fechaVencimiento: Date;
    valorCuota: number;
    esExtra: boolean;
    pagada: boolean;
    montoPagado: number;
    montoPendiente: number;
  }> = [];

  // Si hay cuotasFuturas definidas, usarlas
  if (financiamiento.cuotasFuturas && financiamiento.cuotasFuturas.length > 0) {
    financiamiento.cuotasFuturas.forEach((cuota: any) => {
      const fechaVencimiento = new Date(cuota.fechaVencimiento);
      const montoPagado = pagosPorCuota[cuota.numeroCuota] || 0;
      const pagada = montoPagado >= cuota.valorCuota;
      const montoPendiente = Math.max(0, cuota.valorCuota - montoPagado);

      todasLasCuotas.push({
        numeroCuota: cuota.numeroCuota,
        fechaVencimiento,
        valorCuota: cuota.valorCuota,
        esExtra: false,
        pagada,
        montoPagado,
        montoPendiente,
      });
    });
  } else {
    // Si no hay cuotasFuturas, calcular las fechas basándome en fechaPrimeraCuota
    const fechaPrimera = new Date(financiamiento.fechaPrimeraCuota);
    for (let i = 1; i <= financiamiento.cuotas; i++) {
      const fechaVencimiento = new Date(fechaPrimera);
      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + i - 1);

      const montoPagado = pagosPorCuota[i] || 0;
      const pagada = montoPagado >= financiamiento.valorCuota;
      const montoPendiente = Math.max(
        0,
        financiamiento.valorCuota - montoPagado
      );

      todasLasCuotas.push({
        numeroCuota: i,
        fechaVencimiento,
        valorCuota: financiamiento.valorCuota,
        esExtra: false,
        pagada,
        montoPagado,
        montoPendiente,
      });
    }
  }

  // Agregar cuotas extras si existen
  if (financiamiento.cuotasExtras && financiamiento.cuotasExtras > 0) {
    const fechaUltima =
      todasLasCuotas.length > 0
        ? new Date(todasLasCuotas[todasLasCuotas.length - 1].fechaVencimiento)
        : financiamiento.cuotasFuturas &&
            financiamiento.cuotasFuturas.length > 0
          ? new Date(
              financiamiento.cuotasFuturas[
                financiamiento.cuotasFuturas.length - 1
              ].fechaVencimiento
            )
          : new Date(financiamiento.fechaUltimaCuota);

    for (let i = 1; i <= financiamiento.cuotasExtras; i++) {
      const fechaVencimiento = new Date(fechaUltima);
      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + i);

      const numeroCuotaExtra = financiamiento.cuotas + i;
      const montoPagadoExtra = pagos
        .filter(
          pago =>
            pago.esExtra &&
            pago.numeroCuota === numeroCuotaExtra &&
            pago.estadoPago === 'confirmado'
        )
        .reduce((sum: number, pago: any) => sum + pago.montoPago, 0);
      const montoPendienteExtra = Math.max(
        0,
        financiamiento.valorCuota - montoPagadoExtra
      );

      todasLasCuotas.push({
        numeroCuota: numeroCuotaExtra,
        fechaVencimiento,
        valorCuota: financiamiento.valorCuota,
        esExtra: true,
        pagada: montoPagadoExtra >= financiamiento.valorCuota,
        montoPagado: montoPagadoExtra,
        montoPendiente: montoPendienteExtra,
      });
    }
  }

  return todasLasCuotas.sort((a, b) => a.numeroCuota - b.numeroCuota);
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const busqueda = searchParams.get('busqueda');

    if (!busqueda || busqueda.trim() === '') {
      return NextResponse.json(
        { error: 'Debe proporcionar un término de búsqueda' },
        { status: 400 }
      );
    }

    // Buscar cliente por nombre o cédula
    const cliente = await Cliente.findOne({
      $or: [
        { NOMBRE: { $regex: busqueda.trim(), $options: 'i' } },
        { cedula: { $regex: busqueda.trim(), $options: 'i' } },
      ],
    });

    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    // Buscar todos los financiamientos donde el cliente es cliente principal o cliente2
    const financiamientos = await Financiamiento.find({
      $or: [{ cliente: cliente._id }, { cliente2: cliente._id }],
    })
      .populate('cliente', 'NOMBRE TELEFONO cedula DIRECCION correo profesion')
      .populate('cliente2', 'NOMBRE TELEFONO cedula DIRECCION correo profesion')
      .populate('vehiculo', 'Marca Modelo Matricula Año Color')
      .populate('empresa', 'nombre descripcion telefono')
      .sort({ fechaVenta: -1 });

    if (financiamientos.length === 0) {
      return NextResponse.json({
        cliente,
        financiamientos: [],
        cuotas: [],
        resumen: {
          totalFinanciamientos: 0,
          totalMontoFinanciado: 0,
          totalMontoPagado: 0,
          totalSaldoPendiente: 0,
          totalCuotas: 0,
          totalCuotasPagadas: 0,
          totalCuotasPendientes: 0,
          totalCuotasVencidas: 0,
          montoVencido: 0,
          montosPorMoneda: {
            USD: {
              totalMontoFinanciado: 0,
              totalMontoPagado: 0,
              totalSaldoPendiente: 0,
              montoVencido: 0,
            },
            UYU: {
              totalMontoFinanciado: 0,
              totalMontoPagado: 0,
              totalSaldoPendiente: 0,
              montoVencido: 0,
            },
          },
        },
      });
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const resumenesFinanciamientos: ResumenFinanciamiento[] = [];
    const todasLasCuotas: CuotaDetalle[] = [];

    for (const financiamiento of financiamientos) {
      // Obtener pagos de este financiamiento
      const pagos = await PagoCuota.find({
        financiamiento: financiamiento._id,
      }).select('numeroCuota esExtra montoPago estadoPago fechaPago');

      // Generar todas las cuotas
      const cuotas = generarTodasLasCuotas(financiamiento, pagos);

      // Contar cuotas vencidas para este financiamiento
      let cuotasVencidasFin = 0;

      cuotas.forEach(cuota => {
        const fechaVenc = new Date(cuota.fechaVencimiento);
        fechaVenc.setHours(0, 0, 0, 0);
        const vencida = !cuota.pagada && fechaVenc < hoy;

        // Determinar estado
        let estado: CuotaEstado;
        let diasAtraso: number | undefined;

        if (cuota.pagada) {
          estado = CuotaEstado.Pagada;
        } else if (cuota.montoPagado > 0) {
          estado = CuotaEstado.Parcial;
        } else if (vencida) {
          estado = CuotaEstado.Vencida;
          cuotasVencidasFin++;
          diasAtraso = Math.floor(
            (hoy.getTime() - fechaVenc.getTime()) / (1000 * 60 * 60 * 24)
          );
        } else {
          estado = CuotaEstado.Pendiente;
        }

        todasLasCuotas.push({
          numeroCuota: cuota.numeroCuota,
          fechaVencimiento: cuota.fechaVencimiento,
          valorCuota: cuota.valorCuota,
          montoPagado: cuota.montoPagado,
          montoPendiente: cuota.montoPendiente,
          pagada: cuota.pagada,
          esExtra: cuota.esExtra,
          financiamientoId: financiamiento._id?.toString() || '',
          financiamientoNumero: financiamiento._id?.toString().slice(-8),
          vehiculo: financiamiento.vehiculo,
          empresa: financiamiento.empresa,
          estado: estado as CuotaEstado,
          diasAtraso,
          moneda: normalizarMoneda(financiamiento.moneda) as MonedaTipo,
        });
      });

      // Calcular progreso del financiamiento
      const totalCuotas =
        financiamiento.cuotas + (financiamiento.cuotasExtras || 0);
      const progreso =
        totalCuotas > 0
          ? Math.round(
              ((financiamiento.cuotasPagadas || 0) / totalCuotas) * 100
            )
          : 0;

      // Crear resumen del financiamiento
      resumenesFinanciamientos.push({
        financiamientoId: financiamiento._id?.toString() || '',
        numeroFinanciamiento: financiamiento._id?.toString().slice(-8),
        vehiculo: financiamiento.vehiculo,
        empresa: financiamiento.empresa,
        estadoFinanciamiento: financiamiento.estadoFinanciamiento,
        fechaVenta: financiamiento.fechaVenta,
        montoTotal: financiamiento.montoTotal,
        montoPagado: financiamiento.montoPagado || 0,
        saldoPendiente: financiamiento.saldoPendiente || 0,
        cuotasTotal: totalCuotas,
        cuotasPagadas: financiamiento.cuotasPagadas || 0,
        cuotasPendientes: cuotas.length - (financiamiento.cuotasPagadas || 0),
        cuotasVencidas: cuotasVencidasFin,
        progreso,
        moneda: normalizarMoneda(financiamiento.moneda) as MonedaTipo,
      });
    }

    // Ordenar cuotas por fecha de vencimiento
    todasLasCuotas.sort((a, b) => {
      const fechaA = new Date(a.fechaVencimiento);
      const fechaB = new Date(b.fechaVencimiento);
      return fechaA.getTime() - fechaB.getTime();
    });

    // Calcular resumen general
    const resumen = {
      totalFinanciamientos: resumenesFinanciamientos.length,
      totalMontoFinanciado: resumenesFinanciamientos.reduce(
        (sum, fin) => sum + fin.montoTotal,
        0
      ),
      totalMontoPagado: resumenesFinanciamientos.reduce(
        (sum, fin) => sum + fin.montoPagado,
        0
      ),
      totalSaldoPendiente: resumenesFinanciamientos.reduce(
        (sum, fin) => sum + fin.saldoPendiente,
        0
      ),
      totalCuotas: todasLasCuotas.length,
      totalCuotasPagadas: todasLasCuotas.filter(c => c.pagada).length,
      totalCuotasPendientes: todasLasCuotas.filter(c => !c.pagada).length,
      totalCuotasVencidas: todasLasCuotas.filter(c => c.estado === 'vencida')
        .length,
      montoVencido: todasLasCuotas
        .filter(c => c.estado === 'vencida')
        .reduce((sum, c) => sum + c.montoPendiente, 0),
      montosPorMoneda: (() => {
        const vacío = {
          totalMontoFinanciado: 0,
          totalMontoPagado: 0,
          totalSaldoPendiente: 0,
          montoVencido: 0,
        };
        const agg: Record<'USD' | 'UYU', typeof vacío> = {
          USD: { ...vacío },
          UYU: { ...vacío },
        };
        for (const fin of resumenesFinanciamientos) {
          const m = fin.moneda;
          agg[m].totalMontoFinanciado += fin.montoTotal;
          agg[m].totalMontoPagado += fin.montoPagado;
          agg[m].totalSaldoPendiente += fin.saldoPendiente;
        }
        for (const c of todasLasCuotas) {
          if (c.estado !== CuotaEstado.Vencida) continue;
          agg[c.moneda].montoVencido += c.montoPendiente;
        }
        return agg;
      })(),
    };

    const estadoCuenta: EstadoCuenta = {
      cliente,
      financiamientos: resumenesFinanciamientos,
      cuotas: todasLasCuotas,
      resumen,
    };

    return NextResponse.json(estadoCuenta);
  } catch (error) {
    console.error('Error obteniendo estado de cuenta:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: `Error interno del servidor: ${errorMessage}` },
      { status: 500 }
    );
  }
}
