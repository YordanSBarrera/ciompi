'use client';
import { useState } from 'react';

interface UseEliminarUsuarioProps {
  onUsuarioEliminado?: () => void;
}

interface ConfirmDialogState {
  open: boolean;
  usuarioId: string | null;
  usuarioNombre: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

export const useEliminarUsuario = ({
  onUsuarioEliminado,
}: UseEliminarUsuarioProps = {}) => {
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false,
    usuarioId: null,
    usuarioNombre: '',
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleClickEliminar = (id: string, nombre: string) => {
    console.log('Eliminando usuario:', { id, nombre });
    setConfirmDialog({
      open: true,
      usuarioId: id,
      usuarioNombre: nombre,
    });
  };

  const handleConfirmEliminar = async () => {
    if (!confirmDialog.usuarioId) {
      console.error('No hay ID de usuario para eliminar');
      return;
    }

    console.log('Confirmando eliminación de usuario:', {
      id: confirmDialog.usuarioId,
      nombre: confirmDialog.usuarioNombre,
    });

    setLoading(true);
    try {
      const url = `/api/usuarios/${confirmDialog.usuarioId}`;
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
          message: `Usuario "${confirmDialog.usuarioNombre}" eliminado exitosamente`,
          severity: 'success',
        });
        onUsuarioEliminado?.();
      } else {
        console.error('Error en respuesta del servidor:', data);
        setSnackbar({
          open: true,
          message: data.error || 'Error al eliminar el usuario',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      setSnackbar({
        open: true,
        message: 'Error de conexión al eliminar el usuario',
        severity: 'error',
      });
    } finally {
      setLoading(false);
      setConfirmDialog({
        open: false,
        usuarioId: null,
        usuarioNombre: '',
      });
    }
  };

  const handleCancelEliminar = () => {
    setConfirmDialog({
      open: false,
      usuarioId: null,
      usuarioNombre: '',
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
