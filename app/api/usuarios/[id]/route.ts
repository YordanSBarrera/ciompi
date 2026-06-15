import { connectDB } from '@/db/dbConnection';
import { requireAdminAuth } from '@/lib/server-utils';
import Usuario from '@/models/Usuario';
import Financiamiento from '@/models/financiamiento';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// Forzar registro de modelos para populate
void Financiamiento;

// GET - Obtener usuario por ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const usuario = await Usuario.findById(id).select('-password');

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Obtener información de usuarios de creación y modificación por separado
    let usuarioConInfo = usuario.toObject();

    if (usuario.usuarioCreacion) {
      const usuarioCreacionData = await Usuario.findById(
        usuario.usuarioCreacion
      ).select('nombre usuario email');
      usuarioConInfo.usuarioCreacion = usuarioCreacionData;
    }

    if (usuario.usuarioModificacion) {
      const usuarioModificacionData = await Usuario.findById(
        usuario.usuarioModificacion
      ).select('nombre usuario email');
      usuarioConInfo.usuarioModificacion = usuarioModificacionData;
    }

    return NextResponse.json(usuarioConInfo);
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar usuario
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAdminAuth(request);
    if (!auth.authorized) {
      return auth.response;
    }

    await connectDB();
    const { id } = await params;

    const userId = auth.user.id;
    const body = await request.json();

    // Validar campos requeridos
    if (!body.usuario || !body.email || !body.nombre) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Verificar si el usuario existe
    const usuarioExistente = await Usuario.findById(id);
    if (!usuarioExistente) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si el usuario o email ya existe en otro registro
    const usuarioDuplicado = await Usuario.findOne({
      _id: { $ne: id },
      $or: [{ usuario: body.usuario }, { email: body.email }],
    });

    if (usuarioDuplicado) {
      return NextResponse.json(
        { error: 'El usuario o email ya existe' },
        { status: 400 }
      );
    }

    // Preparar los datos de actualización
    const updateData: any = {
      ...body,
      usuarioModificacion: userId,
      fechaActualizacion: new Date(),
    };

    // Si viene un password nuevo, encriptarlo antes de guardar
    if (body.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(body.password, salt);
    }

    // Actualizar usuario con usuarioModificacion
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    // Obtener información de usuarios de creación y modificación
    let usuarioConInfo = usuarioActualizado!.toObject();

    if (usuarioActualizado!.usuarioCreacion) {
      const usuarioCreacionData = await Usuario.findById(
        usuarioActualizado!.usuarioCreacion
      ).select('nombre usuario email');
      usuarioConInfo.usuarioCreacion = usuarioCreacionData;
    }

    if (usuarioActualizado!.usuarioModificacion) {
      const usuarioModificacionData = await Usuario.findById(
        usuarioActualizado!.usuarioModificacion
      ).select('nombre usuario email');
      usuarioConInfo.usuarioModificacion = usuarioModificacionData;
    }

    return NextResponse.json(usuarioConInfo);
  } catch (error) {
    console.error('Error actualizando usuario:', error);
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

// DELETE - Eliminar usuario (soft delete)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAdminAuth(request);
    if (!auth.authorized) {
      return auth.response;
    }

    await connectDB();
    const { id } = await params;

    // Verificar que el usuario existe
    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si ya está eliminado
    if (usuario.eliminado) {
      return NextResponse.json(
        { error: 'El usuario ya fue eliminado anteriormente' },
        { status: 400 }
      );
    }

    // Verificar si está asociado a financiamientos ACTIVOS como usuarioRegistro
    const financiamientoActivo = await Financiamiento.findOne({
      $or: [
        { usuarioRegistro: id },
        { usuarioCreacion: id }
      ],
      estadoFinanciamiento: { $in: ['activo', 'en_mora'] }
    });

    if (financiamientoActivo) {
      return NextResponse.json(
        { 
          error: 'No se puede eliminar el usuario porque tiene financiamientos activos asociados',
          financiamientoId: financiamientoActivo._id 
        },
        { status: 409 } // Conflict
      );
    }

    // Obtener ID del usuario que realiza la eliminación
    const currentUserId = auth.user.id;

    // Verificar que no se está eliminando a sí mismo
    if (id === currentUserId) {
      return NextResponse.json(
        { error: 'No puedes eliminarte a ti mismo' },
        { status: 400 }
      );
    }

    // Soft delete: marcar como eliminado y cambiar estado a inactivo
    const usuarioEliminado = await Usuario.findByIdAndUpdate(
      id,
      {
        eliminado: true,
        fechaEliminacion: new Date(),
        usuarioEliminacion: currentUserId,
        usuarioModificacion: currentUserId,
        estado: 'inactivo',
      },
      { new: true }
    ).select('-password');

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado exitosamente',
      usuario: usuarioEliminado,
    });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json(
        { error: 'Error interno del servidor' },
        { status: 500 }
      );
    }
  }
}
