'use client';
import React, { useState } from 'react';
import { Box } from '@mui/material';
import { VehiculoType, VehiculoFormType } from '@/lib/types';
import { useVehiculos } from '@/app/hook/useVehiculos';
import ListaVehiculos from '@/app/components/ListaVehiculos';
import FormularioVehiculo from '@/app/components/FormularioVehiculo';

export default function VehiculosPage() {
  const {
    vehiculos,
    loading,
    error,
    createVehiculo,
    updateVehiculo,
    deleteVehiculo,
    refreshing,
  } = useVehiculos();
  const [formularioOpen, setFormularioOpen] = useState(false);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] =
    useState<VehiculoType | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  const handleAgregarVehiculo = () => {
    setVehiculoSeleccionado(null);
    setModoEdicion(false);
    setFormularioOpen(true);
  };

  const handleEditarVehiculo = (vehiculo: VehiculoType) => {
    setVehiculoSeleccionado(vehiculo);
    setModoEdicion(true);
    setFormularioOpen(true);
  };

  const handleVerVehiculo = (vehiculo: VehiculoType) => {
    // Navegar a la página de detalles del vehículo
    window.location.href = `/ciompi/vehiculos/${vehiculo._id}`;
  };

  const handleGuardarVehiculo = async (vehiculoData: VehiculoFormType) => {
    if (modoEdicion && vehiculoSeleccionado) {
      return await updateVehiculo(vehiculoSeleccionado._id!, vehiculoData);
    } else {
      return await createVehiculo(vehiculoData);
    }
  };

  const handleCerrarFormulario = () => {
    setFormularioOpen(false);
    setVehiculoSeleccionado(null);
    setModoEdicion(false);
  };

  return (
    <Box>
      {/* Lista de vehículos con header moderno integrado */}
      <ListaVehiculos
        vehiculos={vehiculos}
        loading={loading}
        error={error}
        refreshing={refreshing}
        onAddVehiculo={handleAgregarVehiculo}
        onEditVehiculo={handleEditarVehiculo}
        onViewVehiculo={handleVerVehiculo}
        onDeleteVehiculo={deleteVehiculo}
      />

      {/* Formulario de vehículo */}
      <FormularioVehiculo
        open={formularioOpen}
        onClose={handleCerrarFormulario}
        onSave={handleGuardarVehiculo}
        vehiculo={vehiculoSeleccionado}
        title={modoEdicion ? 'Editar Vehículo' : 'Agregar Vehículo'}
      />
    </Box>
  );
}
