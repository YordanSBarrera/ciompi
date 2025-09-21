export interface ClienteType {
  NOMBRE: string;
  DIRECCION?: string;
  CODCLI: string;
  TELEFONO?: string;
  id: string;
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
