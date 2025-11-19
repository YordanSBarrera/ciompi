import { connectDB } from '@/db/dbConnection';
import { getUserIdFromToken } from '@/lib/server-utils';
import Usuario from '@/models/Usuario';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

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
    await connectDB();
    const { id } = await params;

    // Obtener ID del usuario desde el token con fallback
    const userId = getUserIdFromToken(request) || '68f83df25d5fc999682c6dfb';
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

// DELETE - Eliminar usuario
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const usuarioEliminado = await Usuario.findByIdAndDelete(id);

    if (!usuarioEliminado) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

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
