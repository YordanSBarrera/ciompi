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
  const [todosLosClientes, setTodosLosClientes] = useState<ClienteType[]>([]);
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

  // Cargar todos los clientes una sola vez
  const cargarTodosLosClientes = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar TODOS los clientes sin paginación ni búsqueda del servidor
      const params = new URLSearchParams({
        page: '1',
        limit: '10000', // Límite muy alto para obtener todos
      });

      const response = await fetch(`/api/clientes?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Error al cargar clientes');
      }

      const result: ClientesResponse = await response.json();

      if (result.success) {
        setTodosLosClientes(result.data);
        // Aplicar filtrado y paginación local
        aplicarFiltroYPaginacion(result.data, '', 1);
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

  // Filtrar y paginar localmente
  const aplicarFiltroYPaginacion = (
    todosClientes: ClienteType[],
    searchTerm: string,
    page: number
  ) => {
    const searchLower = searchTerm.toLowerCase().trim();

    // Filtrar clientes
    const clientesFiltrados = searchLower
      ? todosClientes.filter(cliente => {
          const searchInField = (field: string | undefined | null): boolean => {
            if (!field) return false;
            return field.toString().toLowerCase().includes(searchLower);
          };

          return (
            searchInField(cliente.NOMBRE) ||
            searchInField(cliente.DIRECCION) ||
            searchInField(cliente.TELEFONO) ||
            searchInField(cliente.correo) ||
            searchInField(cliente.profesion) ||
            searchInField(cliente.cedula)
          );
        })
      : todosClientes;

    // Calcular paginación local
    const total = clientesFiltrados.length;
    const pages = Math.ceil(total / pagination.limit);
    const skip = (page - 1) * pagination.limit;
    const clientesPaginados = clientesFiltrados.slice(
      skip,
      skip + pagination.limit
    );

    setClientes(clientesPaginados);
    setPagination({
      page,
      limit: pagination.limit,
      total,
      pages,
    });
  };

  useEffect(() => {
    cargarTodosLosClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClienteEliminado = () => {
    // Recargar la lista completa después de eliminar un cliente
    cargarTodosLosClientes();
  };

  const handleAgregarCliente = () => {
    // Redirigir a la página de crear nuevo cliente
    router.push('/ciompi/clientes/nuevo');
  };

  const handlePageChange = (newPage: number) => {
    aplicarFiltroYPaginacion(todosLosClientes, search, newPage);
  };

  const handleSearchChange = (searchTerm: string) => {
    setSearch(searchTerm);
    aplicarFiltroYPaginacion(todosLosClientes, searchTerm, 1);
  };

  return (
    <AuthGuard>
      {error ? (
        <Box sx={{ p: 2 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        </Box>
      ) : (
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
      )}
    </AuthGuard>
  );
}
