import jwt from 'jsonwebtoken';

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
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      userId: string;
    };
    return decoded.id;
  } catch (error) {
    console.error('Error verificando token:', error);
    return null;
  }
}
