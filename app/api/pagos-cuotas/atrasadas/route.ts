import { connectDB } from '@/db/dbConnection';
import Financiamiento from '@/models/financiamiento';
import PagoCuota from '@/models/pagoCuota';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Normalizar a inicio del día

    // Obtener todos los financiamientos activos
    const financiamientos = await Financiamiento.find({
      estadoFinanciamiento: { $in: ['activo', 'en_mora'] },
    })
      .populate('cliente', 'NOMBRE TELEFONO cedula')
      .populate('vehiculo', 'Marca Modelo Matricula Año Color')
      .populate('empresa', 'nombre descripcion telefono')
      .sort({ fechaVenta: -1 });

    // Array para almacenar todas las cuotas atrasadas
    const cuotasAtrasadas: Array<{
      numeroCuota: number;
      fechaVencimiento: Date;
      valorCuota: number;
      financiamientoId: string;
      cliente: any;
      vehiculo: any;
      empresa: any;
      diasAtraso: number;
    }> = [];

    for (const financiamiento of financiamientos) {
      // Obtener pagos registrados para este financiamiento
      const pagos = await PagoCuota.find({
        financiamiento: financiamiento._id,
        estadoPago: 'confirmado',
      }).select('numeroCuota esExtra montoPago');

      const pagosPorCuota: { [key: number]: number } = {};
      pagos
        .filter(p => !p.esExtra && p.numeroCuota)
        .forEach(pago => {
          const numCuota = pago.numeroCuota!;
          if (!pagosPorCuota[numCuota]) {
            pagosPorCuota[numCuota] = 0;
          }
          pagosPorCuota[numCuota] += pago.montoPago;
        });

      const numerosCuotasPagadas = new Set(
        Object.keys(pagosPorCuota).map(Number)
      );

      // Verificar si tiene cuotasFuturas
      if (financiamiento.cuotasFuturas && financiamiento.cuotasFuturas.length > 0) {
        // Verificar cuotas vencidas
        financiamiento.cuotasFuturas.forEach(cuota => {
          const fechaVencimiento = new Date(cuota.fechaVencimiento);
          fechaVencimiento.setHours(0, 0, 0, 0);
          
          // Calcular el monto pagado para esta cuota
          const montoPagado = pagosPorCuota[cuota.numeroCuota] || 0;
          const estaPagada = montoPagado >= cuota.valorCuota;
          
          // La cuota está atrasada si:
          // 1. La fecha de vencimiento es anterior a hoy
          // 2. No está completamente pagada
          if (fechaVencimiento < hoy && !estaPagada) {
            const diasAtraso = Math.floor(
              (hoy.getTime() - fechaVencimiento.getTime()) / (1000 * 60 * 60 * 24)
            );

            cuotasAtrasadas.push({
              numeroCuota: cuota.numeroCuota,
              fechaVencimiento,
              valorCuota: cuota.valorCuota,
              financiamientoId: financiamiento._id?.toString() || '',
              cliente: financiamiento.cliente,
              vehiculo: financiamiento.vehiculo,
              empresa: financiamiento.empresa,
              diasAtraso,
            });
          }
        });
      } else {
        // Si no tiene cuotasFuturas, calcular las fechas basándome en fechaPrimeraCuota
        const fechaPrimera = new Date(financiamiento.fechaPrimeraCuota);
        fechaPrimera.setHours(0, 0, 0, 0);

        for (let i = 1; i <= financiamiento.cuotas; i++) {
          const fechaVencimiento = new Date(fechaPrimera);
          fechaVencimiento.setMonth(fechaVencimiento.getMonth() + i - 1);
          fechaVencimiento.setHours(0, 0, 0, 0);

          // Calcular el monto pagado para esta cuota
          const montoPagado = pagosPorCuota[i] || 0;
          const estaPagada = montoPagado >= financiamiento.valorCuota;

          // Si la cuota está vencida y no está pagada
          if (fechaVencimiento < hoy && !estaPagada) {
            const diasAtraso = Math.floor(
              (hoy.getTime() - fechaVencimiento.getTime()) / (1000 * 60 * 60 * 24)
            );

            cuotasAtrasadas.push({
              numeroCuota: i,
              fechaVencimiento,
              valorCuota: financiamiento.valorCuota,
              financiamientoId: financiamiento._id?.toString() || '',
              cliente: financiamiento.cliente,
              vehiculo: financiamiento.vehiculo,
              empresa: financiamiento.empresa,
              diasAtraso,
            });
          }
        }
      }
    }

    // Ordenar por fecha de vencimiento (más antiguas primero)
    cuotasAtrasadas.sort((a, b) => {
      const fechaA = a.fechaVencimiento instanceof Date 
        ? a.fechaVencimiento 
        : new Date(a.fechaVencimiento);
      const fechaB = b.fechaVencimiento instanceof Date 
        ? b.fechaVencimiento 
        : new Date(b.fechaVencimiento);
      return fechaA.getTime() - fechaB.getTime();
    });

    return NextResponse.json(cuotasAtrasadas);
  } catch (error) {
    console.error('Error obteniendo cuotas atrasadas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

