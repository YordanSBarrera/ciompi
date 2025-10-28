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
  Administrativo = 'Administrativo',
  Usuario = 'Usuario',
}

export const isAdmin = (role: string): boolean => {
  return role === Roles.Administrativo;
};

export const isUser = (role: string): boolean => {
  return role === Roles.Usuario;
};

/**
 * Obtiene los datos del usuario logueado desde localStorage
 * @returns Datos del usuario o null si no está autenticado
 */
export const getCurrentUser = (): {
  id: string;
  usuario: string;
  nombre: string;
  email: string;
  avatar: string;
  rol: string;
  estado: string;
} | null => {
  // Verificar si hay un usuario en localStorage
  const savedUser = localStorage.getItem('user');

  if (!savedUser) {
    return null;
  }

  try {
    const user = JSON.parse(savedUser);
    return user;
  } catch (error) {
    console.error('Error parseando datos del usuario:', error);
    return null;
  }
};

/**
 * Obtiene el ID del usuario logueado
 * @returns ID del usuario o null si no está autenticado
 */
export const getCurrentUserId = (): string | null => {
  const user = getCurrentUser();
  return user?.id || null;
};

/**
 * Verifica si hay un usuario autenticado
 * @returns true si hay un usuario autenticado, false si no
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

/**
 * Obtiene el token de autenticación
 * @returns Token JWT o null si no está autenticado
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Crea headers con autenticación para fetch
 * @returns Headers con el token de autenticación
 */
export const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();

  if (!token) {
    return {};
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const marcaVehiculos = [
  'Toyota',
  'Volkswagen',
  'Chevrolet',
  'Ford',
  'Fiat',
  'Renault',
  'Nissan',
  'Hyundai',
  'Kia',
  'Peugeot',
  'Citroën',
  'Mercedes-Benz',
  'BMW',
  'Audi',
  'Volvo',
  'Suzuki',
  'Mitsubishi',
  'Honda',
  'Mazda',
  'Jeep',
  'Dodge',
  'Chrysler',
  'Subaru',
  'Lexus',
  'Infiniti',
  'Land Rover',
  'Jaguar',
  'Porsche',
  'Mini',
  'Seat',
  'Skoda',
  'BYD',
  'Chery',
  'Geely',
  'Great Wall',
  'BAIC',
  'JAC',
  'Scania',
  'Volvo Trucks',
  'Mercedes-Benz Trucks',
  'Iveco',
  'MAN',
  'DAF',
  'Agrale',
  'Alfa Romeo',
  'Ferrari',
  'Lamborghini',
  'Maserati',
  'Bentley',
  'Rolls-Royce',
  'Aston Martin',
  'McLaren',
];
