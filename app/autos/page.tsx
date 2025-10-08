'use client';
import React, { useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { VehiculoType, VehiculoFormType } from '@/lib/types';
import { useVehiculos } from '@/app/hook/useVehiculos';
import ListaVehiculos from '@/app/components/ListaVehiculos';
import FormularioVehiculo from '@/app/components/FormularioVehiculo';
import { azulBase, blanco } from '@/lib/color';

export default function AutosPage() {
  const { createVehiculo, updateVehiculo } = useVehiculos();
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
    // Aquí podrías implementar una vista de detalles
    console.log('Ver vehículo:', vehiculo);
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
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 3,
          background: `linear-gradient(135deg, ${azulBase} 0%, #1976d2 100%)`,
          color: blanco,
          borderRadius: 2,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Gestión de Vehículos
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Administra el inventario de vehículos de la empresa
        </Typography>
      </Paper>

      {/* Lista de vehículos */}
      <ListaVehiculos
        onAddVehiculo={handleAgregarVehiculo}
        onEditVehiculo={handleEditarVehiculo}
        onViewVehiculo={handleVerVehiculo}
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
