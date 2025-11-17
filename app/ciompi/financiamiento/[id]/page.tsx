'use client';
import { grisClaro, grisMedio } from '@/lib/color';
import { FinanciamientoType, PagoCuotaType } from '@/lib/types';
import AuthGuard from '@/app/components/AuthGuard';
import PagoCuotaModal from '@/app/components/PagoCuotaModal';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Typography,
  Grid,
  Divider,
  Card,
  CardContent,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function FinanciamientoDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [financiamiento, setFinanciamiento] =
    useState<FinanciamientoType | null>(null);
  const [pagos, setPagos] = useState<PagoCuotaType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagoModalOpen, setPagoModalOpen] = useState(false);
  const [pagoDetalleOpen, setPagoDetalleOpen] = useState(false);
  const [pagoSeleccionado, setPagoSeleccionado] =
    useState<PagoCuotaType | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar financiamiento y pagos en paralelo
        const [financiamientoResponse, pagosResponse] = await Promise.all([
          fetch(`/api/financiamiento/${id}`),
          fetch(`/api/pagos-cuotas/financiamiento/${id}`),
        ]);

        if (!financiamientoResponse.ok) {
          if (financiamientoResponse.status === 404) {
            throw new Error('Financiamiento no encontrado');
          }
          throw new Error('Error al cargar el financiamiento');
        }

        const [financiamientoData, pagosData] = await Promise.all([
          financiamientoResponse.json(),
          pagosResponse.json(),
        ]);

        setFinanciamiento(financiamientoData);
        setPagos(pagosData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-UY');
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'success';
      case 'finalizado':
        return 'info';
      case 'cancelado':
        return 'error';
      case 'en_mora':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handlePagoRegistrado = async () => {
    // Recargar los datos después de registrar un pago
    try {
      const [financiamientoResponse, pagosResponse] = await Promise.all([
        fetch(`/api/financiamiento/${id}`),
        fetch(`/api/pagos-cuotas/financiamiento/${id}`),
      ]);

      const [financiamientoData, pagosData] = await Promise.all([
        financiamientoResponse.json(),
        pagosResponse.json(),
      ]);

      setFinanciamiento(financiamientoData);
      setPagos(pagosData);
    } catch (err) {
      console.error('Error recargando datos:', err);
    }
  };

  const handleVerDetallePago = (pago: PagoCuotaType) => {
    setPagoSeleccionado(pago);
    setPagoDetalleOpen(true);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
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

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Link href="/ciompi/financiamiento">
          <Button variant="contained">Volver al listado</Button>
        </Link>
      </Container>
    );
  }

  if (!financiamiento) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">
          No se encontró información del financiamiento
        </Alert>
      </Container>
    );
  }

  return (
    <AuthGuard>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Button
            component={Link}
            href="/ciompi/financiamiento"
            variant="outlined"
            sx={{ mb: 2 }}
          >
            ← Volver al listado de financiamientos
          </Button>

          <Typography variant="h4" component="h1" gutterBottom>
            Detalles del Financiamiento
          </Typography>
        </Box>

        <Paper
          elevation={3}
          sx={{ p: 4, bgcolor: grisClaro, border: `1px solid ${grisMedio}` }}
        >
          {/* Header con estado */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 3,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                component="h2"
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                Financiamiento # {financiamiento._id?.slice(-8)}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Registrado el {formatDate(financiamiento.createdAt || '')}
              </Typography>
            </Box>
            <Chip
              label={financiamiento.estadoFinanciamiento}
              color={getEstadoColor(financiamiento.estadoFinanciamiento) as any}
              variant="filled"
              sx={{ fontSize: '1rem', padding: '8px 16px' }}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={4}>
            {/* Información del Cliente */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: 'primary.main', fontWeight: 600 }}
              >
                Información del Cliente
              </Typography>

              <Card sx={{ bgcolor: 'background.paper' }}>
                <CardContent>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    gutterBottom
                  >
                    Nombre
                  </Typography>
                  <Typography
                    variant="body1"
                    gutterBottom
                    sx={{ fontWeight: 500 }}
                  >
                    {typeof financiamiento.cliente === 'object'
                      ? financiamiento.cliente.NOMBRE
                      : 'N/A'}
                  </Typography>

                  {typeof financiamiento.cliente === 'object' &&
                    financiamiento.cliente.cedula && (
                      <>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          gutterBottom
                          sx={{ mt: 2 }}
                        >
                          Cédula
                        </Typography>
                        <Typography
                          variant="body1"
                          gutterBottom
                          sx={{ fontFamily: 'monospace' }}
                        >
                          {financiamiento.cliente.cedula}
                        </Typography>
                      </>
                    )}

                  <Typography
                    variant="body2"
                    color="textSecondary"
                    gutterBottom
                    sx={{ mt: 2 }}
                  >
                    Teléfono
                  </Typography>
                  <Typography
                    variant="body1"
                    gutterBottom
                    sx={{ fontFamily: 'monospace' }}
                  >
                    {typeof financiamiento.cliente === 'object'
                      ? financiamiento.cliente.TELEFONO || 'No especificado'
                      : 'N/A'}
                  </Typography>

                  {typeof financiamiento.cliente === 'object' &&
                    financiamiento.cliente.correo && (
                      <>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          gutterBottom
                          sx={{ mt: 2 }}
                        >
                          Correo Electrónico
                        </Typography>
                        <Typography
                          variant="body1"
                          gutterBottom
                          sx={{ wordBreak: 'break-word' }}
                        >
                          {financiamiento.cliente.correo}
                        </Typography>
                      </>
                    )}

                  {typeof financiamiento.cliente === 'object' &&
                    financiamiento.cliente.DIRECCION && (
                      <>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          gutterBottom
                          sx={{ mt: 2 }}
                        >
                          Dirección
                        </Typography>
                        <Typography
                          variant="body1"
                          gutterBottom
                          sx={{ lineHeight: 1.6 }}
                        >
                          {financiamiento.cliente.DIRECCION}
                        </Typography>
                      </>
                    )}

                  {typeof financiamiento.cliente === 'object' &&
                    financiamiento.cliente.profesion && (
                      <>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          gutterBottom
                          sx={{ mt: 2 }}
                        >
                          Profesión
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {financiamiento.cliente.profesion}
                        </Typography>
                      </>
                    )}
                </CardContent>
              </Card>
            </Grid>

            {/* Información del Segundo Cliente (si existe) */}
            {financiamiento.cliente2 &&
              typeof financiamiento.cliente2 === 'object' && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ color: 'primary.main', fontWeight: 600 }}
                  >
                    Información del Segundo Cliente
                  </Typography>

                  <Card sx={{ bgcolor: 'background.paper' }}>
                    <CardContent>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        gutterBottom
                      >
                        Nombre
                      </Typography>
                      <Typography
                        variant="body1"
                        gutterBottom
                        sx={{ fontWeight: 500 }}
                      >
                        {financiamiento.cliente2.NOMBRE}
                      </Typography>

                      {financiamiento.cliente2.cedula && (
                        <>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            gutterBottom
                            sx={{ mt: 2 }}
                          >
                            Cédula
                          </Typography>
                          <Typography
                            variant="body1"
                            gutterBottom
                            sx={{ fontFamily: 'monospace' }}
                          >
                            {financiamiento.cliente2.cedula}
                          </Typography>
                        </>
                      )}

                      <Typography
                        variant="body2"
                        color="textSecondary"
                        gutterBottom
                        sx={{ mt: 2 }}
                      >
                        Teléfono
                      </Typography>
                      <Typography
                        variant="body1"
                        gutterBottom
                        sx={{ fontFamily: 'monospace' }}
                      >
                        {financiamiento.cliente2.TELEFONO || 'No especificado'}
                      </Typography>

                      {financiamiento.cliente2.correo && (
                        <>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            gutterBottom
                            sx={{ mt: 2 }}
                          >
                            Correo Electrónico
                          </Typography>
                          <Typography
                            variant="body1"
                            gutterBottom
                            sx={{ wordBreak: 'break-word' }}
                          >
                            {financiamiento.cliente2.correo}
                          </Typography>
                        </>
                      )}

                      {financiamiento.cliente2.DIRECCION && (
                        <>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            gutterBottom
                            sx={{ mt: 2 }}
                          >
                            Dirección
                          </Typography>
                          <Typography
                            variant="body1"
                            gutterBottom
                            sx={{ lineHeight: 1.6 }}
                          >
                            {financiamiento.cliente2.DIRECCION}
                          </Typography>
                        </>
                      )}

                      {financiamiento.cliente2.profesion && (
                        <>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            gutterBottom
                            sx={{ mt: 2 }}
                          >
                            Profesión
                          </Typography>
                          <Typography variant="body1" gutterBottom>
                            {financiamiento.cliente2.profesion}
                          </Typography>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              )}

            {/* Información del Vehículo */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: 'primary.main', fontWeight: 600 }}
              >
                Información del Vehículo
              </Typography>

              <Card sx={{ bgcolor: 'background.paper' }}>
                <CardContent>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    gutterBottom
                  >
                    Marca y Modelo
                  </Typography>
                  <Typography
                    variant="body1"
                    gutterBottom
                    sx={{ fontWeight: 500 }}
                  >
                    {typeof financiamiento.vehiculo === 'object'
                      ? `${financiamiento.vehiculo.Marca} ${financiamiento.vehiculo.Modelo}`
                      : 'N/A'}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="textSecondary"
                    gutterBottom
                  >
                    Matrícula
                  </Typography>
                  <Typography
                    variant="body1"
                    gutterBottom
                    sx={{ fontFamily: 'monospace', fontWeight: 600 }}
                  >
                    {typeof financiamiento.vehiculo === 'object'
                      ? financiamiento.vehiculo.Matricula
                      : 'N/A'}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="textSecondary"
                    gutterBottom
                  >
                    Año
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {typeof financiamiento.vehiculo === 'object'
                      ? financiamiento.vehiculo.Año
                      : 'N/A'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Información Financiera */}
            <Grid size={{ xs: 12 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: 'primary.main', fontWeight: 600, mt: 2 }}
              >
                Información Financiera
              </Typography>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Card sx={{ bgcolor: 'background.paper' }}>
                    <CardContent>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        gutterBottom
                      >
                        Costo del Vehículo
                      </Typography>
                      <Typography
                        variant="h5"
                        gutterBottom
                        sx={{ fontWeight: 600, color: 'primary.main' }}
                      >
                        {formatCurrency(financiamiento.costoVehiculo)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <Card sx={{ bgcolor: 'background.paper' }}>
                    <CardContent>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        gutterBottom
                      >
                        Interés Total
                      </Typography>
                      <Typography
                        variant="h5"
                        gutterBottom
                        sx={{ fontWeight: 600, color: 'error.main' }}
                      >
                        {formatCurrency(financiamiento.interesTotal)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <Card sx={{ bgcolor: 'background.paper' }}>
                    <CardContent>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        gutterBottom
                      >
                        Monto Total
                      </Typography>
                      <Typography
                        variant="h5"
                        gutterBottom
                        sx={{ fontWeight: 600, color: 'success.main' }}
                      >
                        {formatCurrency(financiamiento.montoTotal)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <Card sx={{ bgcolor: 'background.paper' }}>
                    <CardContent>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        gutterBottom
                      >
                        Valor de Cuota
                      </Typography>
                      <Typography
                        variant="h5"
                        gutterBottom
                        sx={{ fontWeight: 600 }}
                      >
                        {formatCurrency(financiamiento.valorCuota)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>

            {/* Progreso del Financiamiento */}
            <Grid size={{ xs: 12 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: 'primary.main', fontWeight: 600, mt: 2 }}
              >
                Progreso del Financiamiento
              </Typography>

              <Card sx={{ bgcolor: 'background.paper' }}>
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        gutterBottom
                      >
                        Cuotas Pagadas / Total
                      </Typography>
                      <Typography variant="h6" gutterBottom>
                        {financiamiento.cuotasPagadas} / {financiamiento.cuotas}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={financiamiento.progresoFinanciamiento || 0}
                        sx={{ height: 10, borderRadius: 5, mt: 1 }}
                      />
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mt: 1 }}
                      >
                        {financiamiento.progresoFinanciamiento || 0}% completado
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        gutterBottom
                      >
                        Saldo Pendiente
                      </Typography>
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{ fontWeight: 600, color: 'warning.main' }}
                      >
                        {formatCurrency(financiamiento.saldoPendiente)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Monto pagado:{' '}
                        {formatCurrency(financiamiento.montoPagado)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Fechas Importantes */}
            <Grid size={{ xs: 12 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: 'primary.main', fontWeight: 600, mt: 2 }}
              >
                Fechas Importantes
              </Typography>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Card sx={{ bgcolor: 'background.paper' }}>
                    <CardContent>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        gutterBottom
                      >
                        Fecha de Venta
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {formatDate(financiamiento.fechaVenta)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Card sx={{ bgcolor: 'background.paper' }}>
                    <CardContent>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        gutterBottom
                      >
                        Primera Cuota
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {formatDate(financiamiento.fechaPrimeraCuota)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Card sx={{ bgcolor: 'background.paper' }}>
                    <CardContent>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        gutterBottom
                      >
                        Última Cuota
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {formatDate(financiamiento.fechaUltimaCuota)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>

            {/* Observaciones */}
            {financiamiento.observaciones && (
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: 'primary.main', fontWeight: 600, mt: 2 }}
                >
                  Observaciones
                </Typography>
                <Card sx={{ bgcolor: 'background.paper' }}>
                  <CardContent>
                    <Typography variant="body1">
                      {financiamiento.observaciones}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Historial de Pagos */}
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mt: 3,
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: 'primary.main', fontWeight: 600 }}
                >
                  Historial de Pagos
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setPagoModalOpen(true)}
                  disabled={
                    financiamiento.estadoFinanciamiento === 'finalizado'
                  }
                >
                  Registrar Pago
                </Button>
              </Box>

              <Card sx={{ bgcolor: 'background.paper', mt: 2 }}>
                <CardContent>
                  {pagos.length === 0 ? (
                    <Typography
                      variant="body1"
                      color="textSecondary"
                      align="center"
                      sx={{ py: 3 }}
                    >
                      No hay pagos registrados
                    </Typography>
                  ) : (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Cuota</TableCell>
                            <TableCell>Fecha</TableCell>
                            <TableCell>Monto</TableCell>
                            <TableCell>Método</TableCell>
                            <TableCell>Comprobante</TableCell>
                            <TableCell>Usuario</TableCell>
                            <TableCell>Acciones</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {pagos.map(pago => (
                            <TableRow key={pago._id}>
                              <TableCell>
                                {pago.esExtra ? (
                                  <Chip
                                    label="Extra"
                                    size="small"
                                    color="default"
                                  />
                                ) : (
                                  <Typography variant="body2" fontWeight={500}>
                                    #{pago.numeroCuota}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {formatDate(pago.fechaPago)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight={500}>
                                  {formatCurrency(pago.montoPago)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={pago.metodoPago}
                                  size="small"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {pago.numeroComprobante || '-'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {typeof pago.usuarioRegistro === 'object' &&
                                pago.usuarioRegistro?.nombre
                                  ? pago.usuarioRegistro.nombre
                                  : '-'}
                              </TableCell>
                              <TableCell>
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleVerDetallePago(pago)}
                                  title="Ver detalles"
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Información del Sistema */}
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: 'primary.main', fontWeight: 600 }}
              >
                Información del Sistema
              </Typography>

              <Grid container spacing={3}>
                {/* Fila 1: Creado por y Fecha de Creación */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                    >
                      Creado por
                    </Typography>
                    <Typography variant="body2">
                      {typeof financiamiento.usuarioCreacion === 'object' &&
                      financiamiento.usuarioCreacion?.nombre
                        ? financiamiento.usuarioCreacion.nombre
                        : typeof financiamiento.usuarioRegistro === 'object' &&
                            financiamiento.usuarioRegistro?.nombre
                          ? financiamiento.usuarioRegistro.nombre
                          : '-'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                    >
                      Fecha de Creación
                    </Typography>
                    <Typography variant="body2">
                      {financiamiento.createdAt
                        ? new Date(financiamiento.createdAt).toLocaleString(
                            'es-ES',
                            {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )
                        : 'No disponible'}
                    </Typography>
                  </Box>
                </Grid>

                {/* Fila 2: Modificado por y Última Actualización */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                    >
                      Modificado por
                    </Typography>
                    <Typography variant="body2">
                      {typeof financiamiento.usuarioModificacion === 'object' &&
                      financiamiento.usuarioModificacion?.nombre
                        ? financiamiento.usuarioModificacion.nombre
                        : '-'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                    >
                      Última Actualización
                    </Typography>
                    <Typography variant="body2">
                      {financiamiento.updatedAt
                        ? new Date(financiamiento.updatedAt).toLocaleString(
                            'es-ES',
                            {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )
                        : 'No disponible'}
                    </Typography>
                  </Box>
                </Grid>

                {/* Fila 3: ID de Base de Datos */}
                <Grid size={{ xs: 12 }}>
                  <Box>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                    >
                      ID de Base de Datos
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                    >
                      {financiamiento._id}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* Botones de acción */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'space-between',
              mt: 4,
              pt: 3,
              borderTop: `1px solid ${grisMedio}`,
            }}
          >
            <Box>
              <Button
                component={Link}
                href="/ciompi/financiamiento"
                variant="outlined"
                size="large"
              >
                Volver al Listado
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<PrintIcon />}
                onClick={() => {
                  window.open(
                    `/api/reports/financiaciones/${id}?format=pdf`,
                    '_blank'
                  );
                }}
              >
                Imprimir Detalles
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Modal para registrar pagos */}
        <PagoCuotaModal
          open={pagoModalOpen}
          onClose={() => setPagoModalOpen(false)}
          financiamientoId={financiamiento._id || ''}
          valorCuota={financiamiento.valorCuota}
          cuotasPagadas={financiamiento.cuotasPagadas}
          cuotasTotal={financiamiento.cuotas}
          onPagoRegistrado={handlePagoRegistrado}
        />

        {/* Modal para ver detalles del pago */}
        <Dialog
          open={pagoDetalleOpen}
          onClose={() => {
            setPagoDetalleOpen(false);
            setPagoSeleccionado(null);
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6">
              Detalles del Pago - Cuota #{pagoSeleccionado?.numeroCuota}
            </Typography>
          </DialogTitle>
          <DialogContent>
            {pagoSeleccionado && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="textSecondary">
                    Monto Pagado
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formatCurrency(pagoSeleccionado.montoPago)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="textSecondary">
                    Fecha de Pago
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(pagoSeleccionado.fechaPago)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="textSecondary">
                    Método de Pago
                  </Typography>
                  <Chip
                    label={pagoSeleccionado.metodoPago}
                    size="small"
                    variant="outlined"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="textSecondary">
                    Tipo
                  </Typography>
                  <Chip
                    label={
                      pagoSeleccionado.esExtra
                        ? 'Extra'
                        : `Cuota #${pagoSeleccionado.numeroCuota}`
                    }
                    size="small"
                    color={pagoSeleccionado.esExtra ? 'default' : 'primary'}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="textSecondary">
                    Estado
                  </Typography>
                  <Chip
                    label={pagoSeleccionado.estadoPago}
                    size="small"
                    color={
                      pagoSeleccionado.estadoPago === 'confirmado'
                        ? 'success'
                        : 'default'
                    }
                  />
                </Grid>
                {pagoSeleccionado.numeroComprobante && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="textSecondary">
                      Número de Comprobante
                    </Typography>
                    <Typography variant="body1">
                      {pagoSeleccionado.numeroComprobante}
                    </Typography>
                  </Grid>
                )}
                {pagoSeleccionado.banco && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="textSecondary">
                      Banco
                    </Typography>
                    <Typography variant="body1">
                      {pagoSeleccionado.banco}
                    </Typography>
                  </Grid>
                )}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="textSecondary">
                    Registrado por
                  </Typography>
                  <Typography variant="body1">
                    {typeof pagoSeleccionado.usuarioRegistro === 'object' &&
                    pagoSeleccionado.usuarioRegistro?.nombre
                      ? pagoSeleccionado.usuarioRegistro.nombre
                      : '-'}
                  </Typography>
                </Grid>
                {pagoSeleccionado.observaciones && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="textSecondary">
                      Observaciones
                    </Typography>
                    <Typography variant="body1">
                      {pagoSeleccionado.observaciones}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setPagoDetalleOpen(false);
                setPagoSeleccionado(null);
              }}
            >
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AuthGuard>
  );
}
