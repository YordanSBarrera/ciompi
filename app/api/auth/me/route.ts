import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * GET /api/auth/me
 * Obtiene los datos del usuario autenticado desde el token
 */
export async function GET(request: Request) {
  try {
    if (!JWT_SECRET) {
      return NextResponse.json(
        { error: 'JWT: la clave secreta no está cargada o no está definida' },
        { status: 500 }
      );
    }

    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No autorizado - Token no proporcionado' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        usuario: string;
        rol: string;
      };

      return NextResponse.json({
        success: true,
        usuario: {
          id: decoded.id,
          usuario: decoded.usuario,
          rol: decoded.rol,
        },
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error en /api/auth/me:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
