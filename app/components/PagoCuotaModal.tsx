'use client';
import { PagoCuotaFormType } from '@/lib/types';
import { getAuthHeaders } from '@/lib/utils';
import {
  formatMoney,
  normalizarMoneda,
  type MonedaFinanciamiento,
} from '@/lib/moneda';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Grid,
} from '@mui/material';
import React, { useEffect, useState } from 'react';

interface PagoCuotaModalProps {
  open: boolean;
  onClose: () => void;
  financiamientoId: string;
  valorCuota: number;
  cuotasPagadas: number;
  cuotasTotal: number;
  cuotasExtras?: number;
  pagos?: Array<{
    numeroCuota?: number;
    montoPago: number;
    esExtra?: boolean;
    estadoPago?: string;
  }>;
  cuotasFuturas?: Array<{
    numeroCuota: number;
    fechaVencimiento: Date | string;
    valorCuota: number;
  }>;
  onPagoRegistrado: () => void;
  /** Moneda del financiamiento (histórico sin campo → USD). */
  moneda?: MonedaFinanciamiento;
}

export default function PagoCuotaModal({
  open,
  onClose,
  financiamientoId,
  valorCuota,
  cuotasPagadas,
  cuotasTotal,
  cuotasExtras = 0,
  pagos = [],
  cuotasFuturas = [],
  onPagoRegistrado,
  moneda = 'USD',
}: PagoCuotaModalProps) {
  const [formData, setFormData] = useState<PagoCuotaFormType>({
    financiamiento: financiamientoId,
    numeroCuota: cuotasPagadas + 1,
    montoPago: valorCuota,
    fechaPago: new Date().toISOString().split('T')[0],
    metodoPago: 'efectivo',
    observaciones: '',
    numeroComprobante: '',
    banco: '',
    esExtra: false,
  });
  const [tipoPago, setTipoPago] = useState<'normal' | 'extra'>('normal');
  const [numeroCuotaExtra, setNumeroCuotaExtra] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener el valor de una cuota específica
  const obtenerValorCuota = (
    numeroCuota: number,
    esExtra: boolean = false
  ): number => {
    // Buscar en cuotasFuturas primero
    const cuotaFutura = cuotasFuturas.find(
      cf => cf.numeroCuota === numeroCuota
    );
    if (cuotaFutura) {
      return cuotaFutura.valorCuota;
    }
    // Si no se encuentra, usar el valorCuota general
    return valorCuota;
  };

  // Calcular el saldo pendiente de la cuota seleccionada
  const calcularSaldoPendiente = (
    numeroCuota: number,
    esExtra: boolean = false
  ): number => {
    const valorCuotaEspecifica = obtenerValorCuota(numeroCuota, esExtra);
    const pagosConfirmados = pagos.filter(
      p =>
        p.estadoPago === 'confirmado' &&
        p.esExtra === esExtra &&
        p.numeroCuota === numeroCuota
    );
    const totalPagado = pagosConfirmados.reduce(
      (sum, p) => sum + p.montoPago,
      0
    );
    return Math.max(0, valorCuotaEspecifica - totalPagado);
  };

  // Cuotas normales con saldo pendiente (disponibles para pagar).
  const cuotasNormalesDisponibles = (): number[] => {
    const disponibles: number[] = [];
    for (let n = 1; n <= cuotasTotal; n++) {
      if (calcularSaldoPendiente(n, false) > 0) {
        disponibles.push(n);
      }
    }
    return disponibles;
  };

  // Cuotas extras con saldo pendiente (disponibles para pagar).
  const cuotasExtrasDisponibles = (): number[] => {
    const disponibles: number[] = [];
    for (let n = 1; n <= cuotasExtras; n++) {
      const numeroCuotaTotal = cuotasTotal + n;
      if (calcularSaldoPendiente(numeroCuotaTotal, true) > 0) {
        disponibles.push(n);
      }
    }
    return disponibles;
  };

  // Primera cuota normal no completamente pagada.
  const calcularSiguienteCuotaPendiente = (): number => {
    const disponibles = cuotasNormalesDisponibles();
    return disponibles.length > 0 ? disponibles[0] : cuotasPagadas + 1;
  };

  // Calcular la próxima cuota extra pendiente.
  // Devuelve el índice de la primera cuota extra no completamente pagada.
  const calcularSiguienteCuotaExtra = (): number => {
    const disponibles = cuotasExtrasDisponibles();
    return disponibles.length > 0 ? disponibles[0] : cuotasExtras + 1;
  };

  useEffect(() => {
    if (open) {
      const normales = cuotasNormalesDisponibles();
      const extras = cuotasExtrasDisponibles();

      if (normales.length > 0) {
        const nuevaCuota = normales[0];
        const saldoPendiente = calcularSaldoPendiente(nuevaCuota, false);
        setFormData({
          financiamiento: financiamientoId,
          numeroCuota: nuevaCuota,
          montoPago: Math.floor(saldoPendiente),
          fechaPago: new Date().toISOString().split('T')[0],
          metodoPago: 'efectivo',
          observaciones: '',
          numeroComprobante: '',
          banco: '',
          esExtra: false,
        });
        setTipoPago('normal');
      } else if (extras.length > 0) {
        const siguienteExtra = extras[0];
        const numeroCuotaExtraTotal = cuotasTotal + siguienteExtra;
        const saldoPendiente = calcularSaldoPendiente(
          numeroCuotaExtraTotal,
          true
        );
        setFormData({
          financiamiento: financiamientoId,
          numeroCuota: numeroCuotaExtraTotal,
          montoPago: Math.floor(saldoPendiente),
          fechaPago: new Date().toISOString().split('T')[0],
          metodoPago: 'efectivo',
          observaciones: '',
          numeroComprobante: '',
          banco: '',
          esExtra: true,
        });
        setNumeroCuotaExtra(siguienteExtra);
        setTipoPago('extra');
      } else {
        setFormData({
          financiamiento: financiamientoId,
          numeroCuota: cuotasPagadas + 1,
          montoPago: Math.floor(valorCuota),
          fechaPago: new Date().toISOString().split('T')[0],
          metodoPago: 'efectivo',
          observaciones: '',
          numeroComprobante: '',
          banco: '',
          esExtra: false,
        });
        setTipoPago('normal');
        setNumeroCuotaExtra(calcularSiguienteCuotaExtra());
      }
      setError(null);
    }
  }, [
    open,
    financiamientoId,
    cuotasPagadas,
    valorCuota,
    pagos,
    cuotasFuturas,
    cuotasTotal,
    cuotasExtras,
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]:
          name === 'numeroCuota' || name === 'montoPago'
            ? Number(value)
            : value,
      };

      // Si cambió el número de cuota y es pago normal, actualizar el monto al saldo pendiente
      if (name === 'numeroCuota' && tipoPago === 'normal') {
        const saldoPendiente = calcularSaldoPendiente(Number(value), false);
        const valorCuotaEspecifica = obtenerValorCuota(Number(value), false);
        updated.montoPago =
          saldoPendiente > 0
            ? Math.floor(saldoPendiente)
            : Math.floor(valorCuotaEspecifica);
      }

      // Si cambió el monto, redondear a entero
      if (name === 'montoPago') {
        updated.montoPago = Math.floor(Number(value));
      }

      return updated;
    });
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'numeroCuota' ? Number(value) : value,
    }));
  };

  // Cambio de cuota normal seleccionada: ajusta el monto al saldo pendiente
  const handleCuotaNormalChange = (e: any) => {
    const nuevoNumero = Number(e.target.value);
    const saldoPendiente = calcularSaldoPendiente(nuevoNumero, false);
    const valorCuotaEspecifica = obtenerValorCuota(nuevoNumero, false);
    setFormData(prev => ({
      ...prev,
      numeroCuota: nuevoNumero,
      montoPago:
        saldoPendiente > 0
          ? Math.floor(saldoPendiente)
          : Math.floor(valorCuotaEspecifica),
    }));
  };

  const validateForm = (): boolean => {
    if (tipoPago === 'normal') {
      if (formData.numeroCuota < 1) {
        setError('El número de cuota debe ser 1 o mayor');
        return false;
      }
      const saldo = calcularSaldoPendiente(formData.numeroCuota, false);
      if (saldo <= 0) {
        setError(
          `La cuota #${formData.numeroCuota} ya está completamente pagada`
        );
        return false;
      }
      if (formData.montoPago > saldo) {
        setError(
          `El monto del pago no puede exceder el saldo pendiente de la cuota #${formData.numeroCuota} (${formatCurrency(saldo)})`
        );
        return false;
      }
    } else if (tipoPago === 'extra') {
      if (numeroCuotaExtra < 1 || numeroCuotaExtra > cuotasExtras) {
        setError('El número de cuota extra es inválido');
        return false;
      }
      const numeroCuotaExtraTotal = cuotasTotal + numeroCuotaExtra;
      const saldo = calcularSaldoPendiente(numeroCuotaExtraTotal, true);
      if (saldo <= 0) {
        setError(
          `La cuota extra #${numeroCuotaExtra} ya está completamente pagada`
        );
        return false;
      }
      if (formData.montoPago > saldo) {
        setError(
          `El monto del pago no puede exceder el saldo pendiente de la cuota extra #${numeroCuotaExtra} (${formatCurrency(saldo)})`
        );
        return false;
      }
    }
    if (formData.montoPago <= 0) {
      setError('El monto del pago debe ser mayor a 0');
      return false;
    }
    if (!formData.fechaPago) {
      setError('Debe seleccionar una fecha de pago');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);

      // Obtener el usuario actual del localStorage
      const usuarioActual = localStorage.getItem('user');
      let usuarioRegistro = '';

      if (usuarioActual) {
        const user = JSON.parse(usuarioActual);
        usuarioRegistro = user.id || user._id;
      }

      // Preparar datos según el tipo de pago
      const dataToSend = {
        ...formData,
        esExtra: tipoPago === 'extra',
        numeroCuota:
          tipoPago === 'extra'
            ? cuotasTotal + numeroCuotaExtra
            : formData.numeroCuota,
        usuarioRegistro,
      };

      const authHeaders = getAuthHeaders();

      const response = await fetch('/api/pagos-cuotas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al registrar el pago');
      }

      onPagoRegistrado();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    formatMoney(amount, normalizarMoneda(moneda));

  const normalesDisponibles = cuotasNormalesDisponibles();
  const extrasDisponibles = cuotasExtrasDisponibles();
  const puedePagar =
    tipoPago === 'normal'
      ? normalesDisponibles.length > 0
      : extrasDisponibles.length > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="h2">
          Registrar Pago
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {tipoPago === 'normal'
            ? `Cuota #${formData.numeroCuota} de ${cuotasTotal}`
            : `Cuota Extra #${numeroCuotaExtra}${cuotasExtras > 0 ? ` de ${cuotasExtras}` : ''}`}
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={3}>
            {/* Selector de tipo de pago */}
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Pago</InputLabel>
                <Select
                  value={tipoPago}
                  onChange={e => {
                    const nuevoTipo = e.target.value as 'normal' | 'extra';
                    setTipoPago(nuevoTipo);
                    if (nuevoTipo === 'normal') {
                      const nuevaCuota = calcularSiguienteCuotaPendiente();
                      const saldoPendiente = calcularSaldoPendiente(
                        nuevaCuota,
                        false
                      );
                      setFormData(prev => ({
                        ...prev,
                        numeroCuota: nuevaCuota,
                        montoPago: Math.floor(saldoPendiente),
                        esExtra: false,
                      }));
                    } else {
                      // Para cuota extra, usar la próxima cuota extra pendiente
                      const siguienteExtra = calcularSiguienteCuotaExtra();
                      setNumeroCuotaExtra(siguienteExtra);
                      const numeroCuotaExtraTotal =
                        cuotasTotal + siguienteExtra;
                      const saldoPendiente = calcularSaldoPendiente(
                        numeroCuotaExtraTotal,
                        true
                      );
                      const valorCuotaExtra = obtenerValorCuota(
                        numeroCuotaExtraTotal,
                        true
                      );
                      setFormData(prev => ({
                        ...prev,
                        montoPago:
                          saldoPendiente > 0
                            ? Math.floor(saldoPendiente)
                            : Math.floor(valorCuotaExtra),
                        esExtra: true,
                      }));
                    }
                  }}
                  label="Tipo de Pago"
                >
                  <MenuItem
                    value="normal"
                    disabled={cuotasNormalesDisponibles().length === 0}
                  >
                    Cuota Normal ({cuotasPagadas} de {cuotasTotal} pagadas)
                  </MenuItem>
                  <MenuItem
                    value="extra"
                    disabled={
                      cuotasExtras === 0 ||
                      cuotasExtrasDisponibles().length === 0
                    }
                  >
                    Cuota Extra
                    {cuotasExtras > 0
                      ? ` (${cuotasExtras} disponibles)`
                      : ' (No hay cuotas extras definidas)'}
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Número de cuota normal */}
            {tipoPago === 'normal' && (
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Número de Cuota</InputLabel>
                  <Select
                    name="numeroCuota"
                    value={formData.numeroCuota}
                    onChange={handleCuotaNormalChange}
                    label="Número de Cuota"
                  >
                    {cuotasNormalesDisponibles().map(n => (
                      <MenuItem key={n} value={n}>
                        Cuota #{n}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Número de cuota extra */}
            {tipoPago === 'extra' && cuotasExtras > 0 && (
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Número de Cuota Extra</InputLabel>
                  <Select
                    name="numeroCuotaExtra"
                    value={numeroCuotaExtra}
                    onChange={e => {
                      const nuevoNumero = Number(e.target.value);
                      setNumeroCuotaExtra(nuevoNumero);
                      // Ajustar el monto según la cuota extra seleccionada
                      const numeroCuotaExtraTotal = cuotasTotal + nuevoNumero;
                      const saldoPendiente = calcularSaldoPendiente(
                        numeroCuotaExtraTotal,
                        true
                      );
                      const valorCuotaExtra = obtenerValorCuota(
                        numeroCuotaExtraTotal,
                        true
                      );
                      setFormData(prev => ({
                        ...prev,
                        montoPago:
                          saldoPendiente > 0
                            ? Math.floor(saldoPendiente)
                            : Math.floor(valorCuotaExtra),
                      }));
                    }}
                    label="Número de Cuota Extra"
                  >
                    {cuotasExtrasDisponibles().map(n => (
                      <MenuItem key={n} value={n}>
                        Cuota Extra #{n}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Monto del Pago"
                name="montoPago"
                type="number"
                value={formData.montoPago}
                onChange={handleChange}
                required
                inputProps={{
                  min: 1,
                  step: 1,
                  max: Math.max(
                    1,
                    tipoPago === 'normal'
                      ? calcularSaldoPendiente(formData.numeroCuota, false)
                      : calcularSaldoPendiente(
                          cuotasTotal + numeroCuotaExtra,
                          true
                        )
                  ),
                }}
                helperText={
                  tipoPago === 'normal'
                    ? (() => {
                        const valorCuotaEspecifica = obtenerValorCuota(
                          formData.numeroCuota,
                          false
                        );
                        const saldoPendiente = calcularSaldoPendiente(
                          formData.numeroCuota,
                          false
                        );
                        return `Valor de cuota: ${formatCurrency(valorCuotaEspecifica)}. Saldo pendiente: ${formatCurrency(saldoPendiente)}`;
                      })()
                    : (() => {
                        const numeroCuotaExtraTotal =
                          cuotasTotal + numeroCuotaExtra;
                        const valorCuotaExtra = obtenerValorCuota(
                          numeroCuotaExtraTotal,
                          true
                        );
                        const saldoPendiente = calcularSaldoPendiente(
                          numeroCuotaExtraTotal,
                          true
                        );
                        return `Valor de cuota extra: ${formatCurrency(valorCuotaExtra)}. Saldo pendiente: ${formatCurrency(saldoPendiente)}`;
                      })()
                }
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Fecha de Pago"
                name="fechaPago"
                type="date"
                value={formData.fechaPago}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Método de Pago</InputLabel>
                <Select
                  name="metodoPago"
                  value={formData.metodoPago}
                  onChange={handleSelectChange}
                  label="Método de Pago"
                >
                  <MenuItem value="efectivo">Efectivo</MenuItem>
                  <MenuItem value="transferencia">Transferencia</MenuItem>
                  <MenuItem value="cheque">Cheque</MenuItem>
                  <MenuItem value="tarjeta">Tarjeta</MenuItem>
                  <MenuItem value="otro">Otro</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {(formData.metodoPago === 'transferencia' ||
              formData.metodoPago === 'cheque') && (
              <>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Número de Comprobante"
                    name="numeroComprobante"
                    value={formData.numeroComprobante}
                    onChange={handleChange}
                    placeholder="Ej: 123456789"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Banco"
                    name="banco"
                    value={formData.banco}
                    onChange={handleChange}
                    placeholder="Ej: Banco República"
                  />
                </Grid>
              </>
            )}

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Observaciones"
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                multiline
                rows={3}
                placeholder="Observaciones adicionales sobre el pago..."
              />
            </Grid>
          </Grid>

          {normalesDisponibles.length === 0 &&
            extrasDisponibles.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Todas las cuotas de este financiamiento ya están completamente
                pagadas.
              </Alert>
            )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !puedePagar}
            sx={{ minWidth: 120 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Registrar Pago'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
