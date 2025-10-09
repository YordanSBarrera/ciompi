export const routes = {
  home: '/',
  clientes: '/clientes',
  empresas: '/empresas',
  operaciones: '/operaciones',
  datosGenerales: '/datosGenerales',
  usuario: '/usuario',
  utilitarios: '/utilitarios',
  nuevoUsuario: '/usuarios/nuevo',
  autos: '/autos',
} as const;

// Helper para rutas dinámicas
export const dynamicRoutes = {
  cliente: (id: string) => `/clientes/${id}`,
  clienteEditar: (id: string) => `/clientes/${id}/editar`,
  clienteEliminar: (id: string) => `/clientes/${id}/eliminar`,
  empresa: (id: string) => `/empresas/${id}`,
};

export const getFullUrl = (path: string): string => {
  // En el cliente, usa window.location.origin
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${path}`;
  }
  // En el servidor, podrías necesitar construir la URL base
  return path;
};

export type AppRoute = keyof typeof routes;
