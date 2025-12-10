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
  Edit as EditIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

type FieldDataProps = {
  fieldName: string;
  fieldValue: string;
};
const FieldData = ({ fieldName, fieldValue }: FieldDataProps) => {
  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        {fieldName}
      </Typography>
      <Typography variant="body1" gutterBottom sx={{ fontWeight: 500 }}>
        {fieldValue}
      </Typography>
    </Box>
  );
};

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
        // Ordenar pagos: primero normales por número, luego extras por número o fecha
        const pagosOrdenados = [...pagosData].sort((a, b) => {
          // Primero separar por tipo: normales primero
          if (a.esExtra !== b.esExtra) {
            return a.esExtra ? 1 : -1;
          }
          // Si ambos son del mismo tipo, ordenar por número de cuota
          if (a.numeroCuota && b.numeroCuota) {
            return a.numeroCuota - b.numeroCuota;
          }
          // Si no tienen número, ordenar por fecha
          return (
            new Date(a.fechaPago).getTime() - new Date(b.fechaPago).getTime()
          );
        });
        setPagos(pagosOrdenados);
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

  // Función para generar todas las cuotas (normales y extras)
  const generarTodasLasCuotas = () => {
    if (!financiamiento) return [];

    // Calcular el monto pagado por cada cuota
    const pagosPorCuota: { [key: number]: number } = {};
    pagos
      .filter(
        pago =>
          !pago.esExtra && pago.numeroCuota && pago.estadoPago === 'confirmado'
      )
      .forEach(pago => {
        const numCuota = pago.numeroCuota!;
        if (!pagosPorCuota[numCuota]) {
          pagosPorCuota[numCuota] = 0;
        }
        pagosPorCuota[numCuota] += pago.montoPago;
      });

    const todasLasCuotas: Array<{
      numeroCuota: number;
      fechaVencimiento: Date;
      valorCuota: number;
      esExtra: boolean;
      pagada: boolean;
      montoPagado: number;
      montoPendiente: number;
    }> = [];

    // Si hay cuotasFuturas definidas, usarlas
    if (
      financiamiento.cuotasFuturas &&
      financiamiento.cuotasFuturas.length > 0
    ) {
      financiamiento.cuotasFuturas.forEach(cuota => {
        const fechaVencimiento = new Date(cuota.fechaVencimiento);
        const montoPagado = pagosPorCuota[cuota.numeroCuota] || 0;
        const pagada = montoPagado >= cuota.valorCuota;
        const montoPendiente = Math.max(0, cuota.valorCuota - montoPagado);

        todasLasCuotas.push({
          numeroCuota: cuota.numeroCuota,
          fechaVencimiento,
          valorCuota: cuota.valorCuota,
          esExtra: false,
          pagada,
          montoPagado,
          montoPendiente,
        });
      });
    } else {
      // Si no hay cuotasFuturas, calcular las fechas basándome en fechaPrimeraCuota
      const fechaPrimera = new Date(financiamiento.fechaPrimeraCuota);
      for (let i = 1; i <= financiamiento.cuotas; i++) {
        const fechaVencimiento = new Date(fechaPrimera);
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + i - 1);

        const montoPagado = pagosPorCuota[i] || 0;
        const pagada = montoPagado >= financiamiento.valorCuota;
        const montoPendiente = Math.max(
          0,
          financiamiento.valorCuota - montoPagado
        );

        todasLasCuotas.push({
          numeroCuota: i,
          fechaVencimiento,
          valorCuota: financiamiento.valorCuota,
          esExtra: false,
          pagada,
          montoPagado,
          montoPendiente,
        });
      }
    }

    // Agregar cuotas extras si existen
    // Nota: Las cuotas extras no están en cuotasFuturas, así que las calculamos
    // basándonos en cuotasExtras y fechaUltimaCuota
    if (financiamiento.cuotasExtras && financiamiento.cuotasExtras > 0) {
      // Obtener la fecha de la última cuota normal
      const fechaUltima =
        todasLasCuotas.length > 0
          ? new Date(todasLasCuotas[todasLasCuotas.length - 1].fechaVencimiento)
          : financiamiento.cuotasFuturas &&
              financiamiento.cuotasFuturas.length > 0
            ? new Date(
                financiamiento.cuotasFuturas[
                  financiamiento.cuotasFuturas.length - 1
                ].fechaVencimiento
              )
            : new Date(financiamiento.fechaUltimaCuota);

      // Obtener todos los pagos extras para verificar cuáles están pagados
      const pagosExtras = pagos.filter(
        pago => pago.esExtra && pago.estadoPago === 'confirmado'
      );

      for (let i = 1; i <= financiamiento.cuotasExtras; i++) {
        const fechaVencimiento = new Date(fechaUltima);
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + i);

        // Verificar si hay algún pago extra que corresponda a esta cuota
        // Como las cuotas extras pueden no tener número específico, verificamos por fecha aproximada
        const pagada = pagosExtras.some(pago => {
          const fechaPago = new Date(pago.fechaPago);
          // Considerar pagada si la fecha de pago está dentro de un mes de la fecha de vencimiento
          const diferenciaMeses = Math.abs(
            (fechaPago.getTime() - fechaVencimiento.getTime()) /
              (1000 * 60 * 60 * 24 * 30)
          );
          return diferenciaMeses < 1.5; // Tolerancia de 1.5 meses
        });

        // Para cuotas extras, calcular monto pagado si tienen numeroCuota
        const numeroCuotaExtra = financiamiento.cuotas + i;
        const montoPagadoExtra = pagos
          .filter(
            pago =>
              pago.esExtra &&
              pago.numeroCuota === numeroCuotaExtra &&
              pago.estadoPago === 'confirmado'
          )
          .reduce((sum, pago) => sum + pago.montoPago, 0);
        const montoPendienteExtra = Math.max(
          0,
          financiamiento.valorCuota - montoPagadoExtra
        );

        todasLasCuotas.push({
          numeroCuota: numeroCuotaExtra,
          fechaVencimiento,
          valorCuota: financiamiento.valorCuota, // O el valor específico si está disponible
          esExtra: true,
          pagada: montoPagadoExtra >= financiamiento.valorCuota,
          montoPagado: montoPagadoExtra,
          montoPendiente: montoPendienteExtra,
        });
      }
    }

    return todasLasCuotas.sort((a, b) => a.numeroCuota - b.numeroCuota);
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
      // Ordenar pagos: primero normales por número, luego extras por número o fecha
      const pagosOrdenados = [...pagosData].sort((a, b) => {
        // Primero separar por tipo: normales primero
        if (a.esExtra !== b.esExtra) {
          return a.esExtra ? 1 : -1;
        }
        // Si ambos son del mismo tipo, ordenar por número de cuota
        if (a.numeroCuota && b.numeroCuota) {
          return a.numeroCuota - b.numeroCuota;
        }
        // Si no tienen número, ordenar por fecha
        return (
          new Date(a.fechaPago).getTime() - new Date(b.fechaPago).getTime()
        );
      });
      setPagos(pagosOrdenados);
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
                    variant="subtitle2"
                    gutterBottom
                    sx={{ color: 'primary.main', fontWeight: 600, mb: 2 }}
                  >
                    Información Personal
                  </Typography>
                  <FieldData
                    fieldName="Nombre"
                    fieldValue={
                      typeof financiamiento.cliente === 'object'
                        ? financiamiento.cliente.NOMBRE
                        : 'N/A'
                    }
                  />
                  <FieldData
                    fieldName="Cédula"
                    fieldValue={
                      typeof financiamiento.cliente === 'object' &&
                      financiamiento.cliente.cedula
                        ? financiamiento.cliente.cedula
                        : 'No especificada'
                    }
                  />
                  <FieldData
                    fieldName="Profesión"
                    fieldValue={
                      typeof financiamiento.cliente === 'object' &&
                      financiamiento.cliente.profesion
                        ? financiamiento.cliente.profesion
                        : 'No especificada'
                    }
                  />
                  {/* Información de Contacto */}
                  <Divider sx={{ my: 3 }} />
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    sx={{ color: 'primary.main', fontWeight: 600, mb: 2 }}
                  >
                    Información de Contacto
                  </Typography>
                  <FieldData
                    fieldName="Teléfono"
                    fieldValue={
                      typeof financiamiento.cliente === 'object' &&
                      financiamiento.cliente.TELEFONO
                        ? financiamiento.cliente.TELEFONO
                        : 'No especificado'
                    }
                  />
                  <FieldData
                    fieldName="Correo Electrónico"
                    fieldValue={
                      typeof financiamiento.cliente === 'object' &&
                      financiamiento.cliente.correo
                        ? financiamiento.cliente.correo
                        : 'No especificado'
                    }
                  />
                  <FieldData
                    fieldName="Dirección"
                    fieldValue={
                      typeof financiamiento.cliente === 'object' &&
                      financiamiento.cliente.DIRECCION
                        ? financiamiento.cliente.DIRECCION
                        : 'No especificada'
                    }
                  />
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
                      {/* Información Personal */}
                      <Typography
                        variant="subtitle2"
                        gutterBottom
                        sx={{ color: 'primary.main', fontWeight: 600, mb: 2 }}
                      >
                        Información Personal
                      </Typography>
                      <FieldData
                        fieldName="Nombre"
                        fieldValue={
                          financiamiento.cliente2?.NOMBRE || 'No especificada'
                        }
                      />
                      <FieldData
                        fieldName="Cédula"
                        fieldValue={
                          financiamiento.cliente2?.cedula || 'No especificada'
                        }
                      />
                      <FieldData
                        fieldName="Profesión"
                        fieldValue={
                          financiamiento.cliente2?.profesion ||
                          'No especificada'
                        }
                      />

                      {/* Información de Contacto */}
                      <Divider sx={{ my: 3 }} />
                      <Typography
                        variant="subtitle2"
                        gutterBottom
                        sx={{ color: 'primary.main', fontWeight: 600, mb: 2 }}
                      >
                        Información de Contacto
                      </Typography>
                      <FieldData
                        fieldName="Teléfono"
                        fieldValue={
                          financiamiento.cliente2.TELEFONO || 'No especificado'
                        }
                      />
                      <FieldData
                        fieldName="Correo Electrónico"
                        fieldValue={
                          financiamiento.cliente2.correo || 'No especificado'
                        }
                      />
                      <FieldData
                        fieldName="Dirección"
                        fieldValue={
                          financiamiento.cliente2.DIRECCION || 'No especificada'
                        }
                      />
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
                  {typeof financiamiento.vehiculo === 'object' ? (
                    <>
                      <FieldData
                        fieldName="Marca"
                        fieldValue={
                          financiamiento.vehiculo.Marca || 'No especificada'
                        }
                      />
                      <FieldData
                        fieldName="Modelo"
                        fieldValue={
                          financiamiento.vehiculo.Modelo || 'No especificado'
                        }
                      />
                      <FieldData
                        fieldName="Matrícula"
                        fieldValue={
                          financiamiento.vehiculo.Matricula || 'No especificada'
                        }
                      />
                      <FieldData
                        fieldName="Padrón"
                        fieldValue={
                          financiamiento.vehiculo.Padron
                            ? financiamiento.vehiculo.Padron.toString()
                            : 'No especificado'
                        }
                      />
                      <FieldData
                        fieldName="Año"
                        fieldValue={
                          financiamiento.vehiculo.Año
                            ? financiamiento.vehiculo.Año.toString()
                            : 'No especificado'
                        }
                      />
                      <FieldData
                        fieldName="Color"
                        fieldValue={
                          financiamiento.vehiculo.Color || 'No especificado'
                        }
                      />
                      <FieldData
                        fieldName="Descripción"
                        fieldValue={
                          financiamiento.vehiculo.Descripcion ||
                          'No especificada'
                        }
                      />
                      <FieldData
                        fieldName="Disponible"
                        fieldValue={
                          financiamiento.vehiculo.disponible !== undefined
                            ? financiamiento.vehiculo.disponible
                              ? 'Sí'
                              : 'No'
                            : 'No especificado'
                        }
                      />
                    </>
                  ) : (
                    <Typography variant="body1" color="textSecondary">
                      No hay vehículo asignado
                    </Typography>
                  )}
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

            {/* Fechas de Cuotas */}
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mt: 2,
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: 'primary.main', fontWeight: 600 }}
                >
                  Fechas de Cuotas
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Chip
                    label={`Fecha de Venta: ${formatDate(financiamiento.fechaVenta)}`}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Box>

              <Card sx={{ bgcolor: 'background.paper' }}>
                <CardContent>
                  {generarTodasLasCuotas().length === 0 ? (
                    <Typography
                      variant="body1"
                      color="textSecondary"
                      align="center"
                      sx={{ py: 3 }}
                    >
                      No hay cuotas definidas
                    </Typography>
                  ) : (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>
                              Cuota
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              Fecha de Vencimiento
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                              Valor
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                              Pagado
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                              Pendiente
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600 }}>
                              Estado
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {generarTodasLasCuotas().map(cuota => {
                            const hoy = new Date();
                            hoy.setHours(0, 0, 0, 0);
                            const fechaVenc = new Date(cuota.fechaVencimiento);
                            fechaVenc.setHours(0, 0, 0, 0);
                            const vencida = !cuota.pagada && fechaVenc < hoy;

                            return (
                              <TableRow
                                key={cuota.numeroCuota}
                                sx={{
                                  bgcolor: cuota.pagada
                                    ? 'action.selected'
                                    : vencida
                                      ? 'error.light'
                                      : 'transparent',
                                  '&:hover': {
                                    bgcolor: 'action.hover',
                                  },
                                }}
                              >
                                <TableCell>
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      fontWeight={500}
                                    >
                                      #{cuota.numeroCuota}
                                    </Typography>
                                    {cuota.esExtra && (
                                      <Chip
                                        label="Extra"
                                        size="small"
                                        color="default"
                                        variant="outlined"
                                      />
                                    )}
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color:
                                        vencida && !cuota.pagada
                                          ? 'error.main'
                                          : 'inherit',
                                      fontWeight:
                                        vencida && !cuota.pagada ? 600 : 400,
                                    }}
                                  >
                                    {formatDate(cuota.fechaVencimiento)}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2" fontWeight={500}>
                                    {formatCurrency(cuota.valorCuota)}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography
                                    variant="body2"
                                    fontWeight={500}
                                    color={
                                      cuota.montoPagado > 0
                                        ? 'success.main'
                                        : 'text.secondary'
                                    }
                                  >
                                    {formatCurrency(cuota.montoPagado || 0)}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography
                                    variant="body2"
                                    fontWeight={500}
                                    color={
                                      cuota.montoPendiente > 0
                                        ? 'error.main'
                                        : 'text.secondary'
                                    }
                                  >
                                    {formatCurrency(cuota.montoPendiente || 0)}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  {cuota.pagada ? (
                                    <Chip
                                      label="Pagada"
                                      size="small"
                                      color="success"
                                      variant="filled"
                                    />
                                  ) : cuota.montoPagado > 0 ? (
                                    <Chip
                                      label="Parcial"
                                      size="small"
                                      color="warning"
                                      variant="filled"
                                    />
                                  ) : vencida ? (
                                    <Chip
                                      label="Vencida"
                                      size="small"
                                      color="error"
                                      variant="filled"
                                    />
                                  ) : (
                                    <Chip
                                      label="Pendiente"
                                      size="small"
                                      color="default"
                                      variant="outlined"
                                    />
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
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
                            <TableCell>Acciones</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {pagos.map(pago => (
                            <TableRow key={pago._id}>
                              <TableCell>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                  }}
                                >
                                  {pago.esExtra ? (
                                    <>
                                      <Chip
                                        label="Extra"
                                        size="small"
                                        color="warning"
                                        variant="filled"
                                      />
                                      {pago.numeroCuota && (
                                        <Typography
                                          variant="body2"
                                          fontWeight={500}
                                          color="textSecondary"
                                        >
                                          #{pago.numeroCuota}
                                        </Typography>
                                      )}
                                    </>
                                  ) : (
                                    <Typography
                                      variant="body2"
                                      fontWeight={500}
                                    >
                                      #{pago.numeroCuota}
                                    </Typography>
                                  )}
                                </Box>
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
                      {financiamiento.usuarioModificacion
                        ? typeof financiamiento.usuarioModificacion ===
                            'object' &&
                          financiamiento.usuarioModificacion?.nombre
                          ? financiamiento.usuarioModificacion.nombre
                          : '-'
                        : 'N/A'}
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
                component={Link}
                href={`/ciompi/financiamiento/${id}/editar`}
                variant="contained"
                color="primary"
                size="large"
                startIcon={<EditIcon />}
              >
                Editar Financiamiento
              </Button>
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
          cuotasExtras={financiamiento.cuotasExtras || 0}
          pagos={pagos}
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
            {pagoSeleccionado?.esExtra ? (
              <>
                Detalles del Pago - Cuota Extra
                {pagoSeleccionado.numeroCuota &&
                  ` #${pagoSeleccionado.numeroCuota}`}
              </>
            ) : (
              `Detalles del Pago - Cuota #${pagoSeleccionado?.numeroCuota}`
            )}
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
