import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db/dbConnection';
import Financiamiento from '@/models/financiamiento';
import PagoCuota from '@/models/pagoCuota';
import Cliente from '@/models/cliente';
import Vehiculo from '@/models/vehiculo';
import Empresa from '@/models/empresa';

// Forzar registro de modelos para populate (evita MissingSchemaError)
void Cliente;
void Vehiculo;
void Empresa;

// Tipos locales para los documentos "lean" (mongoose infiere tipado débil)
type CuotaFutura = {
  numeroCuota: number;
  fechaVencimiento: Date;
  valorCuota: number;
  estadoCuota?: string;
};

type FinanciamientoVencimiento = {
  _id: { toString(): string } | string;
  cuotasFuturas?: CuotaFutura[];
  cuotas: number;
  valorCuota: number;
  fechaPrimeraCuota: Date;
};

type PagoCuotaVencimiento = {
  financiamiento: { toString(): string } | string;
  numeroCuota: number;
};

type ResultadoVencimiento = FinanciamientoVencimiento & {
  cuotasPorVencer: CuotaFutura[];
  totalCuotasPorVencer: number;
  montoTotalPorVencer: number;
};

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const empresaId = searchParams.get('empresa');
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');

    if (!empresaId || !fechaInicio || !fechaFin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Empresa, fecha inicio y fecha fin son requeridos',
        },
        { status: 400 }
      );
    }

    // Convertir fechas a objetos Date
    const fechaInicioDate = new Date(fechaInicio);
    const fechaFinDate = new Date(fechaFin);
    
    // Ajustar fecha fin al final del día
    fechaFinDate.setHours(23, 59, 59, 999);

    // Buscar financiamientos de la empresa especificada
    const financiamientos = (await Financiamiento.find({
      empresa: empresaId,
      estadoFinanciamiento: { $in: ['activo', 'en_mora'] }, // Solo activos o en mora
    })
      .populate('cliente', 'NOMBRE TELEFONO cedula correo DIRECCION profesion')
      .populate('cliente2', 'NOMBRE TELEFONO cedula correo DIRECCION profesion')
      .populate('vehiculo', 'Marca Modelo Matricula Padron Año Color Descripcion disponible')
      .populate('empresa', 'nombre descripcion telefono')
      .lean()) as unknown as FinanciamientoVencimiento[];

    // Obtener todos los pagos para verificar cuotas pagadas
    const pagos = (await PagoCuota.find({
      financiamiento: { $in: financiamientos.map(f => f._id) },
      confirmado: true,
    }).lean()) as unknown as PagoCuotaVencimiento[];

    // Crear un mapa de pagos por financiamiento
    const pagosPorFinanciamiento = new Map<string, PagoCuotaVencimiento[]>();
    pagos.forEach(pago => {
      const finId = pago.financiamiento.toString();
      const listaFin = pagosPorFinanciamiento.get(finId);
      if (listaFin) {
        listaFin.push(pago);
      } else {
        pagosPorFinanciamiento.set(finId, [pago]);
      }
    });

    // Procesar cada financiamiento para encontrar cuotas por vencer
    const resultados: ResultadoVencimiento[] = [];

    for (const financiamiento of financiamientos) {
      const finId = financiamiento._id.toString();
      const pagosFin = pagosPorFinanciamiento.get(finId) || [];

      // Obtener números de cuotas pagadas
      const cuotasPagadas = new Set(pagosFin.map(pago => pago.numeroCuota));

      // Si tiene cuotasFuturas, buscar las que están en el rango
      if (financiamiento.cuotasFuturas && Array.isArray(financiamiento.cuotasFuturas)) {
        const cuotasPorVencer = financiamiento.cuotasFuturas.filter(
          (cuota: CuotaFutura) => {
            const fechaVencimiento = new Date(cuota.fechaVencimiento);
            
            // Verificar que esté en el rango de fechas
            const enRango =
              fechaVencimiento >= fechaInicioDate &&
              fechaVencimiento <= fechaFinDate;
            
            // Verificar que no esté pagada
            const noPagada = !cuotasPagadas.has(cuota.numeroCuota);

            return enRango && noPagada;
          }
        );

        // Si hay cuotas por vencer, agregar el financiamiento a los resultados
        if (cuotasPorVencer.length > 0) {
          resultados.push({
            ...financiamiento,
            cuotasPorVencer,
            totalCuotasPorVencer: cuotasPorVencer.length,
            montoTotalPorVencer: cuotasPorVencer.reduce(
              (sum: number, cuota: CuotaFutura) => sum + (cuota.valorCuota || 0),
              0
            ),
          });
        }
      } else {
        // Si no tiene cuotasFuturas, calcular basándose en fechaPrimeraCuota y valorCuota
        // Esto es un fallback para financiamientos antiguos
        const fechaPrimeraCuota = new Date(financiamiento.fechaPrimeraCuota);
        const cuotasPorVencer: CuotaFutura[] = [];

        // Calcular cuotas que deberían vencer en el rango
        for (let i = 0; i < financiamiento.cuotas; i++) {
          const fechaVencimiento = new Date(fechaPrimeraCuota);
          fechaVencimiento.setMonth(fechaVencimiento.getMonth() + i);

          const enRango =
            fechaVencimiento >= fechaInicioDate &&
            fechaVencimiento <= fechaFinDate;

          const numeroCuota = i + 1;
          const noPagada = !cuotasPagadas.has(numeroCuota);

          if (enRango && noPagada) {
            cuotasPorVencer.push({
              numeroCuota,
              fechaVencimiento,
              valorCuota: financiamiento.valorCuota || 0,
            });
          }
        }

        if (cuotasPorVencer.length > 0) {
          resultados.push({
            ...financiamiento,
            cuotasPorVencer,
            totalCuotasPorVencer: cuotasPorVencer.length,
            montoTotalPorVencer: cuotasPorVencer.reduce(
              (sum: number, cuota: CuotaFutura) => sum + (cuota.valorCuota || 0),
              0
            ),
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: resultados,
      total: resultados.length,
    });
  } catch (error) {
    console.error('Error obteniendo vencimientos:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}

