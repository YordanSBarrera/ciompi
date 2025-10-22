import { connectDB } from '@/db/dbConnection';
import Usuario from '@/models/Usuario';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();
    const usuarios = await Usuario.find().select('-password');
    return NextResponse.json(usuarios);
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
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

    // Validar campos requeridos
    if (!body.usuario || !body.password || !body.email || !body.nombre) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({
      $or: [{ usuario: body.usuario }, { email: body.email }],
    });

    if (usuarioExistente) {
      return NextResponse.json(
        { error: 'El usuario o email ya existe' },
        { status: 400 }
      );
    }

    const nuevoUsuario = new Usuario(body);
    const usuarioGuardado = await nuevoUsuario.save();

    // Devolver usuario sin password
    const { password, ...usuarioSinPassword } = usuarioGuardado.toObject();

    return NextResponse.json(usuarioSinPassword, { status: 201 });
  } catch (error) {
    console.error('Error creando usuario:', error);
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
