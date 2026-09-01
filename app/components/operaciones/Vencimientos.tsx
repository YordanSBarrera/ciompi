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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Pagination,
} from '@mui/material';
import {
  Search as SearchIcon,
  Print as PrintIcon,
  Visibility as VisibilityIcon,
  CalendarToday as CalendarIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { FinanciamientoType } from '@/lib/types';
import {
  azulBase,
  azulOscuro,
  blanco,
  grisClaro,
  grisMedio,
  grisTexto,
} from '@/lib/color';
import { formatMoney, normalizarMoneda } from '@/lib/moneda';
import { useEmpresas } from '@/app/hook/useEmpresas';

interface CuotaPorVencer {
  numeroCuota: number;
  fechaVencimiento: Date | string;
  valorCuota: number;
}

interface FinanciamientoConVencimientos extends FinanciamientoType {
  cuotasPorVencer: CuotaPorVencer[];
  totalCuotasPorVencer: number;
  montoTotalPorVencer: number;
}

// Función para obtener vencimientos
async function obtenerVencimientos(
  empresaId: string,
  fechaInicio: string,
  fechaFin: string
): Promise<FinanciamientoConVencimientos[]> {
  try {
    const params = new URLSearchParams({
      empresa: empresaId,
      fechaInicio,
      fechaFin,
    });
    const response = await fetch(
      `/api/operaciones/vencimientos?${params.toString()}`
    );
    if (!response.ok) {
      throw new Error('Error al obtener vencimientos');
    }
    const result = await response.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error('Error obteniendo vencimientos:', error);
    return [];
  }
}

export default function Vencimientos() {
  const { empresas, loading: loadingEmpresas } = useEmpresas();
  const router = useRouter();
  const [empresaId, setEmpresaId] = useState<string>('');
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');
  const [vencimientos, setVencimientos] = useState<
    FinanciamientoConVencimientos[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const pagination = {
    page,
    limit: pageSize,
    total: vencimientos.length,
    pages: Math.ceil(vencimientos.length / pageSize),
  };

  const vencimientosPaginados = vencimientos.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  // Establecer fechas por defecto (mes actual)
  useEffect(() => {
    const hoy = new Date();
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

    setFechaInicio(primerDia.toISOString().split('T')[0]);
    setFechaFin(ultimoDia.toISOString().split('T')[0]);
  }, []);

  const handleBuscar = async () => {
    if (!empresaId || !fechaInicio || !fechaFin) {
      setError('Por favor complete los campos requeridos');
      return;
    }

    if (new Date(fechaInicio) > new Date(fechaFin)) {
      setError('La fecha de inicio debe ser anterior a la fecha fin');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const resultados = await obtenerVencimientos(
        empresaId,
        fechaInicio,
        fechaFin
      );
      setVencimientos(resultados);
      setPage(1);
    } catch (err) {
      setError('Error al buscar vencimientos');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-UY', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const handleVerDetalles = (id: string) => {
    router.push(`/ciompi/financiamiento/${id}`);
  };

  const totalPorMoneda = vencimientos.reduce(
    (acc, fin) => {
      const m = normalizarMoneda(fin.moneda);
      acc[m] += fin.montoTotalPorVencer || 0;
      return acc;
    },
    { USD: 0, UYU: 0 }
  );
  const totalCuotasPorVencer = vencimientos.reduce(
    (sum, fin) => sum + (fin.totalCuotasPorVencer || 0),
    0
  );

  return (
    <>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            mb: 3,
          }}
        >
          <Typography variant="h6" component="h2">
            Cuotas por Vencer
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel>Empresa</InputLabel>
              <Select
                value={empresaId}
                onChange={e => setEmpresaId(e.target.value)}
                label="Empresa"
                disabled={loadingEmpresas}
                startAdornment={
                  <BusinessIcon sx={{ mr: 1, color: 'action.active' }} />
                }
              >
                <MenuItem value="">
                  <em>Seleccionar empresa</em>
                </MenuItem>
                {empresas
                  .filter(e => e.estado === 'activa')
                  .map(empresa => (
                    <MenuItem key={empresa._id} value={empresa._id}>
                      {empresa.nombre}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <Chip
              icon={<CalendarIcon />}
              label={`${vencimientos.length} financiamientos`}
              color="primary"
              variant="outlined"
            />
            {vencimientos.length > 0 && empresaId && (
              <Button
                variant="contained"
                onClick={() => {
                  const params = new URLSearchParams({
                    empresa: empresaId,
                    fechaInicio,
                    fechaFin,
                  });
                  window.open(
                    `/api/reports/vencimientos?${params.toString()}`,
                    '_blank'
                  );
                }}
                startIcon={<PrintIcon />}
                sx={{
                  background: `linear-gradient(135deg, ${azulBase} 0%, ${azulOscuro} 100%)`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${azulOscuro} 0%, ${azulBase} 100%)`,
                  },
                }}
              >
                Imprimir
              </Button>
            )}
          </Box>
        </Box>

        {/* Filtros */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              label="Fecha Inicio"
              type="date"
              value={fechaInicio}
              onChange={e => setFechaInicio(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              disabled={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              label="Fecha Fin"
              type="date"
              value={fechaFin}
              onChange={e => setFechaFin(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              disabled={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleBuscar}
              disabled={loading || !empresaId}
              startIcon={
                loading ? <CircularProgress size={20} /> : <SearchIcon />
              }
              sx={{
                height: '56px',
                background: `linear-gradient(135deg, ${azulBase} 0%, ${azulOscuro} 100%)`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${azulOscuro} 0%, ${azulBase} 100%)`,
                },
              }}
            >
              Buscar
            </Button>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Resumen */}
        {vencimientos.length > 0 && (
          <Box
            sx={{
              p: 2,
              mb: 2,
              backgroundColor: grisClaro,
              borderRadius: 2,
              display: 'flex',
              gap: 3,
              flexWrap: 'wrap',
            }}
          >
            <Typography variant="body1" fontWeight={600}>
              Total Cuotas:{' '}
              <Chip label={totalCuotasPorVencer} color="primary" size="small" />
            </Typography>
            <Typography
              variant="body1"
              fontWeight={600}
              component="div"
              sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}
            >
              Total por moneda:
              <Chip
                label={formatMoney(totalPorMoneda.USD, 'USD')}
                color="primary"
                size="small"
                variant="outlined"
              />
              <Chip
                label={formatMoney(totalPorMoneda.UYU, 'UYU')}
                color="primary"
                size="small"
                variant="outlined"
              />
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Tabla de resultados */}
      {vencimientos.length > 0 && (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: azulBase }}>
                <TableCell sx={{ color: blanco, fontWeight: 600 }}>
                  Cliente
                </TableCell>
                <TableCell sx={{ color: blanco, fontWeight: 600 }}>
                  Vehículo
                </TableCell>
                <TableCell sx={{ color: blanco, fontWeight: 600 }}>
                  Cuotas por Vencer
                </TableCell>
                <TableCell sx={{ color: blanco, fontWeight: 600 }}>
                  Monto Total
                </TableCell>
                <TableCell sx={{ color: blanco, fontWeight: 600 }}>
                  Próxima Cuota
                </TableCell>
                <TableCell sx={{ color: blanco, fontWeight: 600 }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vencimientosPaginados.map((fin, index) => {
                const clienteNombre =
                  typeof fin.cliente === 'object' && fin.cliente
                    ? fin.cliente.NOMBRE
                    : 's/n';
                const vehiculoInfo =
                  typeof fin.vehiculo === 'object' && fin.vehiculo
                    ? `${fin.vehiculo.Marca ?? ''} ${fin.vehiculo.Modelo ?? ''}`.trim()
                    : 's/v';

                // Ordenar cuotas por fecha y obtener la próxima
                const cuotasOrdenadas = [...fin.cuotasPorVencer].sort(
                  (a, b) =>
                    new Date(a.fechaVencimiento).getTime() -
                    new Date(b.fechaVencimiento).getTime()
                );
                const proximaCuota = cuotasOrdenadas[0];
                const monedaFin = normalizarMoneda(fin.moneda);

                return (
                  <TableRow
                    key={fin._id}
                    sx={{
                      backgroundColor: index % 2 === 0 ? blanco : grisClaro,
                      '&:hover': {
                        backgroundColor: grisMedio,
                      },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {clienteNombre}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{vehiculoInfo}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={fin.totalCuotasPorVencer}
                        color="warning"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {formatMoney(fin.montoTotalPorVencer, monedaFin)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {proximaCuota && (
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            Cuota #{proximaCuota.numeroCuota}
                          </Typography>
                          <Typography variant="caption" color={grisTexto}>
                            {formatDate(proximaCuota.fechaVencimiento)} -{' '}
                            {formatMoney(proximaCuota.valorCuota, monedaFin)}
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Ver Detalles">
                        <IconButton
                          onClick={() => handleVerDetalles(fin._id || '')}
                          size="small"
                          sx={{
                            color: azulBase,
                            '&:hover': {
                              backgroundColor: azulBase + '20',
                            },
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Controles de paginación */}
      {pagination.pages > 1 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mt: 3,
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Pagination
            count={pagination.pages}
            page={pagination.page}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
            sx={{
              '& .MuiPaginationItem-root': {
                fontSize: '0.95rem',
                fontWeight: 500,
              },
            }}
          />
          <Typography variant="body2" color={grisTexto}>
            Mostrando {(pagination.page - 1) * pagination.limit + 1} -{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
            {pagination.total}
          </Typography>
        </Box>
      )}

      {vencimientos.length === 0 && !loading && empresaId && (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color={grisTexto}>
            No se encontraron cuotas por vencer en el rango de fechas
            seleccionado
          </Typography>
        </Paper>
      )}
    </>
  );
}
