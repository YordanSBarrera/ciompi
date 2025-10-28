'use client';
import { blanco, grisClaro, grisMedio } from '@/lib/color';
import {
  ClienteType,
  VehiculoType,
  FinanciamientoFormType,
  SelectOption,
} from '@/lib/types';
import AuthGuard from '@/app/components/AuthGuard';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  TextField,
  Typography,
  Grid,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Función para cargar clientes
async function cargarClientes(): Promise<ClienteType[]> {
  try {
    const response = await fetch('/api/clientes');
    if (!response.ok) {
      throw new Error('Error al cargar clientes');
    }
    return await response.json();
  } catch (error) {
    console.error('Error cargando clientes:', error);
    return [];
  }
}

// Función para cargar vehículos
async function cargarVehiculos(): Promise<VehiculoType[]> {
  try {
    const response = await fetch('/api/vehiculos');
    if (!response.ok) {
      throw new Error('Error al cargar vehículos');
    }
    return await response.json();
  } catch (error) {
    console.error('Error cargando vehículos:', error);
    return [];
  }
}

export default function NuevoFinanciamientoPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<ClienteType[]>([]);
  const [vehiculos, setVehiculos] = useState<VehiculoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<FinanciamientoFormType>({
    cliente: '',
    vehiculo: '',
    costoVehiculo: 0,
    cuotas: 12,
    valorCuota: 0,
    interesTotal: 0,
    montoTotal: 0,
    fechaPrimeraCuota: new Date().toISOString().split('T')[0],
    observaciones: '',
  });

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [clientesData, vehiculosData] = await Promise.all([
          cargarClientes(),
          cargarVehiculos(),
        ]);
        setClientes(clientesData);
        setVehiculos(vehiculosData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calcular montos automáticamente cuando cambian costoVehiculo, cuotas o valorCuota
  useEffect(() => {
    const costoVehiculo = formData.costoVehiculo;
    const cuotas = formData.cuotas;
    const valorCuota = formData.valorCuota;

    if (costoVehiculo > 0 && cuotas > 0 && valorCuota > 0) {
      const montoTotal = valorCuota * cuotas;
      const interesTotal = montoTotal - costoVehiculo;

      setFormData(prev => ({
        ...prev,
        montoTotal,
        interesTotal,
      }));
    }
  }, [formData.costoVehiculo, formData.cuotas, formData.valorCuota]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]:
        name === 'costoVehiculo' || name === 'cuotas' || name === 'valorCuota'
          ? Number(value)
          : value,
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
    if (!formData.cliente) {
      setError('Debe seleccionar un cliente');
      return false;
    }
    if (!formData.vehiculo) {
      setError('Debe seleccionar un vehículo');
      return false;
    }
    if (formData.costoVehiculo <= 0) {
      setError('El costo del vehículo debe ser mayor a 0');
      return false;
    }
    if (formData.cuotas <= 0) {
      setError('El número de cuotas debe ser mayor a 0');
      return false;
    }
    if (formData.valorCuota <= 0) {
      setError('El valor de la cuota debe ser mayor a 0');
      return false;
    }
    if (!formData.fechaPrimeraCuota) {
      setError('Debe seleccionar una fecha para la primera cuota');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);
      setError(null);

      // Obtener el usuario actual del localStorage o contexto
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

      const response = await fetch('/api/financiamiento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear financiamiento');
      }

      setSuccess(true);
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/ciompi/financiamiento');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU',
    }).format(amount);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <AuthGuard>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Button
            component={Link}
            href="/ciompi/financiamiento"
            variant="outlined"
            sx={{ mb: 2 }}
          >
            ← Volver al listado
          </Button>

          <Typography variant="h4" component="h1" gutterBottom>
            Nueva Venta Financiada
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Registrar un nuevo financiamiento de vehículo
          </Typography>
        </Box>

        {/* Formulario */}
        <Paper
          elevation={3}
          sx={{ p: 4, bgcolor: grisClaro, border: `1px solid ${grisMedio}` }}
        >
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Selección de Cliente */}
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: 'primary.main' }}
                >
                  Selección de Cliente
                </Typography>
                <Divider sx={{ mb: 3 }} />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Cliente</InputLabel>
                  <Select
                    name="cliente"
                    value={formData.cliente}
                    onChange={handleSelectChange}
                    label="Cliente"
                  >
                    {clientes.map(cliente => (
                      <MenuItem key={cliente._id} value={cliente._id}>
                        <Box>
                          <Typography variant="body1">
                            {cliente.NOMBRE}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {cliente.cedula}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Selección de Vehículo */}
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: 'primary.main', mt: 2 }}
                >
                  Selección de Vehículo
                </Typography>
                <Divider sx={{ mb: 3 }} />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Vehículo</InputLabel>
                  <Select
                    name="vehiculo"
                    value={formData.vehiculo}
                    onChange={handleSelectChange}
                    label="Vehículo"
                  >
                    {vehiculos.map(vehiculo => (
                      <MenuItem key={vehiculo._id} value={vehiculo._id}>
                        <Box>
                          <Typography variant="body1">
                            {vehiculo.Marca} {vehiculo.Modelo}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {vehiculo.Matricula} - {vehiculo.Año}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Información Financiera */}
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: 'primary.main', mt: 2 }}
                >
                  Información Financiera
                </Typography>
                <Divider sx={{ mb: 3 }} />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Costo del Vehículo"
                  name="costoVehiculo"
                  type="number"
                  value={formData.costoVehiculo}
                  onChange={handleChange}
                  required
                  inputProps={{ min: 0, step: 1000 }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Número de Cuotas"
                  name="cuotas"
                  type="number"
                  value={formData.cuotas}
                  onChange={handleChange}
                  required
                  inputProps={{ min: 1, max: 120 }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Valor de Cuota"
                  name="valorCuota"
                  type="number"
                  value={formData.valorCuota}
                  onChange={handleChange}
                  required
                  inputProps={{ min: 0, step: 1000 }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Fecha Primera Cuota"
                  name="fechaPrimeraCuota"
                  type="date"
                  value={formData.fechaPrimeraCuota}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Observaciones"
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  placeholder="Observaciones adicionales sobre el financiamiento..."
                />
              </Grid>

              {/* Resumen de Cálculos */}
              {formData.montoTotal > 0 && (
                <Grid size={{ xs: 12 }}>
                  <Card sx={{ bgcolor: 'background.paper', mt: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Resumen del Financiamiento
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <Typography variant="body2" color="textSecondary">
                            Costo Vehículo
                          </Typography>
                          <Typography variant="h6" color="primary">
                            {formatCurrency(formData.costoVehiculo)}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <Typography variant="body2" color="textSecondary">
                            Interés Total
                          </Typography>
                          <Typography variant="h6" color="error">
                            {formatCurrency(formData.interesTotal)}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <Typography variant="body2" color="textSecondary">
                            Monto Total
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {formatCurrency(formData.montoTotal)}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <Typography variant="body2" color="textSecondary">
                            Cuotas
                          </Typography>
                          <Typography variant="h6">
                            {formData.cuotas} cuotas de{' '}
                            {formatCurrency(formData.valorCuota)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Botones de acción */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'flex-end',
                    flexWrap: 'wrap',
                  }}
                >
                  <Button
                    component={Link}
                    href="/ciompi/financiamiento"
                    variant="outlined"
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={saving}
                    sx={{ minWidth: 120 }}
                  >
                    {saving ? (
                      <CircularProgress size={24} />
                    ) : (
                      'Registrar Financiamiento'
                    )}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>

        {/* Mensajes de feedback */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Snackbar
          open={success}
          autoHideDuration={6000}
          onClose={() => setSuccess(false)}
          message="Financiamiento registrado correctamente"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Container>
    </AuthGuard>
  );
}
