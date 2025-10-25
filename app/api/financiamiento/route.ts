import { connectDB } from '@/db/dbConnection';
import Financiamiento from '@/models/financiamiento';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();

    // Obtener todos los financiamientos con información de cliente, vehículo y usuario
    const financiamientos = await Financiamiento.find()
      .populate('cliente', 'NOMBRE CODCLI TELEFONO cedula')
      .populate('vehiculo', 'Marca Modelo Matricula Año Color')
      .populate('usuarioRegistro', 'nombre usuario')
      .sort({ fechaVenta: -1 }); // Ordenar por fecha de venta descendente

    return NextResponse.json(financiamientos);
  } catch (error) {
    console.error('Error obteniendo financiamientos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    // Validar datos requeridos
    const requiredFields = [
      'cliente',
      'vehiculo',
      'costoVehiculo',
      'cuotas',
      'valorCuota',
      'interesTotal',
      'montoTotal',
      'fechaPrimeraCuota',
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `El campo ${field} es obligatorio` },
          { status: 400 }
        );
      }
    }

    // Calcular fechas y montos
    const fechaPrimeraCuota = new Date(body.fechaPrimeraCuota);
    const fechaUltimaCuota = new Date(fechaPrimeraCuota);
    fechaUltimaCuota.setMonth(fechaUltimaCuota.getMonth() + body.cuotas - 1);

    // Crear nuevo financiamiento
    const nuevoFinanciamiento = new Financiamiento({
      ...body,
      fechaPrimeraCuota,
      fechaUltimaCuota,
      cuotasPendientes: body.cuotas,
      saldoPendiente: body.montoTotal,
      cuotasPagadas: 0,
      montoPagado: 0,
      estadoFinanciamiento: 'activo',
    });

    const financiamientoGuardado = await nuevoFinanciamiento.save();

    // Devolver el financiamiento con información poblada
    const financiamientoCompleto = await Financiamiento.findById(
      financiamientoGuardado._id
    )
      .populate('cliente', 'NOMBRE CODCLI TELEFONO cedula')
      .populate('vehiculo', 'Marca Modelo Matricula Año Color')
      .populate('usuarioRegistro', 'nombre usuario');

    return NextResponse.json(financiamientoCompleto, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creando financiamiento:', error);
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

export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID del financiamiento es requerido' },
        { status: 400 }
      );
    }

    const financiamientoEliminado = await Financiamiento.findByIdAndDelete(id);

    if (!financiamientoEliminado) {
      return NextResponse.json(
        { error: 'Financiamiento no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Financiamiento eliminado correctamente',
    });
  } catch (error) {
    console.error('Error eliminando financiamiento:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
