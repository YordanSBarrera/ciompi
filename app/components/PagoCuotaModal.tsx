'use client';
import { PagoCuotaFormType } from '@/lib/types';
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
  onPagoRegistrado: () => void;
}

export default function PagoCuotaModal({
  open,
  onClose,
  financiamientoId,
  valorCuota,
  cuotasPagadas,
  cuotasTotal,
  onPagoRegistrado,
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
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setFormData({
        financiamiento: financiamientoId,
        numeroCuota: cuotasPagadas + 1,
        montoPago: valorCuota,
        fechaPago: new Date().toISOString().split('T')[0],
        metodoPago: 'efectivo',
        observaciones: '',
        numeroComprobante: '',
        banco: '',
      });
      setError(null);
    }
  }, [open, financiamientoId, cuotasPagadas, valorCuota]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]:
        name === 'numeroCuota' || name === 'montoPago' ? Number(value) : value,
    }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (formData.numeroCuota <= cuotasPagadas) {
      setError('El número de cuota debe ser mayor a las cuotas ya pagadas');
      return false;
    }
    if (formData.numeroCuota > cuotasTotal) {
      setError('El número de cuota no puede ser mayor al total de cuotas');
      return false;
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

      const dataToSend = {
        ...formData,
        usuarioRegistro,
      };

      const response = await fetch('/api/pagos-cuotas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU',
    }).format(amount);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="h2">
          Registrar Pago de Cuota
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Cuota #{formData.numeroCuota} de {cuotasTotal}
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Número de Cuota"
                name="numeroCuota"
                type="number"
                value={formData.numeroCuota}
                onChange={handleChange}
                required
                inputProps={{ min: cuotasPagadas + 1, max: cuotasTotal }}
                helperText={`Cuotas pagadas: ${cuotasPagadas} de ${cuotasTotal}`}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Monto del Pago"
                name="montoPago"
                type="number"
                value={formData.montoPago}
                onChange={handleChange}
                required
                inputProps={{ min: 0, step: 1000 }}
                helperText={`Valor de cuota: ${formatCurrency(valorCuota)}`}
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
            disabled={loading}
            sx={{ minWidth: 120 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Registrar Pago'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
