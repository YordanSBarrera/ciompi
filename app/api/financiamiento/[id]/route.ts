import { connectDB } from '@/db/dbConnection';
import Financiamiento from '@/models/financiamiento';
import Vehiculo from '@/models/vehiculo';
import { NextRequest, NextResponse } from 'next/server';
import { parseLocalDate, requireAdminAuth } from '@/lib/server-utils';
import { normalizarMoneda } from '@/lib/moneda';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const financiamiento = await Financiamiento.findById(id)
      .populate('cliente', 'NOMBRE TELEFONO cedula correo DIRECCION profesion')
      .populate('cliente2', 'NOMBRE TELEFONO cedula correo DIRECCION profesion')
      .populate(
        'vehiculo',
        'Marca Modelo Matricula Padron Año Color Descripcion disponible'
      )
      .populate('empresa', 'nombre descripcion telefono')
      .populate('usuarioRegistro', 'nombre usuario email')
      .populate('usuarioCreacion', 'nombre usuario email')
      .populate('usuarioModificacion', 'nombre usuario email');

    if (!financiamiento) {
      return NextResponse.json(
        { message: 'Financiamiento no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(financiamiento);
  } catch (error: any) {
    console.error('Error obteniendo financiamiento:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAdminAuth(request);
    if (!auth.authorized) {
      return auth.response;
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();

    // Buscar el financiamiento existente
    const financiamientoExistente = await Financiamiento.findById(id);

    if (!financiamientoExistente) {
      return NextResponse.json(
        { error: 'Financiamiento no encontrado' },
        { status: 404 }
      );
    }

    const userId = auth.user.id;

    // Si viene un modo simple (solo actualizar campos básicos), usar la lógica anterior
    if (body.modoSimple === true) {
      const camposPermitidos = [
        'estadoFinanciamiento',
        'observaciones',
        'cuotasPagadas',
        'montoPagado',
        'saldoPendiente',
        'cuotasPendientes',
      ];

      const datosActualizados: any = {};
      for (const campo of camposPermitidos) {
        if (body[campo] !== undefined) {
          datosActualizados[campo] = body[campo];
        }
      }

      // Si se actualiza cuotasPagadas o montoPagado, recalcular otros campos
      if (
        datosActualizados.cuotasPagadas !== undefined ||
        datosActualizados.montoPagado !== undefined
      ) {
        const cuotasPagadas =
          datosActualizados.cuotasPagadas ??
          financiamientoExistente.cuotasPagadas;
        const montoPagado =
          datosActualizados.montoPagado ?? financiamientoExistente.montoPagado;

        // Calcular total de cuotas incluyendo extras
        const cuotasTotales =
          financiamientoExistente.cuotas +
          (financiamientoExistente.cuotasExtras || 0);

        datosActualizados.cuotasPendientes = Math.max(
          0,
          cuotasTotales - cuotasPagadas
        );
        datosActualizados.saldoPendiente = Math.max(
          0,
          financiamientoExistente.montoTotal - montoPagado
        );

        // Verificar si está finalizado (incluyendo cuotas extras)
        if (
          cuotasPagadas >= cuotasTotales ||
          montoPagado >= financiamientoExistente.montoTotal
        ) {
          datosActualizados.estadoFinanciamiento = 'finalizado';
          datosActualizados.cuotasPendientes = 0;
          datosActualizados.saldoPendiente = 0;
        }
      }

      datosActualizados.usuarioModificacion = userId;

      const financiamientoActualizado = await Financiamiento.findByIdAndUpdate(
        id,
        datosActualizados,
        { new: true, runValidators: true }
      )
        .populate(
          'cliente',
          'NOMBRE TELEFONO cedula correo DIRECCION profesion'
        )
        .populate(
          'cliente2',
          'NOMBRE TELEFONO cedula correo DIRECCION profesion'
        )
        .populate(
          'vehiculo',
          'Marca Modelo Matricula Padron Año Color Descripcion disponible'
        )
        .populate('empresa', 'nombre descripcion telefono')
        .populate('usuarioRegistro', 'nombre usuario')
        .populate('usuarioCreacion', 'nombre usuario email')
        .populate('usuarioModificacion', 'nombre usuario email');

      return NextResponse.json(financiamientoActualizado);
    }

    // Modo completo: actualizar todos los campos del financiamiento
    // Manejar cliente (si viene como objeto, actualizarlo o crearlo)
    let clienteId = body.cliente;
    if (typeof body.cliente === 'object' && body.cliente.NOMBRE) {
      // Si tiene _id, actualizar; si no, crear nuevo
      if (body.cliente._id) {
        const Cliente = (await import('@/models/cliente')).default;
        await Cliente.findByIdAndUpdate(body.cliente._id, {
          ...body.cliente,
          usuarioModificacion: userId,
        });
        clienteId = body.cliente._id;
      } else {
        const Cliente = (await import('@/models/cliente')).default;
        const nuevoCliente = new Cliente({
          ...body.cliente,
          usuarioCreacion: userId,
          usuarioModificacion: userId,
        });
        const clienteGuardado = await nuevoCliente.save();
        clienteId = clienteGuardado._id.toString();
      }
    } else if (typeof body.cliente === 'string') {
      clienteId = body.cliente;
    } else {
      clienteId = financiamientoExistente.cliente.toString();
    }

    // Manejar segundo cliente (si existe)
    let cliente2Id = body.cliente2;
    if (
      body.clientes &&
      Array.isArray(body.clientes) &&
      body.clientes.length > 1
    ) {
      const segundoCliente = body.clientes[1];
      if (typeof segundoCliente === 'object' && segundoCliente.NOMBRE) {
        const Cliente = (await import('@/models/cliente')).default;
        if (segundoCliente._id) {
          await Cliente.findByIdAndUpdate(segundoCliente._id, {
            ...segundoCliente,
            usuarioModificacion: userId,
          });
          cliente2Id = segundoCliente._id;
        } else {
          const nuevoCliente2 = new Cliente({
            ...segundoCliente,
            usuarioCreacion: userId,
            usuarioModificacion: userId,
          });
          const cliente2Guardado = await nuevoCliente2.save();
          cliente2Id = cliente2Guardado._id.toString();
        }
      } else if (typeof segundoCliente === 'string') {
        cliente2Id = segundoCliente;
      }
    } else if (body.cliente2) {
      if (typeof body.cliente2 === 'object' && body.cliente2.NOMBRE) {
        const Cliente = (await import('@/models/cliente')).default;
        if (body.cliente2._id) {
          await Cliente.findByIdAndUpdate(body.cliente2._id, {
            ...body.cliente2,
            usuarioModificacion: userId,
          });
          cliente2Id = body.cliente2._id;
        } else {
          const nuevoCliente2 = new Cliente({
            ...body.cliente2,
            usuarioCreacion: userId,
            usuarioModificacion: userId,
          });
          const cliente2Guardado = await nuevoCliente2.save();
          cliente2Id = cliente2Guardado._id.toString();
        }
      } else if (typeof body.cliente2 === 'string') {
        cliente2Id = body.cliente2;
      }
    } else {
      cliente2Id = financiamientoExistente.cliente2?.toString() || undefined;
    }

    // Manejar vehículo
    const vehiculoAnterior = financiamientoExistente.vehiculo?.toString();
    const vehiculoNuevo = body.vehiculo || undefined;

    // Si cambió el vehículo, actualizar disponibilidad
    if (vehiculoAnterior !== vehiculoNuevo) {
      // Marcar el vehículo anterior como disponible
      if (vehiculoAnterior) {
        await Vehiculo.findByIdAndUpdate(vehiculoAnterior, {
          disponible: true,
          usuarioModificacion: userId,
        });
      }
      // Marcar el nuevo vehículo como no disponible
      if (vehiculoNuevo) {
        await Vehiculo.findByIdAndUpdate(vehiculoNuevo, {
          disponible: false,
          usuarioModificacion: userId,
        });
      }
    }

    // Manejar costoVehiculo y valorBase
    const costoVehiculo =
      body.costoVehiculo ??
      body.valorBase ??
      financiamientoExistente.costoVehiculo;
    const valorBase =
      body.valorBase ??
      body.costoVehiculo ??
      financiamientoExistente.valorBase ??
      costoVehiculo;

    // Calcular fechas (usando parseLocalDate para evitar desfase de timezone)
    const fechaPrimeraCuota = body.fechaPrimeraCuota
      ? parseLocalDate(body.fechaPrimeraCuota)
      : financiamientoExistente.fechaPrimeraCuota;

    let fechaUltimaCuota = financiamientoExistente.fechaUltimaCuota;
    if (body.cuotasFuturas && body.cuotasFuturas.length > 0) {
      const ultimaCuota = body.cuotasFuturas[body.cuotasFuturas.length - 1];
      fechaUltimaCuota = parseLocalDate(ultimaCuota.fechaVencimiento);
    } else if (body.cuotas && body.fechaPrimeraCuota) {
      fechaUltimaCuota = new Date(fechaPrimeraCuota);
      fechaUltimaCuota.setMonth(
        fechaUltimaCuota.getMonth() +
          (body.cuotas || financiamientoExistente.cuotas) -
          1
      );
    }

    // Preparar datos actualizados
    const datosActualizados: any = {
      cliente: clienteId,
      cliente2: cliente2Id || undefined,
      vehiculo: vehiculoNuevo,
      empresa: body.empresa ?? financiamientoExistente.empresa,
      moneda:
        body.moneda !== undefined
          ? normalizarMoneda(body.moneda)
          : normalizarMoneda(financiamientoExistente.moneda),
      costoVehiculo,
      valorBase,
      costosDocumentacion:
        body.costosDocumentacion ??
        financiamientoExistente.costosDocumentacion ??
        0,
      gastosExtras:
        body.gastosExtras ?? financiamientoExistente.gastosExtras ?? 0,
      cuotasExtras:
        body.cuotasExtras ?? financiamientoExistente.cuotasExtras ?? 0,
      cuotas: body.cuotas ?? financiamientoExistente.cuotas,
      valorCuota: body.valorCuota ?? financiamientoExistente.valorCuota,
      interesTotal: body.interesTotal ?? financiamientoExistente.interesTotal,
      montoTotal: body.montoTotal ?? financiamientoExistente.montoTotal,
      fechaPrimeraCuota,
      fechaUltimaCuota,
      fechaVenta: body.fechaVenta
        ? parseLocalDate(body.fechaVenta)
        : financiamientoExistente.fechaVenta,
      observaciones:
        body.observaciones ?? financiamientoExistente.observaciones,
      usuarioModificacion: userId,
    };

    // Actualizar cuotasFuturas si vienen (usando parseLocalDate para evitar desfase)
    if (body.cuotasFuturas) {
      datosActualizados.cuotasFuturas = body.cuotasFuturas.map((cf: any) => ({
        numeroCuota: cf.numeroCuota,
        fechaVencimiento: parseLocalDate(cf.fechaVencimiento),
        valorCuota: cf.valorCuota,
      }));
    }

    // Recalcular cuotasPendientes y saldoPendiente incluyendo cuotas extras
    const cuotasPagadas = financiamientoExistente.cuotasPagadas || 0;
    const montoPagado = financiamientoExistente.montoPagado || 0;

    // Calcular total de cuotas (normales + extras)
    const cuotasTotales =
      datosActualizados.cuotas + (datosActualizados.cuotasExtras || 0);
    datosActualizados.cuotasPendientes = Math.max(
      0,
      cuotasTotales - cuotasPagadas
    );
    datosActualizados.saldoPendiente = Math.max(
      0,
      datosActualizados.montoTotal - montoPagado
    );

    // Recalcular estado del financiamiento
    // Si todas las cuotas (incluyendo extras) están pagadas o el monto pagado >= monto total, está finalizado
    if (
      cuotasPagadas >= cuotasTotales ||
      montoPagado >= datosActualizados.montoTotal
    ) {
      datosActualizados.estadoFinanciamiento = 'finalizado';
      datosActualizados.cuotasPendientes = 0;
      datosActualizados.saldoPendiente = 0;
    } else {
      // Si no está finalizado, verificar si hay cuotas vencidas para determinar si está en_mora
      // Para esto necesitamos consultar los pagos, pero por ahora mantenemos 'activo'
      // a menos que el estado actual sea 'cancelado' (no lo cambiamos)
      if (financiamientoExistente.estadoFinanciamiento !== 'cancelado') {
        // Verificar si hay cuotas vencidas consultando las cuotasFuturas
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        let tieneCuotasVencidas = false;

        if (
          datosActualizados.cuotasFuturas &&
          datosActualizados.cuotasFuturas.length > 0
        ) {
          // Buscar la primera cuota no pagada que esté vencida
          for (
            let i = cuotasPagadas;
            i < datosActualizados.cuotasFuturas.length;
            i++
          ) {
            const cuota = datosActualizados.cuotasFuturas[i];
            const fechaVenc = new Date(cuota.fechaVencimiento);
            fechaVenc.setHours(0, 0, 0, 0);

            if (fechaVenc < hoy) {
              tieneCuotasVencidas = true;
              break;
            }
          }
        } else if (datosActualizados.fechaPrimeraCuota) {
          // Si no hay cuotasFuturas, verificar la primera cuota pendiente
          const fechaPrimeraPendiente = new Date(
            datosActualizados.fechaPrimeraCuota
          );
          fechaPrimeraPendiente.setMonth(
            fechaPrimeraPendiente.getMonth() + cuotasPagadas
          );
          fechaPrimeraPendiente.setHours(0, 0, 0, 0);

          if (fechaPrimeraPendiente < hoy) {
            tieneCuotasVencidas = true;
          }
        }

        datosActualizados.estadoFinanciamiento = tieneCuotasVencidas
          ? 'en_mora'
          : 'activo';
      }
      // Si está cancelado, mantenemos el estado cancelado
    }

    const financiamientoActualizado = await Financiamiento.findByIdAndUpdate(
      id,
      datosActualizados,
      { new: true, runValidators: true }
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

    return NextResponse.json(financiamientoActualizado);
  } catch (error: any) {
    console.error('Error actualizando financiamiento:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAdminAuth(request);
    if (!auth.authorized) {
      return auth.response;
    }

    await connectDB();
    const { id } = await params;

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
      const userId = auth.user.id;
      await Vehiculo.findByIdAndUpdate(financiamiento.vehiculo, {
        disponible: true,
        usuarioModificacion: userId,
      });
    }

    return NextResponse.json({
      message: 'Financiamiento eliminado correctamente',
    });
  } catch (error: any) {
    console.error('Error eliminando financiamiento:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
