'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  CircularProgress,
  Alert,
  Button,
  Typography,
  Paper,
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
  Print as PrintIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import Link from 'next/link';

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

export default function PagosAtrasados() {
  const [cuotasAtrasadas, setCuotasAtrasadas] = useState<CuotaAtrasada[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCargarCuotasAtrasadas = async () => {
    try {
      setLoading(true);
      setError(null);
      const resultados = await obtenerCuotasAtrasadas();
      setCuotasAtrasadas(resultados);
    } catch (err) {
      setError('Error al cargar cuotas atrasadas');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleCargarCuotasAtrasadas();
  }, []);

  return (
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
              disabled={loading}
              startIcon={
                loading ? <CircularProgress size={20} /> : <SearchIcon />
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
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && cuotasAtrasadas.length === 0 && !error && (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            No hay cuotas atrasadas
          </Typography>
        </Paper>
      )}

      {!loading && cuotasAtrasadas.length > 0 && (
        <Box>
          <Alert severity="error" sx={{ mb: 2 }}>
            Se encontraron {cuotasAtrasadas.length} cuota(s) atrasada(s)
          </Alert>
          <TableContainer component={Paper} elevation={2}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>#</TableCell>
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
                  const fechaVencimiento = new Date(cuota.fechaVencimiento);
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
                      <TableCell>{formatDate(fechaVencimiento)}</TableCell>
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
  );
}

