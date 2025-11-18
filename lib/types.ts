import { Roles } from './utils';

export interface ClienteType {
  NOMBRE: string;
  cedula?: string;
  correo?: string;
  profesion?: string;
  DIRECCION?: string;
  TELEFONO?: string;
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
  rol: Roles;
  estado: 'activo' | 'inactivo';
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
export interface FinanciamientoType {
  _id?: string;
  cliente: string | ClienteType; // Puede ser ID o objeto completo
  cliente2?: string | ClienteType; // Segundo cliente (opcional)
  vehiculo?: string | VehiculoType; // Puede ser ID o objeto completo (opcional)
  empresa: string | EmpresaType; // Puede ser ID o objeto completo
  costoVehiculo: number;
  cuotas: number;
  valorCuota: number;
  interesTotal: number;
  montoTotal: number;
  fechaVenta: Date;
  estadoFinanciamiento: 'activo' | 'finalizado' | 'cancelado' | 'en_mora';
  usuarioCreacion?: string | Usuario; // Puede ser ID o objeto completo
  usuarioRegistro: string | Usuario; // Puede ser ID o objeto completo
  usuarioModificacion?: string | Usuario; // Puede ser ID o objeto completo
  observaciones?: string;
  fechaPrimeraCuota: Date;
  fechaUltimaCuota: Date;
  cuotasPagadas: number;
  cuotasPendientes: number;
  montoPagado: number;
  saldoPendiente: number;
  cuotasExtras?: number;
  cuotasFuturas?: Array<{
    numeroCuota: number;
    fechaVencimiento: Date | string;
    valorCuota: number;
  }>;
  progresoFinanciamiento?: number; // Virtual
  estaAlDia?: boolean; // Virtual
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CuotaFutura {
  numeroCuota: number;
  fechaVencimiento: string; // ISO date string
  valorCuota: number;
}

export interface FinanciamientoFormType {
  clientes: Array<string | ClienteFormType>; // Array de 1 o 2 clientes (ID o objeto nuevo)
  vehiculo?: string; // ID del vehículo (opcional)
  empresa: string; // ID de la empresa
  valorBase: number; // Valor base (antes costoVehiculo)
  costosDocumentacion?: number; // Costos de documentación
  gastosExtras?: number; // Gastos extras
  cuotas: number;
  cuotasExtras?: number; // Número de cuotas extras
  valorCuota: number;
  interesTotal: number;
  montoTotal: number;
  fechaPrimeraCuota: string;
  cuotasFuturas?: CuotaFutura[]; // Array de cuotas futuras con fechas editables
  observaciones?: string;
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
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EmpresaFormType {
  nombre: string;
  descripcion?: string;
  telefono?: string;
}
