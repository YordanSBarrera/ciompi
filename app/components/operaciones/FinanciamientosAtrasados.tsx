'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  CircularProgress,
  Alert,
  Button,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  Print as PrintIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { FinanciamientoType } from '@/lib/types';
import ListaFinanciamientos from '../ListaFinanciamientos';
import { useEmpresas } from '@/app/hook/useEmpresas';

// Función para obtener financiamientos con cuotas atrasadas
async function obtenerFinanciamientosAtrasados(
  empresaId: string
): Promise<
  (FinanciamientoType & { cuotasAtrasadas?: number; montoAtrasado?: number })[]
> {
  try {
    const params = new URLSearchParams();
    if (empresaId) {
      params.set('empresa', empresaId);
    }
    const response = await fetch(
      `/api/financiamiento/atrasados?${params.toString()}`
    );
    if (!response.ok) {
      throw new Error('Error al obtener financiamientos atrasados');
    }
    return await response.json();
  } catch (error) {
    console.error('Error obteniendo financiamientos atrasados:', error);
    return [];
  }
}

export default function FinanciamientosAtrasados() {
  const { empresas, loading: loadingEmpresas } = useEmpresas();
  const [empresaId, setEmpresaId] = useState<string>('');
  const [financiamientosAtrasados, setFinanciamientosAtrasados] = useState<
    (FinanciamientoType & {
      cuotasAtrasadas?: number;
      montoAtrasado?: number;
    })[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<string>('creacion_desc');
  const pageSize = 20;

  const obtenerNombreCliente = (
    fin: FinanciamientoType & {
      cuotasAtrasadas?: number;
      montoAtrasado?: number;
    }
  ): string => {
    const nombre =
      typeof fin.cliente === 'object' && fin.cliente
        ? fin.cliente.NOMBRE
        : '';
    return (nombre || '').trim().toLowerCase();
  };

  const ordenarFinanciamientos = (
    lista: (FinanciamientoType & {
      cuotasAtrasadas?: number;
      montoAtrasado?: number;
    })[],
    orden: string
  ): (FinanciamientoType & {
    cuotasAtrasadas?: number;
    montoAtrasado?: number;
  })[] => {
    const copia = [...lista];
    switch (orden) {
      case 'cliente_asc':
        return copia.sort(
          (a, b) =>
            obtenerNombreCliente(a).localeCompare(obtenerNombreCliente(b)) ||
            new Date(b.createdAt || 0).getTime() -
              new Date(a.createdAt || 0).getTime()
        );
      case 'cliente_desc':
        return copia.sort(
          (a, b) =>
            obtenerNombreCliente(b).localeCompare(obtenerNombreCliente(a)) ||
            new Date(b.createdAt || 0).getTime() -
              new Date(a.createdAt || 0).getTime()
        );
      case 'creacion_asc':
        return copia.sort(
          (a, b) =>
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime()
        );
      case 'creacion_desc':
      default:
        return copia.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        );
    }
  };

  const financiamientosOrdenados = ordenarFinanciamientos(
    financiamientosAtrasados,
    sortOrder
  );

  const pagination = {
    page,
    limit: pageSize,
    total: financiamientosOrdenados.length,
    pages: Math.ceil(financiamientosOrdenados.length / pageSize),
  };

  const financiamientosPaginados = financiamientosOrdenados.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSortChange = (orden: string) => {
    setSortOrder(orden);
    setPage(1);
  };

  const handleCargarAtrasados = async () => {
    try {
      setLoading(true);
      setError(null);
      const resultados = await obtenerFinanciamientosAtrasados(empresaId);
      setFinanciamientosAtrasados(resultados);
      setPage(1);
    } catch (err) {
      setError('Error al cargar financiamientos atrasados');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImprimirListadoAtrasados = () => {
    const params = new URLSearchParams();
    if (empresaId) {
      params.set('empresa', empresaId);
    }
    window.open(
      `/api/reports/financiamientos-atrasados?${params.toString()}`,
      '_blank'
    );
  };

  const handleImprimirFinanciamientoAtrasado = (id: string) => {
    window.open(`/api/reports/financiaciones/${id}?format=pdf`, '_blank');
  };

  useEffect(() => {
    if (empresaId) {
      handleCargarAtrasados();
    }
  }, [empresaId]);

  return (
    <>
      {/* Sección de Financiamientos Atrasados */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            mb: 2,
          }}
        >
          <Typography variant="h6" component="h2">
            Financiamientos con Cuotas Atrasadas
          </Typography>
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
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              onClick={handleCargarAtrasados}
              disabled={loading}
              startIcon={
                loading ? <CircularProgress size={20} /> : <SearchIcon />
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

      {!loading && financiamientosAtrasados.length === 0 && !error && (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            {empresaId
              ? 'No hay financiamientos con cuotas atrasadas'
              : 'Seleccione una empresa para ver los financiamientos con cuotas atrasadas'}
          </Typography>
        </Paper>
      )}

      {!loading && financiamientosAtrasados.length > 0 && (
        <Box>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Se encontraron {financiamientosAtrasados.length}{' '}
            financiamiento(s) con cuotas atrasadas
          </Alert>
          <ListaFinanciamientos
            financiamientos={financiamientosPaginados}
            pagination={pagination}
            onPageChange={handlePageChange}
            onFinanciamientoEliminado={handleCargarAtrasados}
            mostrarAtrasos={true}
            onImprimir={handleImprimirFinanciamientoAtrasado}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
          />
        </Box>
      )}
    </>
  );
}

