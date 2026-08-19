import { connectDB } from '@/db/dbConnection';
import { NextRequest, NextResponse } from 'next/server';
import Cliente from '@/models/cliente';
import Vehiculo from '@/models/vehiculo';
import Financiamiento from '@/models/financiamiento';
import Empresa from '@/models/empresa';
import Usuario from '@/models/Usuario';

const hoy = (): Date => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Filtro opcional por empresa
    const { searchParams } = new URL(request.url);
    const empresa = searchParams.get('empresa')?.trim() || '';
    const finFilter = empresa ? { empresa } : {};

    // Estadísticas generales
    const [
      totalFinanciamientos,
      financiamientosActivos,
      financiamientosFinalizados,
      financiamientosCancelados,
      financiamientosEnMora,
      totalEmpresas,
      totalUsuarios,
    ] = await Promise.all([
      Financiamiento.countDocuments(finFilter),
      Financiamiento.countDocuments({
        ...finFilter,
        estadoFinanciamiento: 'activo',
      }),
      Financiamiento.countDocuments({
        ...finFilter,
        estadoFinanciamiento: 'finalizado',
      }),
      Financiamiento.countDocuments({
        ...finFilter,
        estadoFinanciamiento: 'cancelado',
      }),
      Financiamiento.countDocuments({
        ...finFilter,
        estadoFinanciamiento: 'en_mora',
      }),
      Empresa.countDocuments({ estado: 'activa' }),
      Usuario.countDocuments({ estado: 'activo' }),
    ]);

    // Estadísticas de financiamientos (por moneda; histórico sin campo → USD)
    const financiamientosData = await Financiamiento.find(finFilter).select(
      'cliente cliente2 vehiculo empresa montoTotal saldoPendiente montoPagado moneda estadoFinanciamiento'
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

    // Clientes y vehículos asociados a los financiamientos (para el filtro por empresa)
    const clienteIds = new Set<string>();
    const vehiculoIds = new Set<string>();
    for (const f of financiamientosData) {
      if (f.cliente) clienteIds.add(String(f.cliente));
      if (f.cliente2) clienteIds.add(String(f.cliente2));
      if (f.vehiculo) vehiculoIds.add(String(f.vehiculo));

      const m = f.moneda === 'UYU' ? 'UYU' : 'USD';
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

    // Al filtrar por empresa, clientes y vehículos se cuentan solo si aparecen
    // en algún financiamiento de esa empresa
    const clienteFilter = empresa
      ? { _id: { $in: Array.from(clienteIds) } }
      : {};
    const vehiculoFilter = empresa
      ? { _id: { $in: Array.from(vehiculoIds) } }
      : {};

    const [totalClientes, totalVehiculos, clientesHoy, vehiculosHoy] =
      await Promise.all([
        empresa
          ? Cliente.countDocuments(clienteFilter)
          : Cliente.countDocuments(),
        empresa
          ? Vehiculo.countDocuments(vehiculoFilter)
          : Vehiculo.countDocuments(),
        Cliente.countDocuments({
          ...clienteFilter,
          createdAt: { $gte: hoy() },
        }),
        Vehiculo.countDocuments({
          ...vehiculoFilter,
          createdAt: { $gte: hoy() },
        }),
      ]);

    // Financiamientos creados hoy
    const financiamientosHoy = await Financiamiento.countDocuments({
      ...finFilter,
      fechaVenta: { $gte: hoy() },
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