import { useState, useEffect, useCallback } from 'react';
import { VehiculoType, VehiculoFormType } from '@/lib/types';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function useVehiculos() {
  const [vehiculos, setVehiculos] = useState<VehiculoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVehiculos = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);

      const response = await fetch('/api/vehiculos', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setVehiculos(data);
        setError(null);
        return { success: true, data };
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

  const createVehiculo = useCallback(async (vehiculoData: VehiculoFormType) => {
    try {
      setError(null);
      const response = await fetch('/api/vehiculos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehiculoData),
      });

      if (response.ok) {
        const newVehiculo = await response.json();
        setVehiculos(prev => [newVehiculo, ...prev]);
        return { success: true, vehiculo: newVehiculo };
      } else {
        const errorData = await response.json();
        const errorMessage =
          errorData.error || `Error ${response.status}: ${response.statusText}`;
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error de conexión';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const updateVehiculo = useCallback(
    async (id: string, vehiculoData: VehiculoFormType) => {
      try {
        setError(null);
        const response = await fetch(`/api/vehiculos/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(vehiculoData),
        });

        if (response.ok) {
          const updatedVehiculo = await response.json();
          setVehiculos(prev =>
            prev.map(v => (v._id === id ? updatedVehiculo : v))
          );
          return { success: true, vehiculo: updatedVehiculo };
        } else {
          const errorData = await response.json();
          const errorMessage =
            errorData.message ||
            errorData.error ||
            `Error ${response.status}: ${response.statusText}`;
          setError(errorMessage);
          return {
            success: false,
            error: errorMessage,
          };
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error de conexión';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    []
  );

  const deleteVehiculo = useCallback(async (id: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/vehiculos/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setVehiculos(prev => prev.filter(v => v._id !== id));
        return { success: true };
      } else {
        const errorData = await response.json();
        const errorMessage =
          errorData.message ||
          errorData.error ||
          `Error ${response.status}: ${response.statusText}`;
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error de conexión';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  useEffect(() => {
    fetchVehiculos();
  }, [fetchVehiculos]);

  const refreshVehiculos = useCallback(() => {
    return fetchVehiculos(false);
  }, [fetchVehiculos]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    vehiculos,
    loading,
    refreshing,
    error,
    fetchVehiculos,
    refreshVehiculos,
    createVehiculo,
    updateVehiculo,
    deleteVehiculo,
    clearError,
  };
}
