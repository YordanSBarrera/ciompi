import { MonedaTipo } from './const';

export const MONEDAS_FINANCIAMIENTO = ['USD', 'UYU'] as const;

export type MonedaFinanciamiento = (typeof MONEDAS_FINANCIAMIENTO)[number];

export const MONEDA_FINANCIAMIENTO_DEFAULT: MonedaFinanciamiento = 'USD';

/** Normaliza moneda desde API/UI; valores históricos sin campo → USD. */
export function normalizarMoneda(m: unknown): MonedaFinanciamiento {
  if (m === 'USD' || m === 'UYU') return m;
  return MONEDA_FINANCIAMIENTO_DEFAULT;
}

/**
 * Convierte la salida de Intl (símbolo $) a convención local:
 * USD → U$S (ej. U$S 1.234,56 si el locale usa ese patrón)
 * UYU → $U
 *
 * Para USD se debe formatear con locale `en-US` para no obtener el prefijo `US$` de es-UY.
 */
export function aplicarSimboloMonedaUruguaya(
  textoFormateado: string,
  moneda: MonedaFinanciamiento
): string {
  if (moneda === MonedaTipo.USD) {
    return textoFormateado.replace(/\$/g, 'U$S');
  }
  if (moneda === MonedaTipo.UYU) {
    return textoFormateado.replace(/\$/g, '$U');
  }
  return textoFormateado;
}

export function formatMoney(
  amount: number,
  moneda: MonedaFinanciamiento = MONEDA_FINANCIAMIENTO_DEFAULT
): string {
  const locale = moneda === MonedaTipo.UYU ? 'es-UY' : 'en-US';
  const texto = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: moneda,
    minimumFractionDigits: 2,
  }).format(amount);
  return aplicarSimboloMonedaUruguaya(texto, moneda as MonedaTipo);
}
