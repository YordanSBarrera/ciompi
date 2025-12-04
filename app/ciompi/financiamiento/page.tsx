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
  const [todosLosFinanciamientos, setTodosLosFinanciamientos] = useState<
    FinanciamientoType[]
  >([]);
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

  // Cargar todos los financiamientos una sola vez
  const cargarTodosLosFinanciamientos = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar TODOS los financiamientos sin paginación ni búsqueda del servidor
      const params = new URLSearchParams({
        page: '1',
        limit: '10000', // Límite muy alto para obtener todos
      });

      const response = await fetch(`/api/financiamiento?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Error al cargar financiamientos');
      }

      const result: FinanciamientosResponse = await response.json();

      if (result.success) {
        setTodosLosFinanciamientos(result.data);
        // Aplicar filtrado y paginación local
        aplicarFiltroYPaginacion(result.data, '', 1);
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

  // Filtrar y paginar localmente
  const aplicarFiltroYPaginacion = (
    todosFinanciamientos: FinanciamientoType[],
    searchTerm: string,
    page: number
  ) => {
    const searchLower = searchTerm.toLowerCase().trim();

    // Filtrar financiamientos
    const financiamientosFiltrados = searchLower
      ? todosFinanciamientos.filter(financiamiento => {
          const searchInField = (field: any): boolean => {
            if (!field) return false;
            return field.toString().toLowerCase().includes(searchLower);
          };

          // Buscar en campos del cliente
          const clienteNombre =
            typeof financiamiento.cliente === 'object'
              ? financiamiento.cliente?.NOMBRE
              : '';
          const clienteCedula =
            typeof financiamiento.cliente === 'object'
              ? financiamiento.cliente?.cedula
              : '';
          const clienteTelefono =
            typeof financiamiento.cliente === 'object'
              ? financiamiento.cliente?.TELEFONO
              : '';
          const clienteCorreo =
            typeof financiamiento.cliente === 'object'
              ? financiamiento.cliente?.correo
              : '';

          // Buscar en campos del cliente2
          const cliente2Nombre =
            typeof financiamiento.cliente2 === 'object'
              ? financiamiento.cliente2?.NOMBRE
              : '';
          const cliente2Cedula =
            typeof financiamiento.cliente2 === 'object'
              ? financiamiento.cliente2?.cedula
              : '';

          // Buscar en campos del vehículo
          const vehiculoMarca =
            typeof financiamiento.vehiculo === 'object'
              ? financiamiento.vehiculo?.Marca
              : '';
          const vehiculoModelo =
            typeof financiamiento.vehiculo === 'object'
              ? financiamiento.vehiculo?.Modelo
              : '';
          const vehiculoMatricula =
            typeof financiamiento.vehiculo === 'object'
              ? financiamiento.vehiculo?.Matricula
              : '';

          // Buscar en campos de la empresa
          const empresaNombre =
            typeof financiamiento.empresa === 'object'
              ? financiamiento.empresa?.nombre
              : '';

          return (
            searchInField(clienteNombre) ||
            searchInField(clienteCedula) ||
            searchInField(clienteTelefono) ||
            searchInField(clienteCorreo) ||
            searchInField(cliente2Nombre) ||
            searchInField(cliente2Cedula) ||
            searchInField(vehiculoMarca) ||
            searchInField(vehiculoModelo) ||
            searchInField(vehiculoMatricula) ||
            searchInField(empresaNombre) ||
            searchInField(financiamiento.estadoFinanciamiento) ||
            searchInField(financiamiento.observaciones)
          );
        })
      : todosFinanciamientos;

    // Calcular paginación local
    const total = financiamientosFiltrados.length;
    const pages = Math.ceil(total / pagination.limit);
    const skip = (page - 1) * pagination.limit;
    const financiamientosPaginados = financiamientosFiltrados.slice(
      skip,
      skip + pagination.limit
    );

    setFinanciamientos(financiamientosPaginados);
    setPagination({
      page,
      limit: pagination.limit,
      total,
      pages,
    });
  };

  useEffect(() => {
    cargarTodosLosFinanciamientos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFinanciamientoEliminado = () => {
    // Recargar la lista completa después de eliminar un financiamiento
    cargarTodosLosFinanciamientos();
  };

  const handleAgregarFinanciamiento = () => {
    // Redirigir a la página de crear nuevo financiamiento
    router.push('/ciompi/financiamiento/nuevo');
  };

  const handlePageChange = (newPage: number) => {
    aplicarFiltroYPaginacion(todosLosFinanciamientos, search, newPage);
  };

  const handleSearchChange = (searchTerm: string) => {
    setSearch(searchTerm);
    aplicarFiltroYPaginacion(todosLosFinanciamientos, searchTerm, 1);
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
      )}
    </AuthGuard>
  );
}
