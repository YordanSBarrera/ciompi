import { UsuarioRoles, UsuarioEstado } from './const';

export interface ClienteType {
  NOMBRE: string;
  cedula?: string;
  correo?: string;
  profesion?: string;
  DIRECCION?: string;
  TELEFONO?: string;
  // Campos de Soft Delete
  eliminado?: boolean;
  fechaEliminacion?: Date;
  usuarioEliminacion?: Usuario | string;
  usuarioCreacion?: Usuario;
  usuarioModificacion?: Usuario;
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ClienteFormType {
  NOMBRE: string;
  cedula?: string;
  correo?: string;
  profesion?: string;
  DIRECCION?: string;
  TELEFONO?: string;
}

export interface Cuoaux {
  FECHA: string;
  SALDO: string;
  IMPORTE: string;
}

export interface Empre {
  CODEMP: string;
  EMPRESA: string;
}

export interface Formapag {
  FECHA: string;
  IMPORTE: string;
  SALDO?: string;
  CODCLI: string;
  CODOP: string;
  MONEDA: string;
  COMENTARIO?: string;
}

export interface Operac {
  FECHA: string;
  CODEMP: string;
  MATRICULA?: string;
  FEC_COMPRA: string;
  MONEDA: string;
  VALOR_BASE: string;
  VAL_CUOTA: string;
  TOT_PREST: string;
  TOT_FINANC: string;
  CODCLI: string;
  CODOP: string;
  MARCA?: string;
  CUOTAS?: string;
  ANIO?: string;
  INTERES?: string;
}

export interface Venaux {
  NOMBRE: string;
  VAL_CUOTA: string;
  FEC_PCV: string;
  CUOTAS: string;
  RESTAN: string;
  PRIM_CUO: string;
  ULT_CUO: string;
  SALDO: string;
  VENCIDO: string;
  CUO_VEN: string;
  P_HASTA: string;
  MONEDA: string;
}

export interface RouteParams {
  params: {
    [key: string]: string;
  };
}

export interface Usuario {
  _id?: string;
  usuario: string;
  password: string;
  email: string;
  nombre: string;
  avatar?: Avatar | string; // Puede ser objeto o string simple
  rol: UsuarioRoles;
  estado: UsuarioEstado;
  // Campos de Soft Delete
  eliminado?: boolean;
  fechaEliminacion?: Date;
  usuarioEliminacion?: string | Usuario;
  usuarioCreacion?: string | Usuario;
  usuarioModificacion?: string | Usuario;
  ultimoAcceso?: Date;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  informacionContacto?: InformacionContacto;
  cargo?: string;
}

export interface Avatar {
  url: string;
  publicId: string; // Para Cloudinary o similar
  thumbnail?: string; // URL de miniatura
}

export interface InformacionContacto {
  telefono?: string;
}

export interface LoginCredentials {
  usuario: string;
  password: string;
  rememberMe?: boolean;
}

export interface VehiculoType {
  _id?: string;
  Marca: string;
  Modelo: string;
  Matricula: string;
  Padron?: number;
  Descripcion?: string;
  Año?: number;
  Color?: string;
  disponible?: boolean;
  // Campos de Soft Delete
  eliminado?: boolean;
  fechaEliminacion?: Date;
  usuarioEliminacion?: Usuario | string;
  usuarioCreacion?: Usuario | string;
  usuarioModificacion?: Usuario | string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VehiculoFormType {
  Marca: string;
  Modelo: string;
  Matricula: string;
  Padron?: number;
  Descripcion?: string;
  Año?: number;
  Color?: string;
  disponible?: boolean;
}

// Tipos para Financiamiento
export interface CuotaFuturaType {
  numeroCuota: number;
  fechaVencimiento: Date | string;
  valorCuota: number;
  estadoCuota?: 'pendiente' | 'pagada' | 'parcial'; // Opcional para el modelo
}

export interface FinanciamientoType {
  _id?: string;

  // Referencias
  cliente: string | ClienteType;
  cliente2?: string | ClienteType;
  vehiculo?: string | VehiculoType;
  empresa: string | EmpresaType;

  // Información financiera básica
  costoVehiculo: number; // Costo final total
  valorBase?: number; // Valor base del vehículo (sin costos adicionales)
  costosDocumentacion?: number; // Costos de documentación
  gastosExtras?: number; // Gastos extras adicionales

  // Estructura del financiamiento
  cuotas: number; // Número total de cuotas
  cuotasExtras?: number; // Número de cuotas extras
  valorCuota: number; // Valor de cada cuota
  interesTotal: number; // Total de intereses
  montoTotal: number; // Monto total a financiar

  // Cuotas futuras programadas
  cuotasFuturas?: CuotaFuturaType[];

  // Fechas importantes
  fechaVenta: Date | string;
  fechaPrimeraCuota: Date | string;
  fechaUltimaCuota: Date | string;

  // Estado y seguimiento
  estadoFinanciamiento: 'activo' | 'finalizado' | 'cancelado' | 'en_mora';
  cuotasPagadas: number;
  cuotasPendientes: number;
  montoPagado: number;
  saldoPendiente: number;

  // Usuarios de auditoría
  usuarioCreacion?: string | Usuario;
  usuarioRegistro: string | Usuario;
  usuarioModificacion?: string | Usuario;

  // Información adicional
  observaciones?: string;

  // Campos virtuales (calculados)
  progresoFinanciamiento?: number; // Porcentaje de progreso
  estaAlDia?: boolean; // Si está al día con los pagos

  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

// Alias para compatibilidad con código existente
export interface CuotaFutura {
  numeroCuota: number;
  fechaVencimiento: string;
  valorCuota: number;
}

export interface FinanciamientoFormType {
  // Referencias
  clientes: Array<string | ClienteFormType>; // Array de 1 o 2 clientes (ID o objeto nuevo)
  vehiculo?: string; // ID del vehículo (opcional)
  empresa: string; // ID de la empresa

  // Información financiera
  valorBase: number; // Valor base del vehículo
  costosDocumentacion?: number; // Costos de documentación
  gastosExtras?: number; // Gastos extras adicionales

  // Estructura del financiamiento
  cuotas: number; // Número total de cuotas
  cuotasExtras?: number; // Número de cuotas extras
  valorCuota: number; // Valor de cada cuota
  interesTotal: number; // Total de intereses
  montoTotal: number; // Monto total a financiar

  // Fechas y cuotas programadas
  fechaPrimeraCuota: string; // Fecha de la primera cuota (ISO string)
  cuotasFuturas?: CuotaFutura[]; // Array de cuotas futuras con fechas editables

  // Información adicional
  observaciones?: string; // Observaciones del financiamiento
}

// Tipo para selección de cliente/vehículo en el formulario
export interface SelectOption {
  value: string;
  label: string;
  additionalInfo?: string;
}

// Tipos para Pagos de Cuotas
export interface PagoCuotaType {
  _id?: string;
  financiamiento: string | FinanciamientoType;
  numeroCuota: number;
  montoPago: number;
  fechaPago: Date;
  metodoPago: 'efectivo' | 'transferencia' | 'cheque' | 'tarjeta' | 'otro';
  usuarioRegistro: string | Usuario;
  observaciones?: string;
  estadoPago: 'confirmado' | 'pendiente' | 'cancelado';
  numeroComprobante?: string;
  banco?: string;
  esExtra?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PagoCuotaFormType {
  financiamiento: string;
  numeroCuota: number;
  montoPago: number;
  fechaPago: Date | string;
  metodoPago: 'efectivo' | 'transferencia' | 'cheque' | 'tarjeta' | 'otro';
  observaciones?: string;
  numeroComprobante?: string;
  banco?: string;
  esExtra?: boolean;
}

// Tipos para Empresas
export interface EmpresaType {
  _id?: string;
  nombre: string;
  descripcion?: string;
  telefono?: string;
  usuarioRegistro: string | Usuario; // Puede ser ID o objeto completo
  usuarioModificacion?: string | Usuario; // Puede ser ID o objeto completo
  estado: 'activa' | 'inactiva';
  // Campos de Soft Delete
  eliminado?: boolean;
  fechaEliminacion?: Date;
  usuarioEliminacion?: string | Usuario;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EmpresaFormType {
  nombre: string;
  descripcion?: string;
  telefono?: string;
}
