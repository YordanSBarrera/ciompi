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
} from '@mui/material';
import {
  Search as SearchIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { FinanciamientoType } from '@/lib/types';
import ListaFinanciamientos from '../ListaFinanciamientos';

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

export default function FinanciamientosAtrasados() {
  const [financiamientosAtrasados, setFinanciamientosAtrasados] = useState<
    (FinanciamientoType & {
      cuotasAtrasadas?: number;
      montoAtrasado?: number;
    })[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCargarAtrasados = async () => {
    try {
      setLoading(true);
      setError(null);
      const resultados = await obtenerFinanciamientosAtrasados();
      setFinanciamientosAtrasados(resultados);
    } catch (err) {
      setError('Error al cargar financiamientos atrasados');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImprimirListadoAtrasados = () => {
    window.open(`/api/reports/financiamientos-atrasados?format=pdf`, '_blank');
  };

  const handleImprimirFinanciamientoAtrasado = (id: string) => {
    window.open(`/api/reports/financiaciones/${id}?format=pdf`, '_blank');
  };

  useEffect(() => {
    handleCargarAtrasados();
  }, []);

  return (
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
            No hay financiamientos con cuotas atrasadas
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
            financiamientos={financiamientosAtrasados}
            onFinanciamientoEliminado={handleCargarAtrasados}
            mostrarAtrasos={true}
            onImprimir={handleImprimirFinanciamientoAtrasado}
          />
        </Box>
      )}
    </>
  );
}

