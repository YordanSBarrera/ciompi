'use client';
import { FinanciamientoType } from '@/lib/types';
import AuthGuard from '@/app/components/AuthGuard';
import ListaFinanciamientos from '@/app/components/ListaFinanciamientos';
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
  Warning as WarningIcon,
  Visibility as VisibilityIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import EstadoDeCuentaPage from '../../components/EstadoDeCuentaPage';

// Función para buscar financiamientos por nombre de cliente
async function buscarFinanciamientosPorCliente(
  nombreCliente: string
): Promise<FinanciamientoType[]> {
  try {
    const response = await fetch(
      `/api/financiamiento?nombreCliente=${encodeURIComponent(nombreCliente)}`
    );
    if (!response.ok) {
      throw new Error('Error al buscar financiamientos');
    }
    return await response.json();
  } catch (error) {
    console.error('Error buscando financiamientos:', error);
    return [];
  }
}

// Función para obtener financiamientos con cuotas atrasadas
async function obtenerFinanciamientosAtrasados(): Promise<
  (FinanciamientoType & { cuotasAtrasadas?: number; montoAtrasado?: number })[]
> {
  try {
    const response = await fetch('/api/financiamiento/atrasados');
    if (!response.ok) {
      throw new Error('Error al obtener financiamientos atrasados');
    }
    return await response.json();
  } catch (error) {
    console.error('Error obteniendo financiamientos atrasados:', error);
    return [];
  }
}

// Interfaz para cuotas atrasadas
interface CuotaAtrasada {
  numeroCuota: number;
  fechaVencimiento: Date | string;
  valorCuota: number;
  financiamientoId: string;
  cliente: any;
  vehiculo: any;
  empresa: any;
  diasAtraso: number;
}

// Interfaz para estado de cuenta

// Función para obtener todas las cuotas atrasadas
async function obtenerCuotasAtrasadas(): Promise<CuotaAtrasada[]> {
  try {
    const response = await fetch('/api/pagos-cuotas/atrasadas');
    if (!response.ok) {
      throw new Error('Error al obtener cuotas atrasadas');
    }
    return await response.json();
  } catch (error) {
    console.error('Error obteniendo cuotas atrasadas:', error);
    return [];
  }
}

export default function OperacionesPage() {
  const [tabValue, setTabValue] = useState(0);
  const [financiamientos, setFinanciamientos] = useState<FinanciamientoType[]>(
    []
  );
  const [financiamientosAtrasados, setFinanciamientosAtrasados] = useState<
    (FinanciamientoType & {
      cuotasAtrasadas?: number;
      montoAtrasado?: number;
    })[]
  >([]);
  const [cuotasAtrasadas, setCuotasAtrasadas] = useState<CuotaAtrasada[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAtrasados, setLoadingAtrasados] = useState(false);
  const [loadingCuotasAtrasadas, setLoadingCuotasAtrasadas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nombreCliente, setNombreCliente] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleBuscar = async () => {
    if (!nombreCliente.trim()) {
      setError('Por favor ingrese un nombre de cliente');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);
      const resultados = await buscarFinanciamientosPorCliente(
        nombreCliente.trim()
      );
      setFinanciamientos(resultados);

      if (resultados.length === 0) {
        setError(
          `No se encontraron financiamientos para el cliente "${nombreCliente}"`
        );
      }
    } catch (err) {
      setError('Error al buscar financiamientos');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiar = () => {
    setNombreCliente('');
    setFinanciamientos([]);
    setError(null);
    setHasSearched(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBuscar();
    }
  };

  const handleFinanciamientoEliminado = () => {
    // Recargar la lista después de eliminar un financiamiento
    if (nombreCliente.trim()) {
      handleBuscar();
    }
  };

  const handleCargarAtrasados = async () => {
    try {
      setLoadingAtrasados(true);
      setError(null);
      const resultados = await obtenerFinanciamientosAtrasados();
      setFinanciamientosAtrasados(resultados);
    } catch (err) {
      setError('Error al cargar financiamientos atrasados');
      console.error('Error:', err);
    } finally {
      setLoadingAtrasados(false);
    }
  };

  const handleImprimirListadoAtrasados = () => {
    window.open(`/api/reports/financiamientos-atrasados?format=pdf`, '_blank');
  };

  const handleImprimirFinanciamientoAtrasado = (id: string) => {
    window.open(`/api/reports/financiaciones/${id}?format=pdf`, '_blank');
  };

  const handleCargarCuotasAtrasadas = async () => {
    try {
      setLoadingCuotasAtrasadas(true);
      setError(null);
      const resultados = await obtenerCuotasAtrasadas();
      setCuotasAtrasadas(resultados);
    } catch (err) {
      setError('Error al cargar cuotas atrasadas');
      console.error('Error:', err);
    } finally {
      setLoadingCuotasAtrasadas(false);
    }
  };

  useEffect(() => {
    if (tabValue === 1 && financiamientosAtrasados.length === 0) {
      handleCargarAtrasados();
    }
    if (tabValue === 2 && cuotasAtrasadas.length === 0) {
      handleCargarCuotasAtrasadas();
    }
  }, [tabValue]);

  return (
    <AuthGuard>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Operaciones
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Buscar financiamientos y gestionar cuotas atrasadas
          </Typography>
        </Box>

        {/* Tabs para alternar entre búsqueda, atrasados y cuotas atrasadas */}
        <Paper elevation={2} sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
              },
            }}
          >
            <Tab label="Búsqueda por Cliente" />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WarningIcon color="warning" />
                  <span>Financiamientos Atrasados</span>
                  {financiamientosAtrasados.length > 0 && (
                    <Chip
                      label={financiamientosAtrasados.length}
                      size="small"
                      color="error"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WarningIcon color="error" />
                  <span>Pagos Atrasados</span>
                  {cuotasAtrasadas.length > 0 && (
                    <Chip
                      label={cuotasAtrasadas.length}
                      size="small"
                      color="error"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccountBalanceIcon color="primary" />
                  <span>Estado de Cuenta</span>
                </Box>
              }
            />
          </Tabs>
        </Paper>

        {/* Contenido según tab seleccionado */}
        {tabValue === 0 && (
          <>
            {/* Búsqueda */}
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  fullWidth
                  label="Nombre del Cliente"
                  value={nombreCliente}
                  onChange={e => setNombreCliente(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ingrese el nombre del cliente"
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
                  onClick={handleBuscar}
                  disabled={loading || !nombreCliente.trim()}
                  sx={{ minWidth: 120 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Buscar'}
                </Button>
                {hasSearched && (
                  <Button
                    variant="outlined"
                    onClick={handleLimpiar}
                    startIcon={<ClearIcon />}
                  >
                    Limpiar
                  </Button>
                )}
              </Box>
            </Paper>
          </>
        )}

        {tabValue === 1 && (
          <>
            {/* Sección de Financiamientos Atrasados */}
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
                  Financiamientos con Cuotas Atrasadas
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleCargarAtrasados}
                    disabled={loadingAtrasados}
                    startIcon={
                      loadingAtrasados ? (
                        <CircularProgress size={20} />
                      ) : (
                        <SearchIcon />
                      )
                    }
                  >
                    Actualizar
                  </Button>
                  {financiamientosAtrasados.length > 0 && (
                    <Button
                      variant="contained"
                      onClick={handleImprimirListadoAtrasados}
                      startIcon={<PrintIcon />}
                      color="primary"
                    >
                      Imprimir Listado
                    </Button>
                  )}
                </Box>
              </Box>
            </Paper>
          </>
        )}

        {/* Resultados según tab */}
        {tabValue === 0 && (
          <>
            {loading && (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="50vh"
              >
                <CircularProgress />
              </Box>
            )}

            {error && !loading && (
              <Alert
                severity={
                  hasSearched && financiamientos.length === 0 ? 'info' : 'error'
                }
                sx={{ mb: 2 }}
              >
                {error}
              </Alert>
            )}

            {!loading && hasSearched && financiamientos.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                  {financiamientos.length} financiamiento(s) encontrado(s) para
                  "{nombreCliente}"
                </Typography>
                <ListaFinanciamientos
                  financiamientos={financiamientos}
                  onFinanciamientoEliminado={handleFinanciamientoEliminado}
                />
              </Box>
            )}

            {!loading && !hasSearched && (
              <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="textSecondary">
                  Ingrese el nombre de un cliente para buscar sus
                  financiamientos
                </Typography>
              </Paper>
            )}
          </>
        )}

        {tabValue === 1 && (
          <>
            {loadingAtrasados && (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="50vh"
              >
                <CircularProgress />
              </Box>
            )}

            {error && !loadingAtrasados && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {!loadingAtrasados &&
              financiamientosAtrasados.length === 0 &&
              !error && (
                <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body1" color="textSecondary">
                    No hay financiamientos con cuotas atrasadas
                  </Typography>
                </Paper>
              )}

            {!loadingAtrasados && financiamientosAtrasados.length > 0 && (
              <Box>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Se encontraron {financiamientosAtrasados.length}{' '}
                  financiamiento(s) con cuotas atrasadas
                </Alert>
                <ListaFinanciamientos
                  financiamientos={financiamientosAtrasados}
                  onFinanciamientoEliminado={handleCargarAtrasados}
                  mostrarAtrasos={true}
                  onImprimir={handleImprimirFinanciamientoAtrasado}
                />
              </Box>
            )}
          </>
        )}

        {tabValue === 2 && (
          <>
            {/* Sección de Pagos Atrasados */}
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
                  Cuotas Atrasadas
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleCargarCuotasAtrasadas}
                    disabled={loadingCuotasAtrasadas}
                    startIcon={
                      loadingCuotasAtrasadas ? (
                        <CircularProgress size={20} />
                      ) : (
                        <SearchIcon />
                      )
                    }
                  >
                    Actualizar
                  </Button>
                  {cuotasAtrasadas.length > 0 && (
                    <Button
                      variant="contained"
                      onClick={() => {
                        window.open(
                          `/api/reports/pagos-cuotas-atrasadas?format=pdf`,
                          '_blank'
                        );
                      }}
                      startIcon={<PrintIcon />}
                      color="primary"
                    >
                      Imprimir Listado
                    </Button>
                  )}
                </Box>
              </Box>
            </Paper>

            {loadingCuotasAtrasadas && (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="50vh"
              >
                <CircularProgress />
              </Box>
            )}

            {error && !loadingCuotasAtrasadas && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {!loadingCuotasAtrasadas &&
              cuotasAtrasadas.length === 0 &&
              !error && (
                <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body1" color="textSecondary">
                    No hay cuotas atrasadas
                  </Typography>
                </Paper>
              )}

            {!loadingCuotasAtrasadas && cuotasAtrasadas.length > 0 && (
              <Box>
                <Alert severity="error" sx={{ mb: 2 }}>
                  Se encontraron {cuotasAtrasadas.length} cuota(s) atrasada(s)
                </Alert>
                <TableContainer component={Paper} elevation={2}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'primary.main' }}>
                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                          #
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                          Cliente
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                          Vehículo
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                          Cuota
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                          Fecha Vencimiento
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                          Días Atraso
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ color: 'white', fontWeight: 600 }}
                        >
                          Valor Cuota
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ color: 'white', fontWeight: 600 }}
                        >
                          Acciones
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cuotasAtrasadas.map((cuota, index) => {
                        const clienteNombre =
                          typeof cuota.cliente === 'object'
                            ? cuota.cliente.NOMBRE
                            : 'N/A';
                        const vehiculoInfo =
                          typeof cuota.vehiculo === 'object' && cuota.vehiculo
                            ? `${cuota.vehiculo.Marca || ''} ${cuota.vehiculo.Modelo || ''}`.trim()
                            : 'N/A';
                        const fechaVencimiento = new Date(
                          cuota.fechaVencimiento
                        );
                        const formatDate = (date: Date) => {
                          return date.toLocaleDateString('es-UY');
                        };
                        const formatCurrency = (amount: number) => {
                          return new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 2,
                          }).format(amount);
                        };

                        return (
                          <TableRow
                            key={`${cuota.financiamientoId}-${cuota.numeroCuota}`}
                            sx={{
                              '&:nth-of-type(odd)': {
                                backgroundColor: 'action.hover',
                              },
                              '&:hover': {
                                backgroundColor: 'action.selected',
                              },
                            }}
                          >
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{clienteNombre}</TableCell>
                            <TableCell>{vehiculoInfo}</TableCell>
                            <TableCell>
                              <Chip
                                label={`#${cuota.numeroCuota}`}
                                size="small"
                                color="default"
                              />
                            </TableCell>
                            <TableCell>
                              {formatDate(fechaVencimiento)}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={`${cuota.diasAtraso} días`}
                                size="small"
                                color="error"
                              />
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(cuota.valorCuota)}
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="Ver detalles del financiamiento">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  component={Link}
                                  href={`/ciompi/financiamiento/${cuota.financiamientoId}`}
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
              </Box>
            )}
          </>
        )}

        {tabValue === 3 && <EstadoDeCuentaPage />}
      </Container>
    </AuthGuard>
  );
}
