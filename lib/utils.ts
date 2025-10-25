/**
 * Valida si una cédula tiene exactamente 8 dígitos
 * @param cedula - Número de cédula a validar
 * @returns true si es válida, false si no
 */
export const validateCedula = (cedula: string): boolean => {
  // Remover espacios y caracteres no numéricos
  const cleanCedula = cedula.replace(/\D/g, '');

  // Verificar que tenga exactamente 8 dígitos
  return cleanCedula.length === 8 && /^\d{8}$/.test(cleanCedula);
};

/**
 * Formatea una cédula al formato #.###.###-#
 * @param cedula - Número de cédula a formatear
 * @returns Cédula formateada o string vacío si no es válida
 */
export const formatCedula = (cedula: string): string => {
  // Remover espacios y caracteres no numéricos
  const cleanCedula = cedula.replace(/\D/g, '');

  // Si no tiene 8 dígitos, retornar como está
  if (cleanCedula.length !== 8) {
    return cedula;
  }

  // Formatear: #.###.###-#
  return `${cleanCedula[0]}.${cleanCedula.slice(1, 4)}.${cleanCedula.slice(4, 7)}-${cleanCedula[7]}`;
};

/**
 * Limpia una cédula formateada para obtener solo los números
 * @param cedula - Cédula formateada
 * @returns Solo los números de la cédula
 */
export const cleanCedula = (cedula: string): string => {
  return cedula.replace(/\D/g, '');
};

/**
 * Maneja el cambio de input para cédula con formato automático
 * @param value - Valor del input
 * @param maxLength - Longitud máxima permitida (por defecto 8)
 * @returns Valor formateado
 */
export const handleCedulaInput = (
  value: string,
  maxLength: number = 8
): string => {
  // Remover caracteres no numéricos
  const numericValue = value.replace(/\D/g, '');

  // Limitar a la longitud máxima
  const limitedValue = numericValue.slice(0, maxLength);

  // Si tiene 8 dígitos, formatear
  if (limitedValue.length === 8) {
    return formatCedula(limitedValue);
  }

  // Si no, retornar solo números
  return limitedValue;
};

export enum Roles {
  admin = 'admin',
  user = 'user',
  Administrativo = 'Administrativo',
  Usuario = 'Usuario',
}

export const isAdmin = (role: string): boolean => {
  return role === Roles.admin || role === Roles.Administrativo;
};

export const isUser = (role: string): boolean => {
  return role === Roles.user || role === Roles.Usuario;
};
