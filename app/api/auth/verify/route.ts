import { connectDB } from '@/db/dbConnection';
import Usuario from '@/models/Usuario';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request: Request) {
  try {
    if (!JWT_SECRET) {
      return NextResponse.json(
        { error: 'JWT no esta cargada o no está definida' },
        { status: 500 }
      );
    }
    await connectDB();

    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 400 });
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Buscar usuario en la base de datos
    const usuario = await Usuario.findById(decoded.id);

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 401 }
      );
    }
    if (usuario.estado !== 'activo') {
      return NextResponse.json({ error: 'Usuario inactivo' }, { status: 401 });
    }

    // Datos del usuario sin la contraseña
    const usuarioData = {
      id: usuario._id,
      usuario: usuario.usuario,
      nombre: usuario.nombre,
      email: usuario.email,
      avatar: usuario.avatar,
      rol: usuario.rol,
      estado: usuario.estado,
      fechaCreacion: usuario.fechaCreacion,
      fechaActualizacion: usuario.fechaActualizacion,
    };

    return NextResponse.json({
      success: true,
      usuario: usuarioData,
    });
  } catch (error) {
    console.error('Error verificando token:', error);

    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json({ error: 'Token expirado' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
