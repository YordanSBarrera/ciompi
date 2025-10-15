import { connectDB } from '@/db/dbConnection';
import Usuario from '@/models/Usuario';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request: Request) {
  try {
    if (!JWT_SECRET) {
      return NextResponse.json(
        { error: 'JWT  la clave secreta no esta cargada o no está definida' },
        { status: 500 }
      );
    }
    console.log('Iniciando proceso de login...');
    await connectDB();
    console.log('Base de datos conectada');

    const { usuario, password } = await request.json();
    console.log('Datos recibidos:', { usuario, password: '***' });

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
    console.log('Buscando usuario:', usuario.toLowerCase().trim());
    const usuarioEncontrado = await Usuario.findOne({
      usuario: usuario.toLowerCase().trim(),
    });

    if (!usuarioEncontrado) {
      console.log('Usuario no encontrado');
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }
    console.log('Usuario encontrado:', usuarioEncontrado.usuario);

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
      {
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
