'use client';
import { useState } from 'react';
import { getAuthHeaders } from '@/lib/utils';

interface ConfirmDialog {
  open: boolean;
  empresaId: string | null;
  empresaNombre: string;
}

interface Snackbar {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

interface UseEliminarEmpresaProps {
  onEmpresaEliminada?: () => void;
}

export function useEliminarEmpresa({
  onEmpresaEliminada,
}: UseEliminarEmpresaProps = {}) {
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({
    open: false,
    empresaId: null,
    empresaNombre: '',
  });

  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState<Snackbar>({
    open: false,
    message: '',
    severity: 'info',
  });

  const handleClickEliminar = (id: string, nombre: string) => {
    setConfirmDialog({
      open: true,
      empresaId: id,
      empresaNombre: nombre,
    });
  };

  const handleConfirmEliminar = async () => {
    if (!confirmDialog.empresaId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/empresas/${confirmDialog.empresaId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const result = await response.json();

      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Empresa eliminada exitosamente',
          severity: 'success',
        });

        // Llamar callback si existe
        if (onEmpresaEliminada) {
          onEmpresaEliminada();
        }
      } else {
        setSnackbar({
          open: true,
          message: result.error || 'Error al eliminar empresa',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error de conexión',
        severity: 'error',
      });
    } finally {
      setLoading(false);
      setConfirmDialog({
        open: false,
        empresaId: null,
        empresaNombre: '',
      });
    }
  };

  const handleCancelEliminar = () => {
    setConfirmDialog({
      open: false,
      empresaId: null,
      empresaNombre: '',
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return {
    confirmDialog,
    loading,
    snackbar,
    handleClickEliminar,
    handleConfirmEliminar,
    handleCancelEliminar,
    handleCloseSnackbar,
  };
}
