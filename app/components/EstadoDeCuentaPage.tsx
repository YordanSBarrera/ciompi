import React, { useState } from 'react';
import {
  Box,
  CircularProgress,
  Alert,
  TextField,
  Button,
  Container,
  Typography,
  Paper,
  InputAdornment,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Print as PrintIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import {
  formatMoney,
  normalizarMoneda,
  type MonedaFinanciamiento,
} from '@/lib/moneda';

interface EstadoCuenta {
  cliente: any;
  financiamientos: Array<{
    financiamientoId: string;
    numeroFinanciamiento: string;
    vehiculo: any;
    empresa: any;
    estadoFinanciamiento: string;
    fechaVenta: Date | string;
    montoTotal: number;
    montoPagado: number;
    saldoPendiente: number;
    cuotasTotal: number;
    cuotasPagadas: number;
    cuotasPendientes: number;
    cuotasVencidas: number;
    progreso: number;
    moneda: MonedaFinanciamiento;
  }>;
  cuotas: Array<{
    numeroCuota: number;
    fechaVencimiento: Date | string;
    valorCuota: number;
    montoPagado: number;
    montoPendiente: number;
    pagada: boolean;
    esExtra: boolean;
    financiamientoId: string;
    financiamientoNumero?: string;
    vehiculo: any;
    empresa: any;
    estado: 'pagada' | 'parcial' | 'vencida' | 'pendiente';
    diasAtraso?: number;
    moneda: MonedaFinanciamiento;
  }>;
  resumen: {
    totalFinanciamientos: number;
    totalMontoFinanciado: number;
    totalMontoPagado: number;
    totalSaldoPendiente: number;
    totalCuotas: number;
    totalCuotasPagadas: number;
    totalCuotasPendientes: number;
    totalCuotasVencidas: number;
    montoVencido: number;
    montosPorMoneda: Record<
      MonedaFinanciamiento,
      {
        totalMontoFinanciado: number;
        totalMontoPagado: number;
        totalSaldoPendiente: number;
        montoVencido: number;
      }
    >;
  };
}

// Función para obtener estado de cuenta de un cliente
async function obtenerEstadoCuenta(
  busqueda: string
): Promise<EstadoCuenta | null> {
  try {
    const response = await fetch(
      `/api/operaciones/estado-cuenta?busqueda=${encodeURIComponent(busqueda)}`
    );
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Cliente no encontrado');
      }
      throw new Error('Error al obtener estado de cuenta');
    }
    return await response.json();
  } catch (error) {
    console.error('Error obteniendo estado de cuenta:', error);
    throw error;
  }
}

const EstadoDeCuentaPage = () => {
  const [busquedaEstadoCuenta, setBusquedaEstadoCuenta] = useState('');
  const [loadingEstadoCuenta, setLoadingEstadoCuenta] = useState(false);

  const [hasSearchedEstadoCuenta, setHasSearchedEstadoCuenta] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estadoCuenta, setEstadoCuenta] = useState<EstadoCuenta | null>(null);

  const handleBuscarEstadoCuenta = async () => {
    if (!busquedaEstadoCuenta.trim()) {
      setError('Por favor ingrese un nombre o cédula de cliente');
      return;
    }
    try {
      setLoadingEstadoCuenta(true);
      setError(null);
      setHasSearchedEstadoCuenta(true);
      const resultado = await obtenerEstadoCuenta(busquedaEstadoCuenta.trim());
      setEstadoCuenta(resultado);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al buscar estado de cuenta'
      );
      setEstadoCuenta(null);
      console.error('Error:', err);
    } finally {
      setLoadingEstadoCuenta(false);
    }
  };

  const handleKeyPressEstadoCuenta = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBuscarEstadoCuenta();
    }
  };

  const handleLimpiarEstadoCuenta = () => {
    setBusquedaEstadoCuenta('');
    setEstadoCuenta(null);
    setError(null);
    setHasSearchedEstadoCuenta(false);
  };

  return (
    <>
      {/* Sección de Estado de Cuenta */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h6" component="h2">
            Estado de Cuenta del Cliente
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            label="Nombre o Cédula del Cliente"
            value={busquedaEstadoCuenta}
            onChange={e => setBusquedaEstadoCuenta(e.target.value)}
            onKeyPress={handleKeyPressEstadoCuenta}
            placeholder="Ingrese el nombre o cédula del cliente"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            onClick={handleBuscarEstadoCuenta}
            disabled={loadingEstadoCuenta || !busquedaEstadoCuenta.trim()}
            sx={{ minWidth: 120 }}
          >
            {loadingEstadoCuenta ? <CircularProgress size={24} /> : 'Buscar'}
          </Button>
          {hasSearchedEstadoCuenta && (
            <Button
              variant="outlined"
              onClick={handleLimpiarEstadoCuenta}
              startIcon={<ClearIcon />}
            >
              Limpiar
            </Button>
          )}
        </Box>
      </Paper>

      {loadingEstadoCuenta && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <CircularProgress />
        </Box>
      )}

      {error && !loadingEstadoCuenta && hasSearchedEstadoCuenta && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loadingEstadoCuenta && !hasSearchedEstadoCuenta && !estadoCuenta && (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            Ingrese el nombre o cédula de un cliente para ver su estado de
            cuenta
          </Typography>
        </Paper>
      )}

      {!loadingEstadoCuenta &&
        estadoCuenta &&
        estadoCuenta.financiamientos.length === 0 && (
          <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              El cliente no tiene financiamientos asociados
            </Typography>
          </Paper>
        )}

      {!loadingEstadoCuenta &&
        estadoCuenta &&
        estadoCuenta.financiamientos.length > 0 && (
          <Box>
            {/* Resumen del Cliente */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Cliente: {estadoCuenta.cliente.NOMBRE}
              </Typography>
              {estadoCuenta.cliente.cedula && (
                <Typography variant="body2" color="textSecondary">
                  Cédula: {estadoCuenta.cliente.cedula}
                </Typography>
              )}
              {estadoCuenta.cliente.TELEFONO && (
                <Typography variant="body2" color="textSecondary">
                  Teléfono: {estadoCuenta.cliente.TELEFONO}
                </Typography>
              )}
            </Paper>

            {/* Resumen General */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Resumen General
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Montos agrupados por moneda del contrato; registros sin moneda se
                consideran USD.
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(5, 1fr)',
                  },
                  gap: 2,
                  mb: 3,
                }}
              >
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Total financiamientos
                  </Typography>
                  <Typography variant="h6">
                    {estadoCuenta.resumen.totalFinanciamientos}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Total cuotas
                  </Typography>
                  <Typography variant="h6">
                    {estadoCuenta.resumen.totalCuotas}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Cuotas pagadas
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {estadoCuenta.resumen.totalCuotasPagadas}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Cuotas pendientes
                  </Typography>
                  <Typography variant="h6" color="warning.main">
                    {estadoCuenta.resumen.totalCuotasPendientes}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Cuotas vencidas
                  </Typography>
                  <Typography variant="h6" color="error.main">
                    {estadoCuenta.resumen.totalCuotasVencidas}
                  </Typography>
                </Box>
              </Box>

              {(['USD', 'UYU'] as const).map(moneda => {
                const d =
                  estadoCuenta.resumen.montosPorMoneda?.[moneda] ?? {
                    totalMontoFinanciado: 0,
                    totalMontoPagado: 0,
                    totalSaldoPendiente: 0,
                    montoVencido: 0,
                  };
                return (
                  <Box
                    key={moneda}
                    sx={{
                      mb: 2,
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      {moneda === 'USD'
                        ? 'Dólares (USD)'
                        : 'Pesos uruguayos (UYU)'}
                    </Typography>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: '1fr',
                          sm: 'repeat(2, 1fr)',
                          md: 'repeat(4, 1fr)',
                        },
                        gap: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Monto total financiado
                        </Typography>
                        <Typography variant="h6" color="primary">
                          {formatMoney(d.totalMontoFinanciado, moneda)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Monto pagado
                        </Typography>
                        <Typography variant="h6" color="success.main">
                          {formatMoney(d.totalMontoPagado, moneda)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Saldo pendiente
                        </Typography>
                        <Typography variant="h6" color="warning.main">
                          {formatMoney(d.totalSaldoPendiente, moneda)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Monto cuotas vencidas
                        </Typography>
                        <Typography variant="h6" color="error.main">
                          {formatMoney(d.montoVencido, moneda)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Paper>

            {/* Resumen por Financiamiento */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Resumen por Financiamiento
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Mon.</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Vehículo</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Empresa</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        Monto Total
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        Pagado
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        Pendiente
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>
                        Cuotas
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>
                        Progreso
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>
                        Acciones
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {estadoCuenta.financiamientos.map((fin, index) => {
                      const vehiculoInfo =
                        typeof fin.vehiculo === 'object' && fin.vehiculo
                          ? `${fin.vehiculo.Marca || ''} ${fin.vehiculo.Modelo || ''}`.trim()
                          : 'N/A';
                      const empresaInfo =
                        typeof fin.empresa === 'object' && fin.empresa
                          ? fin.empresa.nombre
                          : 'N/A';
                      const estadoColor =
                        fin.estadoFinanciamiento === 'activo'
                          ? 'success'
                          : fin.estadoFinanciamiento === 'en_mora'
                            ? 'error'
                            : fin.estadoFinanciamiento === 'finalizado'
                              ? 'info'
                              : 'default';

                      return (
                        <TableRow key={fin.financiamientoId}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <Chip
                              label={normalizarMoneda(fin.moneda)}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>{vehiculoInfo}</TableCell>
                          <TableCell>{empresaInfo}</TableCell>
                          <TableCell>
                            <Chip
                              label={fin.estadoFinanciamiento}
                              size="small"
                              color={estadoColor as any}
                            />
                          </TableCell>
                          <TableCell align="right">
                            {formatMoney(
                              fin.montoTotal,
                              normalizarMoneda(fin.moneda)
                            )}
                          </TableCell>
                          <TableCell align="right" style={{ color: '#4caf50' }}>
                            {formatMoney(
                              fin.montoPagado,
                              normalizarMoneda(fin.moneda)
                            )}
                          </TableCell>
                          <TableCell align="right" style={{ color: '#ff9800' }}>
                            {formatMoney(
                              fin.saldoPendiente,
                              normalizarMoneda(fin.moneda)
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {fin.cuotasPagadas}/{fin.cuotasTotal}
                            {fin.cuotasVencidas > 0 && (
                              <Chip
                                label={`${fin.cuotasVencidas} vencidas`}
                                size="small"
                                color="error"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </TableCell>
                          <TableCell align="center">{fin.progreso}%</TableCell>
                          <TableCell align="center">
                            <Tooltip title="Ver detalles">
                              <IconButton
                                size="small"
                                color="primary"
                                component={Link}
                                href={`/ciompi/financiamiento/${fin.financiamientoId}`}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Tabla de Cuotas */}
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Todas las Cuotas ({estadoCuenta.cuotas.length})
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Fin.</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Vehículo</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>
                        Cuota
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>
                        Vencimiento
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
                    {estadoCuenta.cuotas.map((cuota, index) => {
                      const fechaVencimiento = new Date(cuota.fechaVencimiento);
                      const mCuota = normalizarMoneda(cuota.moneda);
                      const formatDate = (date: Date) => {
                        return date.toLocaleDateString('es-UY');
                      };
                      const vehiculoInfo =
                        typeof cuota.vehiculo === 'object' && cuota.vehiculo
                          ? `${cuota.vehiculo.Marca || ''} ${cuota.vehiculo.Modelo || ''}`.trim()
                          : 'N/A';

                      const estadoColor =
                        cuota.estado === 'pagada'
                          ? 'success'
                          : cuota.estado === 'parcial'
                            ? 'warning'
                            : cuota.estado === 'vencida'
                              ? 'error'
                              : 'default';

                      return (
                        <TableRow
                          key={`${cuota.financiamientoId}-${cuota.numeroCuota}`}
                          sx={{
                            bgcolor:
                              cuota.estado === 'pagada'
                                ? 'action.selected'
                                : cuota.estado === 'vencida'
                                  ? 'error.light'
                                  : 'transparent',
                            '&:hover': {
                              bgcolor: 'action.hover',
                            },
                          }}
                        >
                          <TableCell>{index + 1}</TableCell>
                          <TableCell style={{ fontSize: '0.75rem' }}>
                            {cuota.financiamientoNumero || 'N/A'}
                          </TableCell>
                          <TableCell style={{ fontSize: '0.75rem' }}>
                            {vehiculoInfo}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={`#${cuota.numeroCuota}${cuota.esExtra ? ' (Extra)' : ''}`}
                              size="small"
                              color="default"
                            />
                          </TableCell>
                          <TableCell align="center">
                            {formatDate(fechaVencimiento)}
                          </TableCell>
                          <TableCell align="right">
                            {formatMoney(cuota.valorCuota, mCuota)}
                          </TableCell>
                          <TableCell align="right" style={{ color: '#4caf50' }}>
                            {formatMoney(cuota.montoPagado || 0, mCuota)}
                          </TableCell>
                          <TableCell align="right" style={{ color: '#f44336' }}>
                            {formatMoney(cuota.montoPendiente || 0, mCuota)}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={
                                cuota.estado === 'pagada'
                                  ? 'Pagada'
                                  : cuota.estado === 'parcial'
                                    ? 'Parcial'
                                    : cuota.estado === 'vencida'
                                      ? `Vencida${cuota.diasAtraso ? ` (${cuota.diasAtraso}d)` : ''}`
                                      : 'Pendiente'
                              }
                              size="small"
                              color={estadoColor as any}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {estadoCuenta && estadoCuenta.financiamientos.length > 0 && (
              <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={() => {
                    window.open(
                      `/api/reports/estado-cuenta?busqueda=${encodeURIComponent(busquedaEstadoCuenta)}`,
                      '_blank'
                    );
                  }}
                  startIcon={<PrintIcon />}
                  color="primary"
                >
                  Imprimir Estado de Cuenta
                </Button>
              </Paper>
            )}
          </Box>
        )}
    </>
  );
};

export default EstadoDeCuentaPage;
