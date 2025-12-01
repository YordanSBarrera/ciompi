'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ClienteType } from '@/lib/types';
import ListaClientes from '@/app/components/ListaClientes';
import AuthGuard from '@/app/components/AuthGuard';
import { Box, CircularProgress, Alert } from '@mui/material';

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface ClientesResponse {
  success: boolean;
  data: ClienteType[];
  pagination: PaginationData;
}

export default function ClientesPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<ClienteType[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const cargarListaClientes = async (
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

      const response = await fetch(`/api/clientes?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Error al cargar clientes');
      }

      const result: ClientesResponse = await response.json();

      if (result.success) {
        setClientes(result.data);
        setPagination(result.pagination);
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (err) {
      setError('Error al cargar la lista de clientes');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarListaClientes(1, search);
  }, []);

  const handleClienteEliminado = () => {
    // Recargar la lista después de eliminar un cliente
    cargarListaClientes(pagination.page, search);
  };

  const handleAgregarCliente = () => {
    // Redirigir a la página de crear nuevo cliente
    router.push('/ciompi/clientes/nuevo');
  };

  const handlePageChange = (newPage: number) => {
    cargarListaClientes(newPage, search);
  };

  const handleSearchChange = (searchTerm: string) => {
    setSearch(searchTerm);
    cargarListaClientes(1, searchTerm);
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
      <ListaClientes
        clientes={clientes}
        pagination={pagination}
        loading={loading}
        onClienteEliminado={handleClienteEliminado}
        onAgregarCliente={handleAgregarCliente}
        onPageChange={handlePageChange}
        onSearchChange={handleSearchChange}
        initialSearch={search}
      />
    </AuthGuard>
  );
}
