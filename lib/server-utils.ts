import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

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
