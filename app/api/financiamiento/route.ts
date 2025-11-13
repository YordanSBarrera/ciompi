import { connectDB } from '@/db/dbConnection';
import Financiamiento from '@/models/financiamiento';
import Cliente from '@/models/cliente';
import { NextResponse, NextRequest } from 'next/server';
import { getUserIdFromToken } from '@/lib/server-utils';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Obtener parámetros de búsqueda
    const { searchParams } = new URL(request.url);
    const nombreCliente = searchParams.get('nombreCliente');

    let query = Financiamiento.find();

    // Si hay búsqueda por nombre de cliente, filtrar
    if (nombreCliente && nombreCliente.trim()) {
      // Buscar clientes que coincidan con el nombre
      const clientes = await Cliente.find({
        NOMBRE: { $regex: nombreCliente.trim(), $options: 'i' },
      }).select('_id');

      const clienteIds = clientes.map(c => c._id);

      // Filtrar financiamientos por los IDs de clientes encontrados
      query = query.where('cliente').in(clienteIds);
    }

    // Obtener todos los financiamientos con información de cliente, vehículo, empresa y usuario
    const financiamientos = await query
      .populate('cliente', 'NOMBRE TELEFONO cedula')
      .populate('vehiculo', 'Marca Modelo Matricula Año Color')
      .populate('empresa', 'nombre descripcion telefono')
      .populate('usuarioRegistro', 'nombre usuario')
      .populate('usuarioCreacion', 'nombre usuario email')
      .populate('usuarioModificacion', 'nombre usuario email')
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

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    // Obtener usuario del token
    const userId = getUserIdFromToken(request) || '68f83df25d5fc999682c6dfb';

    // Validar datos requeridos
    const requiredFields = [
      'cliente',
      'empresa',
      'cuotas',
      'valorCuota',
      'interesTotal',
      'montoTotal',
      'fechaPrimeraCuota',
    ];

    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        return NextResponse.json(
          { error: `El campo ${field} es obligatorio` },
          { status: 400 }
        );
      }
    }

    // Validar que haya al menos costoVehiculo o valorBase
    if (!body.costoVehiculo && !body.valorBase) {
      return NextResponse.json(
        { error: 'Debe proporcionar costoVehiculo o valorBase' },
        { status: 400 }
      );
    }

    // Manejar cliente nuevo (si viene como objeto, crearlo)
    let clienteId = body.cliente;
    if (typeof body.cliente === 'object' && body.cliente.NOMBRE) {
      // Es un cliente nuevo, crearlo en la base de datos
      const nuevoCliente = new Cliente({
        ...body.cliente,
        usuarioCreacion: userId,
        usuarioModificacion: userId,
      });
      const clienteGuardado = await nuevoCliente.save();
      clienteId = clienteGuardado._id.toString();
    }

    // Manejar costoVehiculo y valorBase (compatibilidad)
    const costoVehiculo = body.costoVehiculo || body.valorBase || 0;
    const valorBase = body.valorBase || body.costoVehiculo || 0;

    // Calcular fechas y montos
    const fechaPrimeraCuota = new Date(body.fechaPrimeraCuota);
    
    // Si hay cuotasFuturas, usar la última fecha de ahí, sino calcular
    let fechaUltimaCuota = new Date(fechaPrimeraCuota);
    if (body.cuotasFuturas && body.cuotasFuturas.length > 0) {
      const ultimaCuota = body.cuotasFuturas[body.cuotasFuturas.length - 1];
      fechaUltimaCuota = new Date(ultimaCuota.fechaVencimiento);
    } else {
      fechaUltimaCuota.setMonth(
        fechaUltimaCuota.getMonth() + body.cuotas - 1
      );
    }

    // Crear nuevo financiamiento
    const nuevoFinanciamiento = new Financiamiento({
      cliente: clienteId,
      vehiculo: body.vehiculo || undefined, // Opcional
      empresa: body.empresa,
      costoVehiculo: costoVehiculo, // Mantener para compatibilidad
      valorBase: valorBase, // Nuevo campo
      costosDocumentacion: body.costosDocumentacion || 0,
      gastosExtras: body.gastosExtras || 0,
      cuotasExtras: body.cuotasExtras || 0,
      cuotasFuturas: body.cuotasFuturas
        ? body.cuotasFuturas.map((cf: any) => ({
            numeroCuota: cf.numeroCuota,
            fechaVencimiento: new Date(cf.fechaVencimiento),
            valorCuota: cf.valorCuota,
          }))
        : undefined,
      cuotas: body.cuotas,
      valorCuota: body.valorCuota,
      interesTotal: body.interesTotal || 0,
      montoTotal: body.montoTotal || 0,
      fechaPrimeraCuota,
      fechaUltimaCuota,
      cuotasPendientes: body.cuotas + (body.cuotasExtras || 0),
      saldoPendiente: body.montoTotal || 0,
      cuotasPagadas: 0,
      montoPagado: 0,
      estadoFinanciamiento: 'activo',
      observaciones: body.observaciones,
      fechaVenta: body.fechaVenta || new Date(),
      usuarioRegistro: body.usuarioRegistro || userId,
      usuarioCreacion: body.usuarioRegistro || userId,
      usuarioModificacion: userId,
    });

    const financiamientoGuardado = await nuevoFinanciamiento.save();

    // Devolver el financiamiento con información poblada
    const financiamientoCompleto = await Financiamiento.findById(
      financiamientoGuardado._id
    )
      .populate('cliente', 'NOMBRE TELEFONO cedula')
      .populate('vehiculo', 'Marca Modelo Matricula Año Color')
      .populate('empresa', 'nombre descripcion telefono')
      .populate('usuarioRegistro', 'nombre usuario')
      .populate('usuarioCreacion', 'nombre usuario email')
      .populate('usuarioModificacion', 'nombre usuario email');

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
