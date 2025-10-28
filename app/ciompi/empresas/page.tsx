'use client';
import React, { useState } from 'react';
import { Box } from '@mui/material';
import { EmpresaType, EmpresaFormType } from '@/lib/types';
import { useEmpresas } from '@/app/hook/useEmpresas';
import ListaEmpresas from '@/app/components/ListaEmpresas';
import FormularioEmpresa from '@/app/components/FormularioEmpresa';

export default function EmpresasPage() {
  const { empresas, loading, createEmpresa, updateEmpresa } = useEmpresas();
  const [formularioOpen, setFormularioOpen] = useState(false);
  const [empresaSeleccionada, setEmpresaSeleccionada] =
    useState<EmpresaType | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  const handleAgregarEmpresa = () => {
    setEmpresaSeleccionada(null);
    setModoEdicion(false);
    setFormularioOpen(true);
  };

  const handleEditarEmpresa = (empresa: EmpresaType) => {
    setEmpresaSeleccionada(empresa);
    setModoEdicion(true);
    setFormularioOpen(true);
  };

  const handleVerEmpresa = (empresa: EmpresaType) => {
    // Navegar a la página de detalles de la empresa
    window.location.href = `/ciompi/empresas/${empresa._id}`;
  };

  const handleGuardarEmpresa = async (empresaData: EmpresaFormType) => {
    if (modoEdicion && empresaSeleccionada) {
      return await updateEmpresa(empresaSeleccionada._id!, empresaData);
    } else {
      return await createEmpresa(empresaData);
    }
  };

  const handleCerrarFormulario = () => {
    setFormularioOpen(false);
    setEmpresaSeleccionada(null);
    setModoEdicion(false);
  };

  return (
    <Box sx={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <ListaEmpresas
        empresas={empresas}
        onAgregarEmpresa={handleAgregarEmpresa}
      />

      <FormularioEmpresa
        open={formularioOpen}
        onClose={handleCerrarFormulario}
        onSave={handleGuardarEmpresa}
        empresa={empresaSeleccionada}
        title={modoEdicion ? 'Editar Empresa' : 'Nueva Empresa'}
      />
    </Box>
  );
}
