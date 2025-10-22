import { connectDB } from '@/db/dbConnection';
import Usuario from '@/models/Usuario';
import { NextResponse } from 'next/server';

// GET - Obtener usuario por ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const usuario = await Usuario.findById(params.id).select('-password');

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(usuario);
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
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await request.json();

    // Validar campos requeridos
    if (!body.usuario || !body.email || !body.nombre) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Verificar si el usuario existe
    const usuarioExistente = await Usuario.findById(params.id);
    if (!usuarioExistente) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si el usuario o email ya existe en otro registro
    const usuarioDuplicado = await Usuario.findOne({
      _id: { $ne: params.id },
      $or: [{ usuario: body.usuario }, { email: body.email }],
    });

    if (usuarioDuplicado) {
      return NextResponse.json(
        { error: 'El usuario o email ya existe' },
        { status: 400 }
      );
    }

    // Actualizar usuario
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      params.id,
      { ...body, fechaActualizacion: new Date() },
      { new: true, runValidators: true }
    ).select('-password');

    return NextResponse.json(usuarioActualizado);
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
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const usuarioEliminado = await Usuario.findByIdAndDelete(params.id);

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
