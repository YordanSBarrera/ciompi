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
      financiamientosCompletados,
    ] = await Promise.all([
      Cliente.countDocuments(),
      Vehiculo.countDocuments(),
      Financiamiento.countDocuments(),
      Empresa.countDocuments({ estado: 'activa' }),
      Usuario.countDocuments({ estado: 'activo' }),
      Financiamiento.countDocuments({ estadoFinanciamiento: 'activo' }),
      Financiamiento.countDocuments({ estadoFinanciamiento: 'completado' }),
    ]);

    // Estadísticas de financiamientos
    const financiamientosData = await Financiamiento.find().select(
      'montoTotal saldoPendiente estadoFinanciamiento'
    );
    const montoTotalFinanciado = financiamientosData.reduce(
      (sum, f) => sum + (f.montoTotal || 0),
      0
    );
    const saldoPendienteTotal = financiamientosData.reduce(
      (sum, f) => sum + (f.saldoPendiente || 0),
      0
    );
    const montoRecaudado = montoTotalFinanciado - saldoPendienteTotal;

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
          completados: financiamientosCompletados,
          hoy: financiamientosHoy,
          montoTotal: montoTotalFinanciado,
          saldoPendiente: saldoPendienteTotal,
          montoRecaudado: montoRecaudado,
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
