'use client';

import { useState } from 'react';
import {
  Box,
  CircularProgress,
  Alert,
  TextField,
  Button,
  Typography,
  Paper,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { FinanciamientoType } from '@/lib/types';
import ListaFinanciamientos from '../ListaFinanciamientos';

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

export default function BuscarClientes() {
  const [financiamientos, setFinanciamientos] = useState<FinanciamientoType[]>(
    []
  );
  const [loading, setLoading] = useState(false);
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

  return (
    <>
      {/* Búsqueda */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Buscar Financiamientos por Cliente
        </Typography>
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
          severity={hasSearched && financiamientos.length === 0 ? 'info' : 'error'}
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      {!loading && hasSearched && financiamientos.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            {financiamientos.length} financiamiento(s) encontrado(s) para "
            {nombreCliente}"
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
            Ingrese el nombre de un cliente para buscar sus financiamientos
          </Typography>
        </Paper>
      )}
    </>
  );
}

