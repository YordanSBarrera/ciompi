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
      .populate('usuarioRegistro', 'nombre usuario')
      .sort({ fechaVenta: -1 });

    // Filtrar financiamientos con cuotas atrasadas
    const financiamientosConAtrasos = [];

    for (const financiamiento of financiamientos) {
      // Obtener pagos registrados para este financiamiento
      const pagos = await PagoCuota.find({
        financiamiento: financiamiento._id,
        estadoPago: 'confirmado',
      }).select('numeroCuota esExtra');

      const numerosCuotasPagadas = new Set(
        pagos.filter(p => !p.esExtra).map(p => p.numeroCuota)
      );

      // Verificar si tiene cuotasFuturas
      if (financiamiento.cuotasFuturas && financiamiento.cuotasFuturas.length > 0) {
        // Verificar cuotas vencidas
        const cuotasAtrasadas = financiamiento.cuotasFuturas.filter(cuota => {
          const fechaVencimiento = new Date(cuota.fechaVencimiento);
          fechaVencimiento.setHours(0, 0, 0, 0);
          
          // La cuota está atrasada si:
          // 1. La fecha de vencimiento es anterior a hoy
          // 2. No hay un pago registrado para esa cuota
          return (
            fechaVencimiento < hoy &&
            !numerosCuotasPagadas.has(cuota.numeroCuota)
          );
        });

        if (cuotasAtrasadas.length > 0) {
          // Calcular información adicional
          const montoAtrasado = cuotasAtrasadas.reduce(
            (sum, cuota) => sum + cuota.valorCuota,
            0
          );

          financiamientosConAtrasos.push({
            ...financiamiento.toObject(),
            cuotasAtrasadas: cuotasAtrasadas.length,
            montoAtrasado,
            cuotasAtrasadasDetalle: cuotasAtrasadas,
          });
        }
      } else {
        // Si no tiene cuotasFuturas, usar cálculo basado en fechaPrimeraCuota
        // Calcular cuántas cuotas deberían haberse pagado hasta hoy
        const fechaPrimeraCuota = new Date(financiamiento.fechaPrimeraCuota);
        fechaPrimeraCuota.setHours(0, 0, 0, 0);

        if (fechaPrimeraCuota <= hoy) {
          // Calcular meses transcurridos desde la primera cuota
          const mesesTranscurridos = Math.max(
            0,
            Math.floor(
              (hoy.getTime() - fechaPrimeraCuota.getTime()) /
                (1000 * 60 * 60 * 24 * 30.44)
            ) + 1
          );

          // Cuotas que deberían haberse pagado
          const cuotasEsperadas = Math.min(
            mesesTranscurridos,
            financiamiento.cuotas
          );

          // Cuotas atrasadas = cuotas esperadas - cuotas pagadas
          const cuotasAtrasadas = Math.max(
            0,
            cuotasEsperadas - financiamiento.cuotasPagadas
          );

          if (cuotasAtrasadas > 0) {
            const montoAtrasado = cuotasAtrasadas * financiamiento.valorCuota;

            financiamientosConAtrasos.push({
              ...financiamiento.toObject(),
              cuotasAtrasadas,
              montoAtrasado,
            });
          }
        }
      }
    }

    return NextResponse.json(financiamientosConAtrasos);
  } catch (error) {
    console.error('Error obteniendo financiamientos con cuotas atrasadas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

