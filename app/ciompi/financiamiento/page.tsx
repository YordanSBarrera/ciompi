'use client';
import { useRouter } from 'next/navigation';
import { FinanciamientoType } from '@/lib/types';
import AuthGuard from '@/app/components/AuthGuard';
import ListaFinanciamientos from '@/app/components/ListaFinanciamientos';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useEffect, useState } from 'react';

// Función para cargar financiamientos
async function cargarFinanciamientos(): Promise<FinanciamientoType[]> {
  try {
    const response = await fetch('/api/financiamiento');
    if (!response.ok) {
      throw new Error('Error al cargar financiamientos');
    }
    return await response.json();
  } catch (error) {
    console.error('Error cargando financiamientos:', error);
    return [];
  }
}

export default function FinanciamientoPage() {
  const router = useRouter();
  const [financiamientos, setFinanciamientos] = useState<FinanciamientoType[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarListaFinanciamientos = async () => {
    try {
      setLoading(true);
      setError(null);
      const listaFinanciamientos = await cargarFinanciamientos();
      setFinanciamientos(listaFinanciamientos);
    } catch (err) {
      setError('Error al cargar la lista de financiamientos');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarListaFinanciamientos();
  }, []);

  const handleFinanciamientoEliminado = () => {
    // Recargar la lista después de eliminar un financiamiento
    cargarListaFinanciamientos();
  };

  const handleAgregarFinanciamiento = () => {
    // Redirigir a la página de crear nuevo financiamiento
    router.push('/ciompi/financiamiento/nuevo');
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <AuthGuard>
      <ListaFinanciamientos
        financiamientos={financiamientos}
        onFinanciamientoEliminado={handleFinanciamientoEliminado}
        onAgregarFinanciamiento={handleAgregarFinanciamiento}
      />
    </AuthGuard>
  );
}
