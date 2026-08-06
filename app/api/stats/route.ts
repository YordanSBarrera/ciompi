import { connectDB } from '@/db/dbConnection';
import { NextResponse } from 'next/server';
import Cliente from '@/models/cliente';
import Vehiculo from '@/models/vehiculo';
import Financiamiento from '@/models/financiamiento';
import Empresa from '@/models/empresa';
import Usuario from '@/models/Usuario';

export async function GET() {
  try {
    await connectDB();

    // Estadísticas generales
    const [
      totalClientes,
      totalVehiculos,
      totalFinanciamientos,
      totalEmpresas,
      totalUsuarios,
      financiamientosActivos,
      financiamientosFinalizados,
      financiamientosCancelados,
      financiamientosEnMora,
    ] = await Promise.all([
      Cliente.countDocuments(),
      Vehiculo.countDocuments(),
      Financiamiento.countDocuments(),
      Empresa.countDocuments({ estado: 'activa' }),
      Usuario.countDocuments({ estado: 'activo' }),
      Financiamiento.countDocuments({ estadoFinanciamiento: 'activo' }),
      Financiamiento.countDocuments({ estadoFinanciamiento: 'finalizado' }),
      Financiamiento.countDocuments({ estadoFinanciamiento: 'cancelado' }),
      Financiamiento.countDocuments({ estadoFinanciamiento: 'en_mora' }),
    ]);

    // Estadísticas de financiamientos (por moneda; histórico sin campo → USD)
    const financiamientosData = await Financiamiento.find().select(
      'montoTotal saldoPendiente montoPagado moneda estadoFinanciamiento'
    );
    type Acum = {
      montoTotal: number;
      saldoPendiente: number;
      montoRecaudado: number;
      cantidad: number;
    };
    type MontosPorMoneda = Record<'USD' | 'UYU', Acum>;

    const crearAcumVacio = (): Acum => ({
      montoTotal: 0,
      saldoPendiente: 0,
      montoRecaudado: 0,
      cantidad: 0,
    });
    const crearMontosPorMoneda = (): MontosPorMoneda => ({
      USD: crearAcumVacio(),
      UYU: crearAcumVacio(),
    });

    // Todos los financiamientos
    const montosPorMoneda = crearMontosPorMoneda();
    // Vigentes: activos + en mora (aún se cobran)
    const montosVigentesPorMoneda = crearMontosPorMoneda();
    // Solo activos
    const montosActivosPorMoneda = crearMontosPorMoneda();
    // Solo en mora
    const montosEnMoraPorMoneda = crearMontosPorMoneda();

    const acumular = (
      acc: MontosPorMoneda,
      moneda: 'USD' | 'UYU',
      montoTotal: number,
      saldoPendiente: number,
      montoPagado: number
    ) => {
      acc[moneda].montoTotal += montoTotal;
      acc[moneda].saldoPendiente += saldoPendiente;
      acc[moneda].montoRecaudado += montoPagado;
      acc[moneda].cantidad += 1;
    };

    for (const f of financiamientosData) {
      const m =
        f.moneda === 'UYU' ? 'UYU' : 'USD';
      const mt = f.montoTotal || 0;
      const sp = f.saldoPendiente || 0;
      const pag = f.montoPagado || 0;
      acumular(montosPorMoneda, m, mt, sp, pag);

      const estado = f.estadoFinanciamiento;
      if (estado === 'activo' || estado === 'en_mora') {
        acumular(montosVigentesPorMoneda, m, mt, sp, pag);
      }
      if (estado === 'activo') {
        acumular(montosActivosPorMoneda, m, mt, sp, pag);
      }
      if (estado === 'en_mora') {
        acumular(montosEnMoraPorMoneda, m, mt, sp, pag);
      }
    }

    // Clientes y vehículos creados hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const clientesHoy = await Cliente.countDocuments({
      createdAt: { $gte: hoy },
    });
    const vehiculosHoy = await Vehiculo.countDocuments({
      createdAt: { $gte: hoy },
    });

    // Financiamientos creados hoy
    const financiamientosHoy = await Financiamiento.countDocuments({
      fechaVenta: { $gte: hoy },
    });

    return NextResponse.json({
      success: true,
      data: {
        clientes: {
          total: totalClientes,
          hoy: clientesHoy,
        },
        vehiculos: {
          total: totalVehiculos,
          hoy: vehiculosHoy,
        },
        financiamientos: {
          total: totalFinanciamientos,
          activos: financiamientosActivos,
          finalizados: financiamientosFinalizados,
          cancelados: financiamientosCancelados,
          enMora: financiamientosEnMora,
          hoy: financiamientosHoy,
          montosPorMoneda,
          montosVigentesPorMoneda,
          montosActivosPorMoneda,
          montosEnMoraPorMoneda,
        },
        empresas: {
          total: totalEmpresas,
        },
        usuarios: {
          total: totalUsuarios,
        },
      },
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
