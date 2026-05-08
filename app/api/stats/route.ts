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
      'montoTotal saldoPendiente montoPagado moneda'
    );
    type Acum = { montoTotal: number; saldoPendiente: number; montoRecaudado: number };
    const vacío: Acum = {
      montoTotal: 0,
      saldoPendiente: 0,
      montoRecaudado: 0,
    };
    const montosPorMoneda: Record<'USD' | 'UYU', Acum> = {
      USD: { ...vacío },
      UYU: { ...vacío },
    };
    for (const f of financiamientosData) {
      const m =
        f.moneda === 'UYU' ? 'UYU' : 'USD';
      const mt = f.montoTotal || 0;
      const sp = f.saldoPendiente || 0;
      const pag = f.montoPagado || 0;
      montosPorMoneda[m].montoTotal += mt;
      montosPorMoneda[m].saldoPendiente += sp;
      montosPorMoneda[m].montoRecaudado += pag;
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
