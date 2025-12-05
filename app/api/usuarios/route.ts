import { connectDB } from '@/db/dbConnection';
import { getUserIdFromToken } from '@/lib/server-utils';
import Usuario from '@/models/Usuario';
import Financiamiento from '@/models/financiamiento';
import { NextRequest, NextResponse } from 'next/server';

// Forzar registro de modelos para populate
void Financiamiento;

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const incluirEliminados = searchParams.get('incluirEliminados') === 'true';
    
    // Filtrar usuarios eliminados por defecto
    const query = incluirEliminados ? {} : { eliminado: { $ne: true } };
    
    const usuarios = await Usuario.find(query).select('-password');

    // Obtener información de usuarios de creación y modificación por separado
    const usuariosConInfo = await Promise.all(
      usuarios.map(async usuario => {
        const usuarioObj = usuario.toObject();

        if (usuario.usuarioCreacion) {
          const usuarioCreacionData = await Usuario.findById(
            usuario.usuarioCreacion
          ).select('nombre usuario email');
          usuarioObj.usuarioCreacion = usuarioCreacionData;
        }

        if (usuario.usuarioModificacion) {
          const usuarioModificacionData = await Usuario.findById(
            usuario.usuarioModificacion
          ).select('nombre usuario email');
          usuarioObj.usuarioModificacion = usuarioModificacionData;
        }

        return usuarioObj;
      })
    );

    return NextResponse.json(usuariosConInfo);
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

    // Obtener ID del usuario desde el token
    const userId = getUserIdFromToken(request) || '68f83df25d5fc999682c6dfb'; // Fallback al admin

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

    const nuevoUsuario = new Usuario({
      ...body,
      usuarioCreacion: userId,
      usuarioModificacion: userId,
    });
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
