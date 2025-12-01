'use client';
import { useRouter } from 'next/navigation';
import { FinanciamientoType } from '@/lib/types';
import AuthGuard from '@/app/components/AuthGuard';
import ListaFinanciamientos from '@/app/components/ListaFinanciamientos';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useEffect, useState } from 'react';

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface FinanciamientosResponse {
  success: boolean;
  data: FinanciamientoType[];
  pagination: PaginationData;
}

export default function FinanciamientoPage() {
  const router = useRouter();
  const [financiamientos, setFinanciamientos] = useState<FinanciamientoType[]>(
    []
  );
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const cargarListaFinanciamientos = async (
    page: number = 1,
    searchTerm: string = ''
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      const response = await fetch(`/api/financiamiento?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Error al cargar financiamientos');
      }
      
      const result: FinanciamientosResponse = await response.json();
      
      if (result.success) {
        setFinanciamientos(result.data);
        setPagination(result.pagination);
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (err) {
      setError('Error al cargar la lista de financiamientos');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarListaFinanciamientos(1, search);
  }, []);

  const handleFinanciamientoEliminado = () => {
    // Recargar la lista después de eliminar un financiamiento
    cargarListaFinanciamientos(pagination.page, search);
  };

  const handleAgregarFinanciamiento = () => {
    // Redirigir a la página de crear nuevo financiamiento
    router.push('/ciompi/financiamiento/nuevo');
  };

  const handlePageChange = (newPage: number) => {
    cargarListaFinanciamientos(newPage, search);
  };

  const handleSearchChange = (searchTerm: string) => {
    setSearch(searchTerm);
    cargarListaFinanciamientos(1, searchTerm);
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
        pagination={pagination}
        loading={loading}
        onFinanciamientoEliminado={handleFinanciamientoEliminado}
        onAgregarFinanciamiento={handleAgregarFinanciamiento}
        onPageChange={handlePageChange}
        onSearchChange={handleSearchChange}
        initialSearch={search}
      />
    </AuthGuard>
  );
}
