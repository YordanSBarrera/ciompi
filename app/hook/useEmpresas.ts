'use client';
import { useState, useEffect, useCallback } from 'react';
import { EmpresaType, EmpresaFormType } from '@/lib/types';
import { getAuthHeaders } from '@/lib/utils';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function useEmpresas() {
  const [empresas, setEmpresas] = useState<EmpresaType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEmpresas = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);

      const response = await fetch('/api/empresas', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setEmpresas(result.data);
        } else {
          setEmpresas([]);
        }
        setError(null);
        return { success: true, data: result.data };
      } else {
        const errorData = await response.json();
        const errorMessage =
          errorData.error || `Error ${response.status}: ${response.statusText}`;
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error de conexión';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const createEmpresa = async (
    empresaData: EmpresaFormType
  ): Promise<ApiResponse<EmpresaType>> => {
    try {
      setError(null);
      const response = await fetch('/api/empresas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(empresaData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al crear empresa');
      }

      // Actualizar la lista automáticamente
      if (result.success && result.data) {
        setEmpresas(prev => [result.data, ...prev]);
      }

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateEmpresa = async (
    id: string,
    empresaData: EmpresaFormType
  ): Promise<ApiResponse<EmpresaType>> => {
    try {
      setError(null);
      const response = await fetch(`/api/empresas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(empresaData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al actualizar empresa');
      }

      // Actualizar la lista automáticamente
      if (result.success && result.data) {
        setEmpresas(prev =>
          prev.map(empresa => (empresa._id === id ? result.data : empresa))
        );
      }

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const deleteEmpresa = async (id: string): Promise<ApiResponse<void>> => {
    try {
      setError(null);
      const response = await fetch(`/api/empresas/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al eliminar empresa');
      }

      // Actualizar la lista automáticamente
      setEmpresas(prev => prev.filter(empresa => empresa._id !== id));

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const getEmpresa = async (id: string): Promise<ApiResponse<EmpresaType>> => {
    try {
      setError(null);
      const response = await fetch(`/api/empresas/${id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al obtener empresa');
      }

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, [fetchEmpresas]);

  const refreshEmpresas = useCallback(() => {
    return fetchEmpresas(false);
  }, [fetchEmpresas]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    empresas,
    loading,
    refreshing,
    error,
    fetchEmpresas,
    refreshEmpresas,
    createEmpresa,
    updateEmpresa,
    deleteEmpresa,
    getEmpresa,
    clearError,
  };
}
