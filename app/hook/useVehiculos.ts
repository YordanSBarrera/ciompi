import { useState, useEffect } from 'react';
import { VehiculoType, VehiculoFormType } from '@/lib/types';

export function useVehiculos() {
  const [vehiculos, setVehiculos] = useState<VehiculoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehiculos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/vehiculos');
      if (response.ok) {
        const data = await response.json();
        setVehiculos(data);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al cargar vehículos');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const createVehiculo = async (vehiculoData: VehiculoFormType) => {
    try {
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
        return {
          success: false,
          error: errorData.error || 'Error al crear vehículo',
        };
      }
    } catch (err) {
      return { success: false, error: 'Error de conexión' };
    }
  };

  const updateVehiculo = async (id: string, vehiculoData: VehiculoFormType) => {
    try {
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
        return {
          success: false,
          error: errorData.message || 'Error al actualizar vehículo',
        };
      }
    } catch (err) {
      return { success: false, error: 'Error de conexión' };
    }
  };

  const deleteVehiculo = async (id: string) => {
    try {
      const response = await fetch(`/api/vehiculos/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setVehiculos(prev => prev.filter(v => v._id !== id));
        return { success: true };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.message || 'Error al eliminar vehículo',
        };
      }
    } catch (err) {
      return { success: false, error: 'Error de conexión' };
    }
  };

  useEffect(() => {
    fetchVehiculos();
  }, []);

  return {
    vehiculos,
    loading,
    error,
    fetchVehiculos,
    createVehiculo,
    updateVehiculo,
    deleteVehiculo,
  };
}
