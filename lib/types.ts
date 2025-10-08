export interface ClienteType {
  NOMBRE: string;
  cedula?: string;
  correo?: string;
  profesion?: string;
  DIRECCION?: string;
  CODCLI: string;
  TELEFONO?: string;
  _id: string;
}

export interface ClienteFormType {
  NOMBRE: string;
  cedula?: string;
  correo?: string;
  profesion?: string;
  DIRECCION?: string;
  CODCLI: string;
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
  rol: 'admin' | 'supervisor' | 'usuario';
  estado: 'activo' | 'inactivo' | 'bloqueado' | 'pendiente';
  ultimoAcceso?: Date;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  preferencias?: PreferenciasUsuario;
  informacionContacto?: InformacionContacto;
  metadata?: MetadataUsuario;
  departamento?: string;
  cargo?: string;
  permisosEspeciales?: string[];
}

export interface Avatar {
  url: string;
  publicId: string; // Para Cloudinary o similar
  thumbnail?: string; // URL de miniatura
}

export interface PreferenciasUsuario {
  tema: 'claro' | 'oscuro' | 'sistema';
  idioma: string;
  notificaciones: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

export interface InformacionContacto {
  telefono?: string;
  direccion?: {
    calle: string;
    ciudad: string;
    estado: string;
    codigoPostal: string;
    pais: string;
  };
}

export interface MetadataUsuario {
  intentosLogin: number;
  bloqueadoHasta?: Date;
  fechaExpiracionPassword: Date;
  sesionesActivas: number;
  ipUltimoAcceso?: string;
  dispositivoUltimoAcceso?: string;
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
}
