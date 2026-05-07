import { connectDB } from '@/db/dbConnection';
import Financiamiento from '@/models/financiamiento';
import Cliente from '@/models/cliente';
import Vehiculo from '@/models/vehiculo';
import Empresa from '@/models/empresa';
import { NextResponse, NextRequest } from 'next/server';
import { getUserIdFromToken, parseLocalDate } from '@/lib/server-utils';

// Forzar registro de modelos para populate (evita MissingSchemaError)
void Cliente;
void Vehiculo;
void Empresa;

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    
    // Parámetros de paginación
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    // Parámetros de filtro
    const estado = searchParams.get('estado') || '';
    
    // Construir query base
    let query: any = {};
    
    // Filtro por estado si existe
    if (estado) {
      query.estadoFinanciamiento = estado;
    }
    
    // Nota: La búsqueda de texto se hace en el cliente (frontend) para mejor rendimiento
    
    // Obtener financiamientos con paginación y populate optimizado
    const financiamientos = await Financiamiento.find(query)
      .populate('cliente', 'NOMBRE TELEFONO cedula correo DIRECCION profesion')
      .populate('cliente2', 'NOMBRE TELEFONO cedula correo DIRECCION profesion')
      .populate('vehiculo', 'Marca Modelo Matricula Padron Año Color Descripcion disponible')
      .populate('empresa', 'nombre descripcion telefono')
      .sort({ fechaVenta: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Usar lean() para mejor rendimiento
    
    // Contar total de documentos que coinciden con el query
    const total = await Financiamiento.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: financiamientos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
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

    // Manejar segundo cliente (si existe)
    let cliente2Id = body.cliente2;
    if (
      body.clientes &&
      Array.isArray(body.clientes) &&
      body.clientes.length > 1
    ) {
      // Si viene en el array de clientes, usar el segundo elemento
      const segundoCliente = body.clientes[1];
      if (typeof segundoCliente === 'object' && segundoCliente.NOMBRE) {
        // Es un cliente nuevo, crearlo en la base de datos
        const nuevoCliente2 = new Cliente({
          ...segundoCliente,
          usuarioCreacion: userId,
          usuarioModificacion: userId,
        });
        const cliente2Guardado = await nuevoCliente2.save();
        cliente2Id = cliente2Guardado._id.toString();
      } else if (typeof segundoCliente === 'string') {
        cliente2Id = segundoCliente;
      }
    } else if (body.cliente2) {
      cliente2Id = body.cliente2;
      if (typeof body.cliente2 === 'object' && body.cliente2.NOMBRE) {
        // Es un cliente nuevo, crearlo en la base de datos
        const nuevoCliente2 = new Cliente({
          ...body.cliente2,
          usuarioCreacion: userId,
          usuarioModificacion: userId,
        });
        const cliente2Guardado = await nuevoCliente2.save();
        cliente2Id = cliente2Guardado._id.toString();
      }
    }

    // Manejar costoVehiculo y valorBase (compatibilidad)
    const costoVehiculo = body.costoVehiculo || body.valorBase || 0;
    const valorBase = body.valorBase || body.costoVehiculo || 0;

    // Calcular fechas y montos (usando parseLocalDate para evitar desfase de timezone)
    const fechaPrimeraCuota = parseLocalDate(body.fechaPrimeraCuota);

    // Si hay cuotasFuturas, usar la última fecha de ahí, sino calcular
    let fechaUltimaCuota = new Date(fechaPrimeraCuota);
    if (body.cuotasFuturas && body.cuotasFuturas.length > 0) {
      const ultimaCuota = body.cuotasFuturas[body.cuotasFuturas.length - 1];
      fechaUltimaCuota = parseLocalDate(ultimaCuota.fechaVencimiento);
    } else {
      fechaUltimaCuota.setMonth(fechaUltimaCuota.getMonth() + body.cuotas - 1);
    }

    // Crear nuevo financiamiento
    const nuevoFinanciamiento = new Financiamiento({
      cliente: clienteId,
      cliente2: cliente2Id || undefined, // Segundo cliente opcional
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
            fechaVencimiento: parseLocalDate(cf.fechaVencimiento),
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
      fechaVenta: body.fechaVenta ? parseLocalDate(body.fechaVenta) : new Date(),
      usuarioRegistro: body.usuarioRegistro || userId,
      usuarioCreacion: body.usuarioRegistro || userId,
      usuarioModificacion: userId,
    });

    const financiamientoGuardado = await nuevoFinanciamiento.save();

    // Si se asignó un vehículo, marcarlo como no disponible
    if (body.vehiculo) {
      await Vehiculo.findByIdAndUpdate(body.vehiculo, {
        disponible: false,
        usuarioModificacion: userId,
      });
    }

    // Devolver el financiamiento con información poblada
    const financiamientoCompleto = await Financiamiento.findById(
      financiamientoGuardado._id
    )
      .populate('cliente', 'NOMBRE TELEFONO cedula correo DIRECCION profesion')
      .populate('cliente2', 'NOMBRE TELEFONO cedula correo DIRECCION profesion')
      .populate(
        'vehiculo',
        'Marca Modelo Matricula Padron Año Color Descripcion disponible'
      )
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

    // Buscar el financiamiento antes de eliminarlo para obtener el vehículo
    const financiamiento = await Financiamiento.findById(id);

    if (!financiamiento) {
      return NextResponse.json(
        { error: 'Financiamiento no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar el financiamiento
    await Financiamiento.findByIdAndDelete(id);

    // Si tenía un vehículo asignado, marcarlo como disponible nuevamente
    if (financiamiento.vehiculo) {
      const userId = getUserIdFromToken(request) || '68f83df25d5fc999682c6dfb';
      await Vehiculo.findByIdAndUpdate(financiamiento.vehiculo, {
        disponible: true,
        usuarioModificacion: userId,
      });
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

