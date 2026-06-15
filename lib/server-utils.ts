import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { UsuarioRoles } from './const';

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Parsea una fecha string (YYYY-MM-DD) a Date al mediodía local
 * Evita problemas de timezone donde la fecha se guarda 1 día antes
 * @param dateString - Fecha en formato "YYYY-MM-DD" o ISO string
 * @returns Date object al mediodía local
 */
export function parseLocalDate(dateString: string): Date {
  if (!dateString) return new Date();
  // Extraer solo la parte de fecha (YYYY-MM-DD) si viene con tiempo
  const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
  // Crear fecha al mediodía local para evitar desfase de timezone
  return new Date(year, month - 1, day, 12, 0, 0);
}

/**
 * Extrae el ID del usuario del token JWT de la request
 * SOLO USAR EN SERVER-SIDE (API routes, Server Components)
 */
export function getUserIdFromToken(request: Request): string | null {
  const authUser = getAuthUserFromToken(request);
  return authUser?.id || null;
}

export type AuthUserFromToken = {
  id: string;
  usuario?: string;
  rol?: string;
};

/**
 * Extrae usuario autenticado (id/rol) desde JWT.
 * SOLO USAR EN SERVER-SIDE (API routes, Server Components)
 */
export function getAuthUserFromToken(
  request: Request
): AuthUserFromToken | null {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET no está configurado');
    return null;
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserFromToken;
    return decoded;
  } catch (error) {
    console.error('Error verificando token:', error);
    return null;
  }
}

/**
 * Exige usuario autenticado con rol Administrativo para operaciones sensibles.
 */
export function requireAdminAuth(
  request: Request
):
  | { authorized: true; user: AuthUserFromToken }
  | { authorized: false; response: NextResponse } {
  const authUser = getAuthUserFromToken(request);

  if (!authUser?.id) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'No autenticado. Token requerido.' },
        { status: 401 }
      ),
    };
  }

  if (authUser.rol !== UsuarioRoles.Administrativo) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          error: 'Sin permisos para esta operación. Solo rol Administrativo.',
        },
        { status: 403 }
      ),
    };
  }

  return { authorized: true, user: authUser };
}
