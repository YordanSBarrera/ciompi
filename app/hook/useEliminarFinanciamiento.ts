'use client';
import { useState } from 'react';

interface UseEliminarFinanciamientoProps {
  onFinanciamientoEliminado?: () => void;
}

interface ConfirmDialogState {
  open: boolean;
  financiamientoId: string | null;
  financiamientoNombre: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

export const useEliminarFinanciamiento = ({
  onFinanciamientoEliminado,
}: UseEliminarFinanciamientoProps = {}) => {
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false,
    financiamientoId: null,
    financiamientoNombre: '',
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleClickEliminar = (id: string, nombre: string) => {
    console.log('Eliminando financiamiento:', { id, nombre });
    setConfirmDialog({
      open: true,
      financiamientoId: id,
      financiamientoNombre: nombre,
    });
  };

  const handleConfirmEliminar = async () => {
    if (!confirmDialog.financiamientoId) {
      console.error('No hay ID de financiamiento para eliminar');
      return;
    }

    console.log('Confirmando eliminación de financiamiento:', {
      id: confirmDialog.financiamientoId,
      nombre: confirmDialog.financiamientoNombre,
    });

    setLoading(true);
    try {
      const url = `/api/financiamiento?id=${confirmDialog.financiamientoId}`;
      console.log('URL de eliminación:', url);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(
        'Respuesta del servidor:',
        response.status,
        response.statusText
      );

      const data = await response.json();
      console.log('Datos de respuesta:', data);

      if (response.ok && data.message) {
        setSnackbar({
          open: true,
          message: `Financiamiento "${confirmDialog.financiamientoNombre}" eliminado exitosamente`,
          severity: 'success',
        });
        onFinanciamientoEliminado?.();
      } else {
        console.error('Error en respuesta del servidor:', data);
        setSnackbar({
          open: true,
          message: data.error || 'Error al eliminar el financiamiento',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error eliminando financiamiento:', error);
      setSnackbar({
        open: true,
        message: 'Error de conexión al eliminar el financiamiento',
        severity: 'error',
      });
    } finally {
      setLoading(false);
      setConfirmDialog({
        open: false,
        financiamientoId: null,
        financiamientoNombre: '',
      });
    }
  };

  const handleCancelEliminar = () => {
    setConfirmDialog({
      open: false,
      financiamientoId: null,
      financiamientoNombre: '',
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return {
    // Estados
    confirmDialog,
    loading,
    snackbar,

    // Funciones
    handleClickEliminar,
    handleConfirmEliminar,
    handleCancelEliminar,
    handleCloseSnackbar,
  };
};

