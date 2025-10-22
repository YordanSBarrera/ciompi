'use client';
import { useState } from 'react';

interface UseEliminarClienteProps {
  onClienteEliminado?: () => void;
}

interface ConfirmDialogState {
  open: boolean;
  clienteId: string | null;
  clienteNombre: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

export const useEliminarCliente = ({
  onClienteEliminado,
}: UseEliminarClienteProps = {}) => {
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false,
    clienteId: null,
    clienteNombre: '',
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleClickEliminar = (id: string, nombre: string) => {
    console.log('Eliminando cliente:', { id, nombre }); // Debug log
    setConfirmDialog({
      open: true,
      clienteId: id,
      clienteNombre: nombre,
    });
  };

  const handleConfirmEliminar = async () => {
    if (!confirmDialog.clienteId) {
      console.error('No hay ID de cliente para eliminar');
      return;
    }

    console.log('Confirmando eliminación de cliente:', {
      id: confirmDialog.clienteId,
      nombre: confirmDialog.clienteNombre,
    });

    setLoading(true);
    try {
      const url = `/api/clientes?id=${confirmDialog.clienteId}`;
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

      if (response.ok && data.success) {
        setSnackbar({
          open: true,
          message: `Cliente "${confirmDialog.clienteNombre}" eliminado exitosamente`,
          severity: 'success',
        });
        onClienteEliminado?.();
      } else {
        console.error('Error en respuesta del servidor:', data);
        setSnackbar({
          open: true,
          message: data.error || 'Error al eliminar el cliente',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error eliminando cliente:', error);
      setSnackbar({
        open: true,
        message: 'Error de conexión al eliminar el cliente',
        severity: 'error',
      });
    } finally {
      setLoading(false);
      setConfirmDialog({
        open: false,
        clienteId: null,
        clienteNombre: '',
      });
    }
  };

  const handleCancelEliminar = () => {
    setConfirmDialog({
      open: false,
      clienteId: null,
      clienteNombre: '',
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
