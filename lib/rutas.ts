export const routes = {
  home: 'ciompi/',
  clientes: 'ciompi/clientes',
  empresas: 'ciompi/empresas',
  operaciones: 'ciompi/operaciones',
  datosGenerales: 'ciompi/datosGenerales',
  usuario: 'ciompi/usuario',
  utilitarios: 'ciompi/utilitarios',
  nuevoUsuario: 'usuarios/nuevo',
  vehiculos: 'ciompi/vehiculos',
} as const;

// Helper para rutas dinámicas
export const dynamicRoutes = {
  cliente: (id: string) => `ciompi/clientes/${id}`,
  clienteEditar: (id: string) => `ciompi/clientes/${id}/editar`,
  clienteEliminar: (id: string) => `ciompi/clientes/${id}/eliminar`,
  empresa: (id: string) => `ciompi/empresas/${id}`,
};

export type AppRoute = keyof typeof routes;
