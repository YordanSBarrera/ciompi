import { connectDB } from '@/db/dbConnection';
import Usuario from '@/models/Usuario';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-clave-secreta-super-segura';

export async function POST(request: Request) {
  try {
    await connectDB();

    const { usuario, password } = await request.json();

    // Validaciones básicas
    if (!usuario || !password) {
      return NextResponse.json(
        { error: 'Usuario y contraseña son requeridos' },
        { status: 400 }
      );
    }

    if (usuario.length < 3) {
      return NextResponse.json(
        { error: 'El usuario debe tener al menos 3 caracteres' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Buscar usuario en la base de datos
    const usuarioEncontrado = await Usuario.findOne({
      usuario: usuario.toLowerCase().trim(),
    });

    if (!usuarioEncontrado) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Verificar si el usuario está activo
    if (usuarioEncontrado.estado !== 'activo') {
      return NextResponse.json(
        { error: 'Usuario inactivo. Contacta al administrador.' },
        { status: 401 }
      );
    }

    // Verificar contraseña
    const passwordValida = await usuarioEncontrado.compararPassword(password);

    if (!passwordValida) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id: usuarioEncontrado._id,
        usuario: usuarioEncontrado.usuario,
        rol: usuarioEncontrado.rol,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Datos del usuario sin la contraseña
    const usuarioData = {
      id: usuarioEncontrado._id,
      usuario: usuarioEncontrado.usuario,
      nombre: usuarioEncontrado.nombre,
      email: usuarioEncontrado.email,
      avatar: usuarioEncontrado.avatar,
      rol: usuarioEncontrado.rol,
      estado: usuarioEncontrado.estado,
      fechaCreacion: usuarioEncontrado.fechaCreacion,
      fechaActualizacion: usuarioEncontrado.fechaActualizacion,
    };

    return NextResponse.json({
      success: true,
      message: 'Login exitoso',
      token,
      usuario: usuarioData,
    });
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
